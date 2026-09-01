<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReferralResource;
use App\Models\Referral;
use App\Services\Referral\ReferralService;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ReferralService $referrals)
    {
    }

    public function show(Request $request)
    {
        $user = $request->user();
        $code = $this->referrals->ensureCode($user);

        $referrals = Referral::where('referrer_id', $user->id)
            ->with('referred')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $totalEarned = Referral::where('referrer_id', $user->id)
            ->where('status', Referral::STATUS_REWARDED)
            ->sum('reward_amount');

        return $this->success([
            'referral_code' => $code,
            'reward_percentage' => (float) config('referral.reward_percentage'),
            'total_referred' => Referral::where('referrer_id', $user->id)->count(),
            'total_earned' => (float) $totalEarned,
            'referrals' => $referrals->through(fn ($r) => new ReferralResource($r)),
        ], 'OK');
    }
}
