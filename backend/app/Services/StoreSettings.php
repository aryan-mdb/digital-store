<?php

namespace App\Services;

use App\Models\Setting;

/**
 * Admin-editable storefront settings: which payment methods are offered
 * at checkout and the WhatsApp contact details. Razorpay's *secret* is
 * deliberately kept in .env only — never stored in or returned from the DB.
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
        return filled(config('services.razorpay.key_id')) && filled(config('services.razorpay.key_secret'));
    }

    /** Full settings for the admin panel. */
    public function adminSettings(): array
    {
        return [
            'payment_methods' => collect(self::PAYMENT_METHODS)
                ->mapWithKeys(fn ($m) => [$m => $this->bool("payment_{$m}_enabled")])
                ->all(),
            'razorpay_configured' => $this->razorpayConfigured(),
            'whatsapp_enabled' => $this->bool('whatsapp_enabled'),
            'whatsapp_number' => $this->get('whatsapp_number'),
            'whatsapp_message' => $this->get('whatsapp_message'),
        ];
    }

    /** What the storefront needs — only methods that will actually work. */
    public function publicSettings(): array
    {
        $number = preg_replace('/\D+/', '', $this->get('whatsapp_number'));

        return [
            'payment_methods' => collect(self::PAYMENT_METHODS)
                ->mapWithKeys(fn ($m) => [$m => $this->isMethodEnabled($m)])
                ->all(),
            'razorpay_key_id' => $this->isMethodEnabled('razorpay') ? config('services.razorpay.key_id') : null,
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

    private function get(string $key): string
    {
        return (string) Setting::get($key, self::DEFAULTS[$key] ?? '');
    }

    private function bool(string $key): bool
    {
        return $this->get($key) === '1';
    }
}
