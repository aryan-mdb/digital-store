<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Order\OrderService;
use App\Services\Payment\RazorpayService;
use App\Services\StoreSettings;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RazorpayController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    public function __construct(
        private readonly RazorpayService $razorpay,
        private readonly OrderService $orders,
        private readonly StoreSettings $settings,
    ) {
    }

    /**
     * Returns everything Razorpay Checkout needs to open for this order.
     */
    public function create(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        if ($order->isPaid()) {
            return $this->error('This order has already been paid.', null, 409);
        }

        if ($order->payment_method !== Order::METHOD_RAZORPAY) {
            return $this->error('This order was not placed with Razorpay.', null, 422);
        }

        if (! $this->settings->isMethodEnabled(Order::METHOD_RAZORPAY)) {
            return $this->error('Razorpay payments are currently unavailable.', null, 503);
        }

        try {
            $razorpayOrderId = $this->razorpay->createOrder($order);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), null, 502);
        }

        $user = $request->user();

        return $this->success([
            'key_id' => $this->razorpay->keyId(),
            'razorpay_order_id' => $razorpayOrderId,
            'amount' => (int) round((float) $order->total_amount * 100),
            'currency' => strtoupper($order->currency ?: 'INR'),
            'name' => config('app.name'),
            'description' => 'Order '.$order->order_number,
            'prefill' => [
                'name' => $order->shipping_name ?? $user->name,
                'email' => $user->email,
                'contact' => $order->shipping_phone,
            ],
        ], 'OK');
    }

    /**
     * Called by the browser after Razorpay Checkout succeeds. The payment
     * is only accepted once the HMAC signature checks out server-side.
     */
    public function verify(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        $data = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        if ($data['razorpay_order_id'] !== $order->razorpay_order_id
            || ! $this->razorpay->verifySignature($data['razorpay_order_id'], $data['razorpay_payment_id'], $data['razorpay_signature'])) {
            Log::warning('Rejected Razorpay payment with invalid signature', ['order_id' => $order->id]);

            return $this->error('Payment verification failed. If money was deducted it will be refunded automatically.', null, 422);
        }

        $this->orders->markPaidViaRazorpay($order, $data['razorpay_payment_id']);

        return $this->success(
            new OrderResource($order->fresh()->load('items.product', 'trackingEvents')),
            'Payment successful!'
        );
    }

    /**
     * Backup path for buyers who close the tab before verify() runs.
     */
    public function webhook(Request $request)
    {
        if (! $this->razorpay->verifyWebhookSignature($request->getContent(), $request->header('X-Razorpay-Signature'))) {
            return $this->error('Invalid signature', null, 401);
        }

        $payment = $request->input('payload.payment.entity');

        if ($request->input('event') === 'payment.captured' && ! empty($payment['order_id'])) {
            $order = Order::where('razorpay_order_id', $payment['order_id'])->first();

            if ($order) {
                $this->orders->markPaidViaRazorpay($order, $payment['id']);
            }
        }

        return $this->success(['processed' => true], 'Webhook received');
    }
}
