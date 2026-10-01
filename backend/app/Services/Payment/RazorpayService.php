<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Services\StoreSettings;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin wrapper over Razorpay's Orders API + checkout signature checks.
 * Uses the REST API directly (Basic auth) so no SDK dependency is needed.
 */
class RazorpayService
{
    private const API_BASE = 'https://api.razorpay.com/v1';

    public function __construct(private readonly StoreSettings $settings)
    {
    }

    /**
     * Creates (once) the Razorpay order backing our order and returns its id.
     */
    public function createOrder(Order $order): string
    {
        if ($order->razorpay_order_id) {
            return $order->razorpay_order_id;
        }

        $response = Http::withBasicAuth($this->keyId(), $this->keySecret())
            ->acceptJson()
            ->post(self::API_BASE.'/orders', [
                // Razorpay amounts are in the currency's smallest unit (paise/cents).
                'amount' => (int) round((float) $order->total_amount * 100),
                'currency' => strtoupper($order->currency ?: 'INR'),
                'receipt' => $order->order_number,
                'notes' => ['order_id' => (string) $order->id],
            ]);

        if (! $response->successful() || ! $response->json('id')) {
            throw new RuntimeException(
                'Could not start Razorpay payment: '.($response->json('error.description') ?? 'gateway error')
            );
        }

        $order->update(['razorpay_order_id' => $response->json('id')]);

        return $order->razorpay_order_id;
    }

    /**
     * Verifies the signature Razorpay Checkout hands back to the browser —
     * proves the payment id genuinely belongs to our Razorpay order.
     */
    public function verifySignature(string $razorpayOrderId, string $razorpayPaymentId, string $signature): bool
    {
        $expected = hash_hmac('sha256', $razorpayOrderId.'|'.$razorpayPaymentId, $this->keySecret());

        return hash_equals($expected, $signature);
    }

    /**
     * Verifies the X-Razorpay-Signature header on webhooks.
     */
    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        $secret = config('services.razorpay.webhook_secret');

        if (! $secret || ! $signature) {
            return false;
        }

        return hash_equals(hash_hmac('sha256', $payload, $secret), $signature);
    }

    /**
     * Checks a key pair against Razorpay before the admin saves it, so a
     * typo shows up in Settings instead of at a customer's checkout.
     */
    public function credentialsAreValid(string $keyId, string $keySecret): bool
    {
        $response = Http::withBasicAuth($keyId, $keySecret)
            ->acceptJson()
            ->timeout(15)
            ->get(self::API_BASE.'/orders', ['count' => 1]);

        return $response->successful();
    }

    public function keyId(): string
    {
        return (string) $this->settings->razorpayKeyId();
    }

    private function keySecret(): string
    {
        return (string) $this->settings->razorpayKeySecret();
    }
}
