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
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'crypto_payment' => new CryptoPaymentResource($this->whenLoaded('cryptoPayment')),
            'created_at' => $this->created_at,
        ];
    }
}
