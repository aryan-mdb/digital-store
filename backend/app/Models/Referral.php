<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_REWARDED = 'rewarded';

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'reward_percentage',
        'reward_amount',
        'order_id',
        'status',
        'rewarded_at',
    ];

    protected function casts(): array
    {
        return [
            'reward_percentage' => 'decimal:2',
            'reward_amount' => 'decimal:2',
            'rewarded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
