<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\StoreSettings;
use Illuminate\Http\Request;

/**
 * Admin toggles for payment methods (Razorpay / COD / Crypto) and the
 * WhatsApp chat button.
 */
class StoreSettingController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly StoreSettings $settings)
    {
    }

    public function show()
    {
        return $this->success($this->settings->adminSettings(), 'OK');
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'payment_methods' => ['sometimes', 'array'],
            'payment_methods.razorpay' => ['sometimes', 'boolean'],
            'payment_methods.cod' => ['sometimes', 'boolean'],
            'payment_methods.crypto' => ['sometimes', 'boolean'],
            'whatsapp_enabled' => ['sometimes', 'boolean'],
            'whatsapp_number' => ['sometimes', 'nullable', 'string', 'regex:/^[0-9+\-\s]{0,20}$/'],
            'whatsapp_message' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $this->settings->update($data);

        $updated = $this->settings->adminSettings();

        if (! in_array(true, $updated['payment_methods'], true)) {
            return $this->success($updated, 'Saved — but every payment method is off, so customers cannot check out.');
        }

        return $this->success($updated, 'Store settings updated successfully');
    }
}
