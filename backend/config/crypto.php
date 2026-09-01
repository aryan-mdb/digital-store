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
    'provider' => env('CRYPTO_PAYMENT_PROVIDER', 'coinbase_commerce'),

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
