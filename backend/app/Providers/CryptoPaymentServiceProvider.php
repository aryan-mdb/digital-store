<?php

namespace App\Providers;

use App\Services\Payment\CoinbaseCommercePaymentService;
use App\Services\Payment\CryptoPaymentServiceInterface;
use Illuminate\Support\ServiceProvider;

class CryptoPaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CryptoPaymentServiceInterface::class, function () {
            $provider = config('crypto.provider');

            // To add another gateway (NowPayments, BTCPay, ...): implement
            // CryptoPaymentServiceInterface, add its config block to
            // config/crypto.php, and add a case here. Nothing else changes.
            return match ($provider) {
                'coinbase_commerce' => new CoinbaseCommercePaymentService(
                    apiKey: (string) config('crypto.coinbase_commerce.api_key'),
                    webhookSecret: (string) config('crypto.coinbase_commerce.webhook_secret'),
                    baseUrl: (string) config('crypto.coinbase_commerce.base_url'),
                    expiryMinutes: (int) config('crypto.expiry_minutes'),
                ),
                default => throw new \RuntimeException("Unsupported crypto payment provider [{$provider}]."),
            };
        });
    }
}
