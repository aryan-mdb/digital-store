<?php

namespace App\Services\Payment;

use App\Models\CryptoPayment;
use App\Models\Order;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Coinbase Commerce implementation of CryptoPaymentServiceInterface.
 *
 * API docs: https://docs.cdp.coinbase.com/commerce-onchain/docs/getting-started
 */
class CoinbaseCommercePaymentService implements CryptoPaymentServiceInterface
{
    /** Preferred currency order when a charge exposes several addresses. */
    private const CURRENCY_PRIORITY = ['USDC', 'USDT', 'BTC', 'ETH', 'LTC', 'BCH', 'DAI'];

    private readonly Client $client;

    public function __construct(
        private string $apiKey,
        private string $apiSecret,
        private string $webhookSecret,
        private string $baseUrl,
        private int $expiryMinutes,
    ) {
        $this->client = new Client([
            'base_uri' => rtrim($this->baseUrl, '/') . '/',
            'timeout' => 15,
        ]);
    }

    public function createPayment(Order $order): CryptoPayment
    {
        $payload = [
            'name' => 'Order ' . $order->order_number,
            'description' => 'Digital marketplace order ' . $order->order_number,
            'pricing_type' => 'fixed_price',
            'local_price' => [
                'amount' => number_format((float) $order->total_amount, 2, '.', ''),
                'currency' => $order->currency,
            ],
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
                'user_id' => (string) $order->user_id,
            ],
        ];

        $expiresAt = Carbon::now()->addMinutes($this->expiryMinutes);
        $currency = null;
        $address = null;
        $cryptoAmount = null;
        $chargeId = null;
        $hostedUrl = null;
        $responseData = null;

        try {
            $response = $this->client->post('charges', [
                'headers' => [
                    'X-CC-Api-Key' => $this->apiKey,
                    'X-CC-Version' => '2018-03-22',
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $body = json_decode((string) $response->getBody(), true);
            $data = $body['data'] ?? [];
            $responseData = $data;

            $chargeId = $data['id'] ?? $data['code'] ?? null;
            $hostedUrl = $data['hosted_url'] ?? null;

            if (! empty($data['expires_at'])) {
                $expiresAt = Carbon::parse($data['expires_at']);
            }

            [$currency, $address, $cryptoAmount] = $this->pickPreferredAddress($data);
        } catch (GuzzleException $e) {
            // Never trust the frontend / fail silently — keep the payment as
            // "pending" with no address so the UI can show a clear retry state,
            // and log the failure for the admin/ops side.
            Log::error('Coinbase Commerce charge creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }

        return CryptoPayment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_provider' => 'coinbase_commerce',
            'cryptocurrency' => $currency,
            'wallet_address' => $address,
            'amount' => $order->total_amount,
            'crypto_amount' => $cryptoAmount,
            'transaction_id' => $chargeId,
            'payment_url' => $hostedUrl,
            'status' => CryptoPayment::STATUS_PENDING,
            'expires_at' => $expiresAt,
            'response_data' => $responseData,
        ]);
    }

    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        if (empty($signature) || empty($this->webhookSecret)) {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $this->webhookSecret);

        return hash_equals($expected, $signature);
    }

    public function handleWebhookPayload(array $payload): ?CryptoPayment
    {
        $event = $payload['event'] ?? $payload;
        $type = $event['type'] ?? null;
        $data = $event['data'] ?? [];
        $chargeId = $data['id'] ?? $data['code'] ?? null;

        if (! $chargeId) {
            return null;
        }

        $payment = CryptoPayment::where('transaction_id', $chargeId)->first();

        if (! $payment) {
            return null;
        }

        $status = match ($type) {
            'charge:confirmed', 'charge:resolved' => CryptoPayment::STATUS_PAID,
            'charge:failed' => CryptoPayment::STATUS_FAILED,
            'charge:delayed' => CryptoPayment::STATUS_PENDING,
            default => $payment->status,
        };

        if ($status === CryptoPayment::STATUS_PAID && $payment->status !== CryptoPayment::STATUS_PAID) {
            $payment->paid_at = Carbon::now();
        }

        $payment->status = $status;
        $payment->response_data = array_merge($payment->response_data ?? [], ['last_webhook' => $event]);
        $payment->save();

        $this->syncOrder($payment);

        return $payment;
    }

    public function refreshStatus(CryptoPayment $payment): CryptoPayment
    {
        if (! $payment->transaction_id) {
            return $payment;
        }

        try {
            $response = $this->client->get('charges/' . $payment->transaction_id, [
                'headers' => [
                    'X-CC-Api-Key' => $this->apiKey,
                    'X-CC-Version' => '2018-03-22',
                    'Accept' => 'application/json',
                ],
            ]);

            $body = json_decode((string) $response->getBody(), true);
            $data = $body['data'] ?? [];
            $timeline = $data['timeline'] ?? [];
            $lastStatus = end($timeline)['status'] ?? null;

            $status = match ($lastStatus) {
                'COMPLETED', 'RESOLVED' => CryptoPayment::STATUS_PAID,
                'EXPIRED' => CryptoPayment::STATUS_EXPIRED,
                'CANCELED' => CryptoPayment::STATUS_FAILED,
                default => $payment->status,
            };

            if ($status === CryptoPayment::STATUS_PAID && $payment->status !== CryptoPayment::STATUS_PAID) {
                $payment->paid_at = Carbon::now();
            }

            $payment->status = $status;
            $payment->response_data = array_merge($payment->response_data ?? [], ['last_poll' => $data]);
            $payment->save();

            $this->syncOrder($payment);
        } catch (GuzzleException $e) {
            Log::warning('Coinbase Commerce status refresh failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $payment;
    }

    /**
     * @return array{0: ?string, 1: ?string, 2: ?float}
     */
    private function pickPreferredAddress(array $data): array
    {
        $addresses = $data['addresses'] ?? [];
        $pricing = $data['pricing'] ?? [];

        if (empty($addresses)) {
            return [null, null, null];
        }

        foreach (self::CURRENCY_PRIORITY as $currency) {
            $key = strtolower($currency);
            if (isset($addresses[$key])) {
                $amount = isset($pricing[$key]['amount']) ? (float) $pricing[$key]['amount'] : null;

                return [$currency, $addresses[$key], $amount];
            }
        }

        // Fall back to whatever the provider returned first.
        $key = array_key_first($addresses);
        $amount = isset($pricing[$key]['amount']) ? (float) $pricing[$key]['amount'] : null;

        return [strtoupper($key), $addresses[$key], $amount];
    }

    private function syncOrder(CryptoPayment $payment): void
    {
        $order = $payment->order;

        if (! $order) {
            return;
        }

        match ($payment->status) {
            CryptoPayment::STATUS_PAID => $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'status' => Order::STATUS_COMPLETED,
            ]),
            CryptoPayment::STATUS_FAILED => $order->update([
                'payment_status' => Order::PAYMENT_FAILED,
                'status' => Order::STATUS_FAILED,
            ]),
            CryptoPayment::STATUS_EXPIRED => $order->update([
                'payment_status' => Order::PAYMENT_EXPIRED,
            ]),
            default => null,
        };
    }
}
