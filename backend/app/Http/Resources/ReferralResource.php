<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'referred_user_name' => $this->whenLoaded('referred', fn () => $this->referred->name),
            'status' => $this->status,
            'reward_percentage' => (float) $this->reward_percentage,
            'reward_amount' => $this->reward_amount !== null ? (float) $this->reward_amount : null,
            'rewarded_at' => $this->rewarded_at,
            'created_at' => $this->created_at,
        ];
    }
}
