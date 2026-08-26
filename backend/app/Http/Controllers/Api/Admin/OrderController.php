<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * All orders across all users, with filtering — the admin "Orders" page.
     */
    public function index(Request $request)
    {
        $query = Order::with('user', 'items.product', 'cryptoPayment');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status'));
        }

        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%'.$request->string('search').'%');
        }

        $orders = $query->latest()->paginate($request->integer('per_page', 15));

        return $this->success($orders->through(fn ($o) => new OrderResource($o)), 'OK');
    }

    public function show(Order $order)
    {
        $order->load('user', 'items.product', 'cryptoPayments');

        return $this->success(new OrderResource($order), 'OK');
    }
}
