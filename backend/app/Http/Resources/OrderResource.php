<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user' => new UserResource($this->whenLoaded('user')),
            'total_amount' => (float) $this->total_amount,
            'wallet_amount_used' => (float) $this->wallet_amount_used,
            'currency' => $this->currency,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'razorpay_order_id' => $this->razorpay_order_id,
            'razorpay_payment_id' => $this->razorpay_payment_id,
            'shipping' => $this->shipping_address ? [
                'name' => $this->shipping_name,
                'phone' => $this->shipping_phone,
                'address' => $this->shipping_address,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'pincode' => $this->shipping_pincode,
            ] : null,
            'tracking' => $this->shipping_address ? [
                'status' => $this->tracking_status,
                'current_location' => $this->current_location,
                'lat' => $this->current_lat,
                'lng' => $this->current_lng,
                'events' => $this->whenLoaded('trackingEvents', fn () => $this->trackingEvents->map(fn ($e) => [
                    'id' => $e->id,
                    'status' => $e->status,
                    'location' => $e->location,
                    'note' => $e->note,
                    'lat' => $e->lat,
                    'lng' => $e->lng,
                    'created_at' => $e->created_at,
                ])),
            ] : null,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'crypto_payment' => new CryptoPaymentResource($this->whenLoaded('cryptoPayment')),
            'created_at' => $this->created_at,
        ];
    }
}
