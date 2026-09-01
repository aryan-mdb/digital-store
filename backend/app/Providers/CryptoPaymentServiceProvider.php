<?php

namespace App\Providers;

use App\Services\Payment\CoinbaseCommercePaymentService;
use App\Services\Payment\CryptoPaymentServiceInterface;
use App\Services\Payment\NowPaymentsPaymentService;
use Illuminate\Support\ServiceProvider;

class CryptoPaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CryptoPaymentServiceInterface::class, function () {
            $provider = config('crypto.provider');

            // To add another gateway (BTCPay, ...): implement
            // CryptoPaymentServiceInterface, add its config block to
            // config/crypto.php, and add a case here. Nothing else changes.
            return match ($provider) {
                'now_payments' => new NowPaymentsPaymentService(
                    apiKey: (string) config('crypto.now_payments.api_key'),
                    ipnSecret: (string) config('crypto.now_payments.ipn_secret'),
                    baseUrl: (string) config('crypto.now_payments.base_url'),
                    payCurrency: (string) config('crypto.now_payments.pay_currency'),
                    expiryMinutes: (int) config('crypto.expiry_minutes'),
                ),
                // Kept for reference — Coinbase Commerce was permanently
                // shut down (March 2026) and no longer works.
                'coinbase_commerce' => new CoinbaseCommercePaymentService(
                    apiKey: (string) config('crypto.coinbase_commerce.api_key'),
                    apiSecret: (string) config('crypto.coinbase_commerce.api_secret'),
                    webhookSecret: (string) config('crypto.coinbase_commerce.webhook_secret'),
                    baseUrl: (string) config('crypto.coinbase_commerce.base_url'),
                    expiryMinutes: (int) config('crypto.expiry_minutes'),
                ),
                default => throw new \RuntimeException(
                    "Unsupported crypto payment provider [{$provider}]."
                ),
            };
        });
    }
}
