<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Referral\ReferralService;
use Illuminate\Http\Request;

class ReferralSettingController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ReferralService $referrals)
    {
    }

    public function show()
    {
        return $this->success([
            'reward_percentage' => $this->referrals->currentRewardPercentage(),
        ], 'OK');
    }

    public function update(Request $request)
    {
        $request->validate([
            'reward_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        Setting::set(ReferralService::SETTING_KEY, $request->float('reward_percentage'));

        return $this->success([
            'reward_percentage' => $this->referrals->currentRewardPercentage(),
        ], 'Referral reward percentage updated successfully');
    }
}
