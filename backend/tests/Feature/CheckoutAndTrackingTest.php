<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckoutAndTrackingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $buyer;
    private Product $product;

    private array $shipping = [
        'name' => 'Asha Devi',
        'phone' => '+91 98765 43210',
        'address' => '12 Temple Road',
        'city' => 'Jaipur',
        'state' => 'Rajasthan',
        'pincode' => '302001',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->buyer = User::factory()->create(['role' => User::ROLE_BASIC_USER]);
        $this->product = Product::factory()->create(['price' => 499, 'currency' => 'INR', 'product_file' => null]);

        config([
            'services.razorpay.key_id' => 'rzp_test_key',
            'services.razorpay.key_secret' => 'secret123',
        ]);
    }

    public function test_cod_order_requires_address_and_starts_tracking(): void
    {
        $this->actingAs($this->buyer)
            ->postJson('/api/orders', ['product_id' => $this->product->id, 'payment_method' => 'cod'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('shipping.address');

        $res = $this->actingAs($this->buyer)->postJson('/api/orders', [
            'product_id' => $this->product->id,
            'payment_method' => 'cod',
            'shipping' => $this->shipping,
        ])->assertCreated();

        $res->assertJsonPath('data.payment_method', 'cod')
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.tracking.status', 'placed')
            ->assertJsonPath('data.shipping.city', 'Jaipur');
    }

    public function test_disabled_method_is_rejected_and_hidden_publicly(): void
    {
        $this->actingAs($this->admin)
            ->putJson('/api/admin/settings/store', ['payment_methods' => ['cod' => false]])
            ->assertOk()
            ->assertJsonPath('data.payment_methods.cod', false);

        $this->getJson('/api/site-settings')->assertJsonPath('data.payment_methods.cod', false);

        $this->actingAs($this->buyer)->postJson('/api/orders', [
            'product_id' => $this->product->id,
            'payment_method' => 'cod',
            'shipping' => $this->shipping,
        ])->assertStatus(422)->assertJsonValidationErrors('payment_method');
    }

    public function test_razorpay_hidden_when_keys_missing(): void
    {
        config(['services.razorpay.key_secret' => null]);

        $this->getJson('/api/site-settings')
            ->assertJsonPath('data.payment_methods.razorpay', false)
            ->assertJsonPath('data.razorpay_key_id', null);
    }

    public function test_razorpay_flow_verifies_signature(): void
    {
        Http::fake(['api.razorpay.com/*' => Http::response(['id' => 'order_RZP123'], 200)]);

        $order = $this->actingAs($this->buyer)->postJson('/api/orders', [
            'product_id' => $this->product->id,
            'payment_method' => 'razorpay',
            'shipping' => $this->shipping,
        ])->assertCreated()->json('data');

        $this->assertNull($order['tracking']['status']);

        $this->actingAs($this->buyer)->postJson("/api/payments/razorpay/{$order['id']}")
            ->assertOk()
            ->assertJsonPath('data.razorpay_order_id', 'order_RZP123')
            ->assertJsonPath('data.amount', 49900);

        $this->actingAs($this->buyer)->postJson("/api/payments/razorpay/{$order['id']}/verify", [
            'razorpay_order_id' => 'order_RZP123',
            'razorpay_payment_id' => 'pay_1',
            'razorpay_signature' => 'forged',
        ])->assertStatus(422);

        $signature = hash_hmac('sha256', 'order_RZP123|pay_1', 'secret123');

        $this->actingAs($this->buyer)->postJson("/api/payments/razorpay/{$order['id']}/verify", [
            'razorpay_order_id' => 'order_RZP123',
            'razorpay_payment_id' => 'pay_1',
            'razorpay_signature' => $signature,
        ])->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.tracking.status', 'placed');
    }

    public function test_admin_tracking_updates_and_cod_delivery_marks_paid(): void
    {
        $orderId = $this->actingAs($this->buyer)->postJson('/api/orders', [
            'product_id' => $this->product->id,
            'payment_method' => 'cod',
            'shipping' => $this->shipping,
        ])->json('data.id');

        $this->actingAs($this->admin)->postJson("/api/admin/orders/{$orderId}/tracking", [
            'status' => 'shipped',
            'location' => 'Jaipur hub',
            'lat' => 26.9124,
            'lng' => 75.7873,
        ])->assertOk()->assertJsonPath('data.tracking.status', 'shipped');

        $this->actingAs($this->admin)->postJson("/api/admin/orders/{$orderId}/location", ['lat' => 26.95, 'lng' => 75.8])
            ->assertOk();

        // Public tracking needs the matching phone number.
        $orderNumber = Order::find($orderId)->order_number;
        $this->postJson('/api/track-order', ['order_number' => $orderNumber, 'phone' => '0000000000'])->assertNotFound();
        $this->postJson('/api/track-order', ['order_number' => $orderNumber, 'phone' => '9876543210'])
            ->assertOk()
            ->assertJsonPath('data.tracking.lat', 26.95)
            ->assertJsonCount(2, 'data.tracking.events');

        $this->actingAs($this->admin)->postJson("/api/admin/orders/{$orderId}/tracking", ['status' => 'delivered'])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_admin_slider_crud_and_public_listing(): void
    {
        $id = $this->actingAs($this->admin)->post('/api/admin/sliders', [
            'title' => 'Diwali Sale',
            // 1×1 PNG — real bytes so the `image` rule and media route both see an image.
            'image' => UploadedFile::fake()->createWithContent(
                'banner.png',
                base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
            ),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        $this->getJson('/api/sliders')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Diwali Sale');

        $this->actingAs($this->admin)->patchJson("/api/admin/sliders/{$id}/toggle-status")->assertOk();
        $this->getJson('/api/sliders')->assertJsonCount(0, 'data');

        $this->get("/media/sliders/{$id}/image")->assertOk();
    }

    public function test_whatsapp_settings_are_public_only_when_number_set(): void
    {
        $this->getJson('/api/site-settings')->assertJsonPath('data.whatsapp.enabled', false);

        Setting::set('whatsapp_number', '+91 98765-43210');

        $this->getJson('/api/site-settings')
            ->assertJsonPath('data.whatsapp.enabled', true)
            ->assertJsonPath('data.whatsapp.number', '919876543210');
    }
}
