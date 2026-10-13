<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'currency',
        'product_file',
        'thumbnail',
        'thumbnail_data',
        'thumbnail_mime',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name).'-'.Str::random(6);
            }

            $product->currency = self::normalizeCurrency($product->currency);
        });
    }

    /**
     * Payment gateways need an ISO 4217 code, but admins naturally type
     * "₹" or "Rs" — map those (and anything unrecognised) to INR.
     */
    public static function normalizeCurrency(?string $currency): string
    {
        $value = strtoupper(trim((string) $currency));

        return match (true) {
            in_array($value, ['$', 'US$', 'USD'], true) => 'USD',
            preg_match('/^[A-Z]{3}$/', $value) === 1 => $value, // already an ISO code, e.g. INR
            default => 'INR', // ₹, Rs, Rs., rupee, empty …
        };
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isPurchasedBy(User $user): bool
    {
        return $this->orderItems()
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('payment_status', 'paid');
            })
            ->exists();
    }
}
