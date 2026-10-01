<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

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

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->string('payment_method'));
        }

        if ($request->filled('tracking_status')) {
            $query->where('tracking_status', $request->string('tracking_status'));
        }

        if ($request->filled('search')) {
            $term = '%'.$request->string('search').'%';
            $query->where(fn ($q) => $q->where('order_number', 'like', $term)->orWhere('shipping_phone', 'like', $term));
        }

        $orders = $query->latest()->paginate($request->integer('per_page', 15));

        return $this->success($orders->through(fn ($o) => new OrderResource($o)), 'OK');
    }

    public function show(Order $order)
    {
        $order->load('user', 'items.product', 'cryptoPayments', 'trackingEvents');

        return $this->success(new OrderResource($order), 'OK');
    }

    /**
     * Push a delivery update: new stage, where the parcel is now, and
     * optionally its GPS position (shown on the customer's map).
     *
     * Delivering a COD order also records the cash as collected.
     */
    public function updateTracking(Request $request, Order $order)
    {
        if (! $order->hasShipping()) {
            return $this->error('This order has no delivery address to track.', null, 422);
        }

        $data = $request->validate([
            'status' => ['required', Rule::in([...Order::TRACKING_STAGES, Order::TRACKING_CANCELLED])],
            'location' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:500'],
            'lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:lat'],
        ]);

        DB::transaction(function () use ($order, $data) {
            $order->addTrackingEvent(
                $data['status'],
                $data['location'] ?? null,
                $data['note'] ?? null,
                isset($data['lat']) ? (float) $data['lat'] : null,
                isset($data['lng']) ? (float) $data['lng'] : null,
            );

            if ($data['status'] === 'delivered' && $order->payment_method === Order::METHOD_COD && ! $order->isPaid()) {
                $order->update(['payment_status' => Order::PAYMENT_PAID, 'status' => Order::STATUS_COMPLETED]);
            }

            if ($data['status'] === Order::TRACKING_CANCELLED && ! $order->isPaid()) {
                $order->update(['status' => Order::STATUS_CANCELLED]);
            }
        });

        return $this->success(
            new OrderResource($order->fresh()->load('user', 'items.product', 'trackingEvents')),
            'Tracking updated'
        );
    }

    /**
     * Live position ping (e.g. every minute from the delivery person's
     * phone). Moves the map pin without adding a timeline entry.
     */
    public function updateLocation(Request $request, Order $order)
    {
        if (! $order->hasShipping()) {
            return $this->error('This order has no delivery address to track.', null, 422);
        }

        $data = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $order->update([
            'current_lat' => (float) $data['lat'],
            'current_lng' => (float) $data['lng'],
            'current_location' => $data['location'] ?? $order->current_location,
        ]);

        return $this->success([
            'lat' => $order->current_lat,
            'lng' => $order->current_lng,
            'current_location' => $order->current_location,
        ], 'Location updated');
    }

    /**
     * Manually confirm cash was collected on a COD order (e.g. collected
     * before the "delivered" update was pushed).
     */
    public function markCodPaid(Order $order)
    {
        if ($order->payment_method !== Order::METHOD_COD) {
            return $this->error('Only Cash on Delivery orders can be marked as paid manually.', null, 422);
        }

        if (! $order->isPaid()) {
            $order->update(['payment_status' => Order::PAYMENT_PAID, 'status' => Order::STATUS_COMPLETED]);
        }

        return $this->success(
            new OrderResource($order->fresh()->load('user', 'items.product', 'trackingEvents')),
            'Cash payment recorded'
        );
    }
}
