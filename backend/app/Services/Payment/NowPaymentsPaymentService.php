<?php

namespace App\Services\Payment;

use App\Models\CryptoPayment;
use App\Models\Order;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * NOWPayments implementation of CryptoPaymentServiceInterface.
 *
 * API docs: https://documenter.getpostman.com/view/7907941/S1a32n38
 * (Replaces Coinbase Commerce, which was permanently shut down.)
 */
class NowPaymentsPaymentService implements CryptoPaymentServiceInterface
{
    private readonly Client $client;

    public function __construct(
        private string $apiKey,
        private string $ipnSecret,
        private string $baseUrl,
        private string $payCurrency,
        private int $expiryMinutes,
    ) {
        $this->client = new Client([
            'base_uri' => rtrim($this->baseUrl, '/') . '/',
            'timeout' => 15,
        ]);
    }

    public function createPayment(Order $order): CryptoPayment
    {
        $expiresAt = Carbon::now()->addMinutes($this->expiryMinutes);
        $data = [];

        try {
            $response = $this->client->post('v1/payment', [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'price_amount' => (float) $order->total_amount,
                    'price_currency' => strtolower($order->currency),
                    'pay_currency' => $this->payCurrency,
                    'order_id' => $order->order_number,
                    'order_description' => 'Digital marketplace order ' . $order->order_number,
                    'ipn_callback_url' => rtrim(config('app.url'), '/') . '/api/payments/crypto/webhook',
                ],
            ]);

            $data = json_decode((string) $response->getBody(), true) ?? [];

            $chargeId = $data['payment_id'] ?? null;
            $currency = ! empty($data['pay_currency']) ? strtoupper($data['pay_currency']) : null;
            $address = $data['pay_address'] ?? null;
            $cryptoAmount = isset($data['pay_amount']) ? (float) $data['pay_amount'] : null;

            if (! empty($data['expiration_estimate_date'])) {
                $expiresAt = Carbon::parse($data['expiration_estimate_date']);
            }
        } catch (GuzzleException $e) {
            // Do NOT silently persist a broken "pending" payment with no
            // address/charge id — that leaves the frontend polling forever
            // with nothing to show. Log for ops and surface a real error to
            // the caller instead, so the UI can show a retry state.
            Log::error('NOWPayments charge creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException(
                'Unable to create the crypto payment with the payment gateway. Please try again shortly.',
                previous: $e,
            );
        }

        return CryptoPayment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'payment_provider' => 'now_payments',
            'cryptocurrency' => $currency,
            'wallet_address' => $address,
            'amount' => $order->total_amount,
            'crypto_amount' => $cryptoAmount,
            'transaction_id' => $chargeId,
            // NOWPayments' direct /v1/payment endpoint has no hosted page;
            // that only exists via the separate /v1/invoice endpoint.
            'payment_url' => null,
            'status' => CryptoPayment::STATUS_PENDING,
            'expires_at' => $expiresAt,
            'response_data' => $data,
        ]);
    }

    /**
     * NOWPayments signs the deep-key-sorted JSON body with HMAC-SHA512 using
     * the IPN secret, sent in the X-Nowpayments-Sig header.
     */
    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        if (empty($signature) || empty($this->ipnSecret)) {
            return false;
        }

        $decoded = json_decode($payload, true);

        if (! is_array($decoded)) {
            return false;
        }

        $canonical = json_encode($this->sortKeysDeep($decoded), JSON_UNESCAPED_SLASHES);
        $expected = hash_hmac('sha512', (string) $canonical, $this->ipnSecret);

        return hash_equals($expected, $signature);
    }

    public function handleWebhookPayload(array $payload): ?CryptoPayment
    {
        $chargeId = $payload['payment_id'] ?? null;

        if (! $chargeId) {
            return null;
        }

        $payment = CryptoPayment::where('transaction_id', $chargeId)->first();

        if (! $payment) {
            return null;
        }

        $status = $this->mapStatus($payload['payment_status'] ?? null, $payment->status);

        if ($status === CryptoPayment::STATUS_PAID && $payment->status !== CryptoPayment::STATUS_PAID) {
            $payment->paid_at = Carbon::now();
        }

        $payment->status = $status;
        $payment->response_data = array_merge($payment->response_data ?? [], ['last_webhook' => $payload]);
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
            $response = $this->client->get('v1/payment/' . $payment->transaction_id, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'Accept' => 'application/json',
                ],
            ]);

            $data = json_decode((string) $response->getBody(), true) ?? [];
            $status = $this->mapStatus($data['payment_status'] ?? null, $payment->status);

            if ($status === CryptoPayment::STATUS_PAID && $payment->status !== CryptoPayment::STATUS_PAID) {
                $payment->paid_at = Carbon::now();
            }

            $payment->status = $status;
            $payment->response_data = array_merge($payment->response_data ?? [], ['last_poll' => $data]);
            $payment->save();

            $this->syncOrder($payment);
        } catch (GuzzleException $e) {
            Log::warning('NOWPayments status refresh failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $payment;
    }

    /**
     * Map a raw NOWPayments payment_status to our internal CryptoPayment status.
     * Raw values: waiting, confirming, confirmed, sending, partially_paid,
     * finished, failed, refunded, expired.
     */
    private function mapStatus(?string $rawStatus, string $fallback): string
    {
        return match ($rawStatus) {
            'finished' => CryptoPayment::STATUS_PAID,
            'failed' => CryptoPayment::STATUS_FAILED,
            'expired' => CryptoPayment::STATUS_EXPIRED,
            'waiting', 'confirming', 'confirmed', 'sending', 'partially_paid' => CryptoPayment::STATUS_PENDING,
            default => $fallback,
        };
    }

    private function sortKeysDeep(array $data): array
    {
        ksort($data);

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->sortKeysDeep($value);
            }
        }

        return $data;
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
