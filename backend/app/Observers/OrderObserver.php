<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\Referral\ReferralService;

class OrderObserver
{
    public function __construct(private readonly ReferralService $referrals)
    {
    }

    /**
     * Handles an order created already paid (e.g. fully covered by wallet
     * balance at checkout, so there's no separate "payment" step).
     */
    public function created(Order $order): void
    {
        if ($order->payment_status === Order::PAYMENT_PAID) {
            $this->referrals->rewardForOrder($order);
        }
    }

    /**
     * Handles an order transitioning to paid later (e.g. crypto payment
     * confirmed via webhook or status poll).
     */
    public function updated(Order $order): void
    {
        if ($order->wasChanged('payment_status') && $order->payment_status === Order::PAYMENT_PAID) {
            $this->referrals->rewardForOrder($order);
        }
    }
}
