<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CryptoPayment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'order_id',
        'user_id',
        'payment_provider',
        'cryptocurrency',
        'wallet_address',
        'amount',
        'crypto_amount',
        'transaction_id',
        'payment_url',
        'status',
        'expires_at',
        'paid_at',
        'response_data',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'crypto_amount' => 'decimal:8',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'response_data' => 'array',
        ];
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_PENDING
            && $this->expires_at !== null
            && $this->expires_at->isPast();
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
