<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_FAILED = 'failed';

    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_FAILED = 'failed';
    public const PAYMENT_EXPIRED = 'expired';

    public const METHOD_CRYPTO = 'crypto';
    public const METHOD_RAZORPAY = 'razorpay';
    public const METHOD_COD = 'cod';
    public const METHOD_WALLET = 'wallet';

    /** Delivery stages, in order. "cancelled" is terminal and off the happy path. */
    public const TRACKING_STAGES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    public const TRACKING_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'wallet_amount_used',
        'currency',
        'status',
        'payment_status',
        'payment_method',
        'razorpay_order_id',
        'razorpay_payment_id',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_pincode',
        'tracking_status',
        'current_location',
        'current_lat',
        'current_lng',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'wallet_amount_used' => 'decimal:2',
            'current_lat' => 'float',
            'current_lng' => 'float',
        ];
    }

    public static function generateOrderNumber(): string
    {
        return 'ORD-'.now()->format('ymd').'-'.strtoupper(Str::random(6));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasOne<CryptoPayment, $this>
     */
    public function cryptoPayment(): HasOne
    {
        return $this->hasOne(CryptoPayment::class)->latestOfMany();
    }

    /**
     * @return HasMany<CryptoPayment, $this>
     */
    public function cryptoPayments(): HasMany
    {
        return $this->hasMany(CryptoPayment::class);
    }

    /**
     * @return HasMany<OrderTrackingEvent, $this>
     */
    public function trackingEvents(): HasMany
    {
        return $this->hasMany(OrderTrackingEvent::class)->orderBy('created_at')->orderBy('id');
    }

    public function hasShipping(): bool
    {
        return ! empty($this->shipping_address);
    }

    /**
     * Appends a tracking event and mirrors it onto the order's "current"
     * columns so list views don't need to load the full history.
     */
    public function addTrackingEvent(string $status, ?string $location = null, ?string $note = null, ?float $lat = null, ?float $lng = null): OrderTrackingEvent
    {
        $event = $this->trackingEvents()->create(compact('status', 'location', 'note', 'lat', 'lng'));

        $this->forceFill([
            'tracking_status' => $status,
            'current_location' => $location ?? $this->current_location,
            'current_lat' => $lat ?? $this->current_lat,
            'current_lng' => $lng ?? $this->current_lng,
        ])->save();

        return $event;
    }

    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }
}
