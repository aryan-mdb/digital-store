<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private readonly WalletService $wallet)
    {
    }

    /**
     * Create a pending order (+ its single order_item) for one digital
     * product. Wrapped in a transaction so the order and its item are
     * always created together.
     *
     * If $useWallet is true, as much of the price as possible is covered
     * by the user's wallet balance. When it covers the full price the
     * order is created already paid/completed (no crypto payment needed).
     */
    public function createForProduct(User $user, Product $product, bool $useWallet = false): Order
    {
        if ($product->status !== Product::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'product' => 'This product is not currently available.',
            ]);
        }

        if ($product->isPurchasedBy($user)) {
            throw ValidationException::withMessages([
                'product' => 'You already own this product.',
            ]);
        }

        return DB::transaction(function () use ($user, $product, $useWallet) {
            $price = (float) $product->price;
            $walletAmountUsed = 0.0;

            if ($useWallet) {
                $wallet = $this->wallet->walletFor($user);
                $walletAmountUsed = min((float) $wallet->balance, $price);
            }

            $remaining = round($price - $walletAmountUsed, 2);
            $isFullyCovered = $walletAmountUsed > 0 && $remaining <= 0;

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'total_amount' => $remaining,
                'wallet_amount_used' => $walletAmountUsed,
                'currency' => $product->currency,
                'status' => $isFullyCovered ? Order::STATUS_COMPLETED : Order::STATUS_PENDING,
                'payment_status' => $isFullyCovered ? Order::PAYMENT_PAID : Order::PAYMENT_PENDING,
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'price' => $product->price,
                'quantity' => 1,
            ]);

            if ($walletAmountUsed > 0) {
                $this->wallet->debit(
                    $user,
                    $walletAmountUsed,
                    WalletTransaction::SOURCE_ORDER_REDEMPTION,
                    $order->id,
                    "Applied to order {$order->order_number}"
                );
            }

            return $order->load('items.product');
        });
    }
}
