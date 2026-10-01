<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

/**
 * Admin-editable storefront settings: which payment methods are offered
 * at checkout, Razorpay API keys and the WhatsApp contact details.
 *
 * Razorpay keys come from .env when set there (RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET); otherwise from the admin panel, where the secret
 * is stored encrypted with APP_KEY and is never sent back to the browser.
 */
class StoreSettings
{
    public const PAYMENT_METHODS = ['razorpay', 'cod', 'crypto'];

    private const DEFAULTS = [
        'payment_razorpay_enabled' => '1',
        'payment_cod_enabled' => '1',
        'payment_crypto_enabled' => '1',
        'whatsapp_enabled' => '1',
        'whatsapp_number' => '',
        'whatsapp_message' => 'Hello! I have a question about your products.',
    ];

    public function isMethodEnabled(string $method): bool
    {
        if ($method === 'razorpay' && ! $this->razorpayConfigured()) {
            return false;
        }

        return $this->bool("payment_{$method}_enabled");
    }

    public function razorpayConfigured(): bool
    {
        return filled($this->razorpayKeyId()) && filled($this->razorpayKeySecret());
    }

    public function razorpayKeysFromEnv(): bool
    {
        return filled(config('services.razorpay.key_id')) && filled(config('services.razorpay.key_secret'));
    }

    public function razorpayKeyId(): ?string
    {
        if ($this->razorpayKeysFromEnv()) {
            return config('services.razorpay.key_id');
        }

        return Setting::get('razorpay_key_id') ?: null;
    }

    public function razorpayKeySecret(): ?string
    {
        if ($this->razorpayKeysFromEnv()) {
            return config('services.razorpay.key_secret');
        }

        $encrypted = Setting::get('razorpay_key_secret');

        if (! $encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (DecryptException) {
            return null; // APP_KEY rotated — the admin needs to re-enter the secret
        }
    }

    /** Full settings for the admin panel. Never includes the secret itself. */
    public function adminSettings(): array
    {
        return [
            'payment_methods' => collect(self::PAYMENT_METHODS)
                ->mapWithKeys(fn ($m) => [$m => $this->bool("payment_{$m}_enabled")])
                ->all(),
            'razorpay_configured' => $this->razorpayConfigured(),
            'razorpay_keys_from_env' => $this->razorpayKeysFromEnv(),
            'razorpay_key_id' => $this->razorpayKeyId(),
            'whatsapp_enabled' => $this->bool('whatsapp_enabled'),
            'whatsapp_number' => $this->get('whatsapp_number'),
            'whatsapp_message' => $this->get('whatsapp_message'),
        ];
    }

    /** What the storefront needs — only methods that will actually work. */
    public function publicSettings(): array
    {
        $number = $this->whatsappDigits();

        return [
            'payment_methods' => collect(self::PAYMENT_METHODS)
                ->mapWithKeys(fn ($m) => [$m => $this->isMethodEnabled($m)])
                ->all(),
            'razorpay_key_id' => $this->isMethodEnabled('razorpay') ? $this->razorpayKeyId() : null,
            'whatsapp' => [
                'enabled' => $this->bool('whatsapp_enabled') && $number !== '',
                'number' => $number,
                'message' => $this->get('whatsapp_message'),
            ],
        ];
    }

    public function update(array $data): void
    {
        foreach (self::PAYMENT_METHODS as $method) {
            if (array_key_exists($method, $data['payment_methods'] ?? [])) {
                Setting::set("payment_{$method}_enabled", $data['payment_methods'][$method] ? '1' : '0');
            }
        }

        if (array_key_exists('whatsapp_enabled', $data)) {
            Setting::set('whatsapp_enabled', $data['whatsapp_enabled'] ? '1' : '0');
        }

        foreach (['whatsapp_number', 'whatsapp_message'] as $key) {
            if (array_key_exists($key, $data)) {
                Setting::set($key, $data[$key] ?? '');
            }
        }
    }

    public function saveRazorpayKeys(string $keyId, string $keySecret): void
    {
        Setting::set('razorpay_key_id', $keyId);
        Setting::set('razorpay_key_secret', Crypt::encryptString($keySecret));
    }

    /**
     * wa.me needs the country code. A bare 10-digit Indian mobile number
     * (as most admins type it) gets +91 prepended.
     */
    private function whatsappDigits(): string
    {
        $digits = preg_replace('/\D+/', '', $this->get('whatsapp_number'));
        $digits = ltrim($digits, '0');

        return strlen($digits) === 10 ? '91'.$digits : $digits;
    }

    private function get(string $key): string
    {
        return (string) Setting::get($key, self::DEFAULTS[$key] ?? '');
    }

    private function bool(string $key): bool
    {
        return $this->get($key) === '1';
    }
}
