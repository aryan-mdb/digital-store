<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CryptoPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'order_number' => $this->order?->order_number,
            'payment_provider' => $this->payment_provider,
            'cryptocurrency' => $this->cryptocurrency,
            'wallet_address' => $this->wallet_address,
            'amount' => (float) $this->amount,
            'crypto_amount' => $this->crypto_amount !== null ? (float) $this->crypto_amount : null,
            'transaction_id' => $this->transaction_id,
            'payment_url' => $this->payment_url,
            'status' => $this->status,
            'expires_at' => $this->expires_at,
            'seconds_remaining' => $this->expires_at
                ? max(0, (int) now()->diffInSeconds($this->expires_at, false))
                : null,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
        ];
    }
}
