<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product?->name,
            'thumbnail_url' => $this->product ? (new ProductResource($this->product))->toArray($request)['thumbnail_url'] : null,
            'price' => (float) $this->price,
            'quantity' => $this->quantity,
            'can_download' => $this->order?->isPaid() ?? false,
        ];
    }
}
