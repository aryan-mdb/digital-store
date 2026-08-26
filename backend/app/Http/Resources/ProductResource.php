<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'thumbnail_url' => $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null,
            'status' => $this->status,
            'has_file' => (bool) $this->product_file, // never expose the actual path/url
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_by' => $this->creator?->name,
            'is_purchased' => $this->when(
                $user !== null,
                fn () => $this->isPurchasedBy($user)
            ),
            'sales_count' => $this->when(isset($this->order_items_count), $this->order_items_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
