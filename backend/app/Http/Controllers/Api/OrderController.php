<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\Order\OrderService;
use App\Services\StoreSettings;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    public function __construct(
        private readonly OrderService $orders,
        private readonly StoreSettings $settings,
    ) {
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

        $order->load('items.product', 'cryptoPayment', 'user', 'trackingEvents');

        return $this->success(new OrderResource($order), 'OK');
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')],
            'use_wallet' => ['sometimes', 'boolean'],
            'payment_method' => ['sometimes', Rule::in(StoreSettings::PAYMENT_METHODS)],
        ]);

        $product = Product::findOrFail($request->integer('product_id'));
        $method = $request->string('payment_method', Order::METHOD_CRYPTO)->toString();
        $isPhysical = ! $product->product_file;

        if (! $this->settings->isMethodEnabled($method)) {
            throw ValidationException::withMessages([
                'payment_method' => 'This payment method is currently unavailable. Please choose another.',
            ]);
        }

        if ($method === Order::METHOD_COD && ! $isPhysical) {
            throw ValidationException::withMessages([
                'payment_method' => 'Cash on Delivery is only available for products that are shipped.',
            ]);
        }

        // Shipped products need a delivery address, whichever way they're paid for.
        $shipping = $isPhysical
            ? $request->validate([
                'shipping.name' => ['required', 'string', 'max:255'],
                'shipping.phone' => ['required', 'string', 'regex:/^[0-9+\-\s]{7,20}$/'],
                'shipping.address' => ['required', 'string', 'max:500'],
                'shipping.city' => ['required', 'string', 'max:100'],
                'shipping.state' => ['required', 'string', 'max:100'],
                'shipping.pincode' => ['required', 'string', 'max:12'],
            ])['shipping']
            : [];

        $order = $this->orders->createForProduct(
            $request->user(),
            $product,
            $request->boolean('use_wallet'),
            $method,
            $shipping,
        );

        $message = match (true) {
            $order->isPaid() => 'Order placed and paid using your wallet balance.',
            $method === Order::METHOD_COD => 'Order placed! Pay in cash when it is delivered.',
            $method === Order::METHOD_RAZORPAY => 'Order created. Complete the payment with Razorpay.',
            default => 'Order created successfully. Proceed to crypto payment.',
        };

        return $this->success(new OrderResource($order), $message, 201);
    }

    /**
     * Public order tracking — needs the order number AND the phone the
     * order was placed with, so order numbers alone can't be enumerated.
     */
    public function track(Request $request)
    {
        $data = $request->validate([
            'order_number' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $digits = fn (?string $v) => substr(preg_replace('/\D+/', '', (string) $v), -10);

        $order = Order::with('items.product', 'trackingEvents')
            ->where('order_number', trim($data['order_number']))
            ->first();

        if (! $order || ! $order->shipping_phone || $digits($order->shipping_phone) !== $digits($data['phone'])) {
            return $this->error('No order found with that order number and phone number.', null, 404);
        }

        return $this->success(new OrderResource($order), 'OK');
    }
}
