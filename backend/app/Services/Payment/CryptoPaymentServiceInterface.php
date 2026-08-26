<?php

namespace App\Services\Payment;

use App\Models\CryptoPayment;
use App\Models\Order;

/**
 * Contract every crypto payment provider must implement.
 *
 * Swapping providers (Coinbase Commerce, NowPayments, BTCPay, ...) only
 * requires a new class implementing this interface plus a binding change
 * in App\Providers\CryptoPaymentServiceProvider — nothing else in the
 * application (controllers, jobs, tests) needs to change.
 */
interface CryptoPaymentServiceInterface
{
    /**
     * Create a hosted crypto invoice/charge for the given order and
     * persist the pending CryptoPayment record.
     */
    public function createPayment(Order $order): CryptoPayment;

    /**
     * Verify that an incoming webhook request really came from the
     * provider (HMAC/signature check). Must be constant-time safe.
     */
    public function verifyWebhookSignature(string $payload, ?string $signature): bool;

    /**
     * Translate a verified webhook payload into a status update on the
     * matching CryptoPayment (and cascade to the parent Order). Returns
     * the updated CryptoPayment, or null if no matching payment was found.
     */
    public function handleWebhookPayload(array $payload): ?CryptoPayment;

    /**
     * Actively re-check payment status with the provider (used as a
     * fallback when no webhook has arrived yet).
     */
    public function refreshStatus(CryptoPayment $payment): CryptoPayment;
}
