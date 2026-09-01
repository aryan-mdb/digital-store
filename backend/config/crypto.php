<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Active crypto payment provider
    |--------------------------------------------------------------------------
    |
    | The key used to resolve the CryptoPaymentServiceInterface binding.
    | Add new providers in app/Providers/CryptoPaymentServiceProvider.php
    | without touching any controller or service that consumes the interface.
    |
    */
    // Coinbase Commerce was permanently shut down (March 2026), so
    // now_payments is the default. Keep the coinbase_commerce block below
    // around only for reference / in case a self-run instance still needs it.
    'provider' => env('CRYPTO_PAYMENT_PROVIDER', 'now_payments'),

    'now_payments' => [
        'api_key' => env('NOWPAYMENTS_API_KEY'),
        'ipn_secret' => env('NOWPAYMENTS_IPN_SECRET'),
        'base_url' => env(
            'NOWPAYMENTS_API_BASE_URL',
            'https://api.nowpayments.io'
        ),
        // Which crypto/network NOWPayments should generate a pay address
        // for. usdttrc20 = USDT on Tron (low fees, fast confirmation).
        'pay_currency' => env('NOWPAYMENTS_PAY_CURRENCY', 'usdttrc20'),
    ],

    'coinbase_commerce' => [
        'api_key' => env('CRYPTO_API_KEY'),
        'api_secret' => env('CRYPTO_API_SECRET'),
        'webhook_secret' => env('CRYPTO_WEBHOOK_SECRET'),
        'base_url' => env(
            'CRYPTO_API_BASE_URL',
            'https://api.commerce.coinbase.com'
        ),
    ],

    // How long a generated invoice stays valid before it expires.
    'expiry_minutes' => (int) env('CRYPTO_PAYMENT_EXPIRY_MINUTES', 15),
];
