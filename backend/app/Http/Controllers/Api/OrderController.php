<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\Order\OrderService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    public function __construct(private readonly OrderService $orders)
    {
    }

    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items.product', 'cryptoPayment')
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return $this->success($orders->through(fn ($o) => new OrderResource($o)), 'OK');
    }

    public function show(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        $order->load('items.product', 'cryptoPayment', 'user');

        return $this->success(new OrderResource($order), 'OK');
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')],
        ]);

        $product = Product::findOrFail($request->integer('product_id'));

        $order = $this->orders->createForProduct($request->user(), $product);

        return $this->success(new OrderResource($order), 'Order created successfully. Proceed to crypto payment.', 201);
    }
}
