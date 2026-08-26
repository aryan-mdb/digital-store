<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DownloadController extends Controller
{
    use ApiResponse;

    /**
     * Secure download of a purchased digital product.
     *
     * Verifies, in order: authentication (route middleware), the order
     * belongs to the requesting user (or they're admin), the order's
     * payment is completed, the product is still attached to the order,
     * and the underlying file still exists on the private disk.
     */
    public function __invoke(Request $request, OrderItem $orderItem)
    {
        $orderItem->load('order', 'product');
        $order = $orderItem->order;
        $product = $orderItem->product;
        $user = $request->user();

        if (! $order || $order->user_id !== $user->id) {
            if (! $user->isAdmin()) {
                return $this->error('This order does not belong to your account.', null, 403);
            }
        }

        if (! $order || ! $order->isPaid()) {
            return $this->error('Payment for this order has not been completed yet.', null, 403);
        }

        if (! $product) {
            return $this->error('The product for this order item no longer exists.', null, 404);
        }

        if (! $product->product_file || ! Storage::disk('local')->exists($product->product_file)) {
            return $this->error('The product file is currently unavailable. Please contact support.', null, 404);
        }

        $filename = $product->slug.'.'.pathinfo($product->product_file, PATHINFO_EXTENSION);

        return Storage::disk('local')->download($product->product_file, $filename);
    }
}
