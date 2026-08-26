<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Create a pending order (+ its single order_item) for one digital
     * product. Wrapped in a transaction so the order and its item are
     * always created together.
     */
    public function createForProduct(User $user, Product $product): Order
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

        return DB::transaction(function () use ($user, $product) {
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'total_amount' => $product->price,
                'currency' => $product->currency,
                'status' => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_PENDING,
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'price' => $product->price,
                'quantity' => 1,
            ]);

            return $order->load('items.product');
        });
    }
}
