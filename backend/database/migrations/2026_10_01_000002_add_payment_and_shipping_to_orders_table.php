<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds Razorpay / Cash on Delivery support and a delivery address +
 * live tracking state to orders. tracking_status is a plain string (not
 * an enum) so new stages can be added without a schema change.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method', 20)->default('crypto')->after('payment_status')->index();
            $table->string('razorpay_order_id')->nullable()->after('payment_method')->index();
            $table->string('razorpay_payment_id')->nullable()->after('razorpay_order_id');

            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone', 20)->nullable();
            $table->string('shipping_address', 500)->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_pincode', 12)->nullable();

            $table->string('tracking_status', 30)->nullable()->index();
            $table->string('current_location')->nullable();
            $table->decimal('current_lat', 10, 7)->nullable();
            $table->decimal('current_lng', 10, 7)->nullable();
        });

        Schema::create('order_tracking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('status', 30);
            $table->string('location')->nullable();
            $table->string('note', 500)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_tracking_events');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method', 'razorpay_order_id', 'razorpay_payment_id',
                'shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city', 'shipping_state', 'shipping_pincode',
                'tracking_status', 'current_location', 'current_lat', 'current_lng',
            ]);
        });
    }
};
