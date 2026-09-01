<?php

namespace App\Services\Referral;

use App\Models\Order;
use App\Models\Referral;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Str;

class ReferralService
{
    public function __construct(private readonly WalletService $wallet)
    {
    }

    /**
     * Generate a short, unique, human-shareable referral code.
     */
    public function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Lazily backfill a referral code for users created before this feature
     * existed (or any user that somehow ended up without one).
     */
    public function ensureCode(User $user): string
    {
        if (! $user->referral_code) {
            $user->referral_code = $this->generateUniqueCode();
            $user->save();
        }

        return $user->referral_code;
    }

    /**
     * Link a freshly registered user to whoever referred them, if the
     * referral code they signed up with is valid. Silently no-ops on an
     * invalid/missing code — registration must never fail because of this.
     */
    public function attachReferral(User $newUser, ?string $referralCode): void
    {
        if (! $referralCode) {
            return;
        }

        $referrer = User::where('referral_code', $referralCode)->first();

        if (! $referrer || $referrer->id === $newUser->id) {
            return;
        }

        $newUser->referred_by = $referrer->id;
        $newUser->save();

        Referral::create([
            'referrer_id' => $referrer->id,
            'referred_id' => $newUser->id,
            'reward_percentage' => (float) config('referral.reward_percentage'),
            'status' => Referral::STATUS_PENDING,
        ]);
    }

    /**
     * Called whenever an order transitions to "paid". If this is the
     * referred user's first paid order, credit the referrer's wallet.
     */
    public function rewardForOrder(Order $order): void
    {
        $referral = Referral::where('referred_id', $order->user_id)
            ->where('status', Referral::STATUS_PENDING)
            ->first();

        if (! $referral) {
            return;
        }

        $paidOrderCount = Order::where('user_id', $order->user_id)
            ->where('payment_status', Order::PAYMENT_PAID)
            ->count();

        // Only reward the referrer on the referred user's very first
        // completed purchase.
        if ($paidOrderCount !== 1) {
            return;
        }

        $rewardAmount = round((float) $order->total_amount * ((float) $referral->reward_percentage / 100), 2);

        if ($rewardAmount <= 0) {
            return;
        }

        $this->wallet->credit(
            $referral->referrer,
            $rewardAmount,
            WalletTransaction::SOURCE_REFERRAL_REWARD,
            $referral->id,
            "Referral reward for order {$order->order_number}"
        );

        $referral->update([
            'reward_amount' => $rewardAmount,
            'order_id' => $order->id,
            'status' => Referral::STATUS_REWARDED,
            'rewarded_at' => now(),
        ]);
    }
}
