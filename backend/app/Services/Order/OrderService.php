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
     * Create a pending order (+ its single order_item) for one product.
     * Wrapped in a transaction so the order and its item are always
     * created together.
     *
     * If $useWallet is true, as much of the price as possible is covered
     * by the user's wallet balance. When it covers the full price the
     * order is created already paid/completed (no payment step needed).
     *
     * $paymentMethod is one of Order::METHOD_CRYPTO / METHOD_RAZORPAY /
     * METHOD_COD; $shipping is the delivery address (required by the
     * controller for Razorpay and COD orders).
     */
    public function createForProduct(
        User $user,
        Product $product,
        bool $useWallet = false,
        string $paymentMethod = Order::METHOD_CRYPTO,
        array $shipping = [],
    ): Order {
        if ($product->status !== Product::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'product' => 'This product is not currently available.',
            ]);
        }

        // Digital products can only be bought once; physical ones can be re-ordered.
        if ($product->product_file && $product->isPurchasedBy($user)) {
            throw ValidationException::withMessages([
                'product' => 'You already own this product.',
            ]);
        }

        return DB::transaction(function () use ($user, $product, $useWallet, $paymentMethod, $shipping) {
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
                'payment_method' => $isFullyCovered ? Order::METHOD_WALLET : $paymentMethod,
                ...$this->shippingColumns($shipping),
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

            // COD and wallet orders are confirmed immediately; Razorpay/crypto
            // orders only enter the delivery pipeline once payment succeeds.
            if ($order->hasShipping() && ($isFullyCovered || $paymentMethod === Order::METHOD_COD)) {
                $order->addTrackingEvent('placed', null, $paymentMethod === Order::METHOD_COD && ! $isFullyCovered
                    ? 'Order placed — Cash on Delivery'
                    : 'Order placed and paid');
            }

            return $order->load('items.product');
        });
    }

    /**
     * Marks a Razorpay payment as successful. Idempotent — the browser
     * callback and the webhook may both arrive. Delivery tracking is
     * started by OrderObserver once payment_status flips to paid.
     */
    public function markPaidViaRazorpay(Order $order, string $razorpayPaymentId): Order
    {
        if (! $order->isPaid()) {
            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'status' => Order::STATUS_COMPLETED,
                'razorpay_payment_id' => $razorpayPaymentId,
            ]);
        }

        return $order;
    }

    private function shippingColumns(array $shipping): array
    {
        if (empty($shipping['address'])) {
            return [];
        }

        return [
            'shipping_name' => $shipping['name'] ?? null,
            'shipping_phone' => $shipping['phone'] ?? null,
            'shipping_address' => $shipping['address'],
            'shipping_city' => $shipping['city'] ?? null,
            'shipping_state' => $shipping['state'] ?? null,
            'shipping_pincode' => $shipping['pincode'] ?? null,
        ];
    }
}
