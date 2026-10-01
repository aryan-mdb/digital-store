<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Payment\RazorpayService;
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

    /**
     * Save Razorpay API keys from the admin panel (used when they are not
     * set in the server's .env). Keys are verified with Razorpay first.
     */
    public function updateRazorpayKeys(Request $request, RazorpayService $razorpay)
    {
        $data = $request->validate([
            'key_id' => ['required', 'string', 'regex:/^rzp_(test|live)_[A-Za-z0-9]+$/'],
            'key_secret' => ['required', 'string', 'max:100'],
        ], [
            'key_id.regex' => 'The Key ID should look like rzp_test_xxxx or rzp_live_xxxx.',
        ]);

        $keyId = trim($data['key_id']);
        $keySecret = trim($data['key_secret']);

        if (! $razorpay->credentialsAreValid($keyId, $keySecret)) {
            return $this->error('Razorpay rejected these keys. Please copy the Key ID and Key Secret again from your Razorpay dashboard.', [
                'key_secret' => ['Razorpay rejected these keys.'],
            ], 422);
        }

        $this->settings->saveRazorpayKeys($keyId, $keySecret);

        return $this->success(
            $this->settings->adminSettings(),
            str_starts_with($keyId, 'rzp_test_')
                ? 'Razorpay connected in TEST mode — no real money will be charged.'
                : 'Razorpay connected in LIVE mode.'
        );
    }
}
