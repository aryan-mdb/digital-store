<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\StoreSettings;

/**
 * Public storefront config: enabled payment methods, Razorpay public
 * key and WhatsApp contact. Never includes secrets.
 */
class SiteSettingsController extends Controller
{
    use ApiResponse;

    public function __invoke(StoreSettings $settings)
    {
        return $this->success($settings->publicSettings(), 'OK');
    }
}
