<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crypto_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('payment_provider')->default('coinbase_commerce');
            $table->string('cryptocurrency')->nullable(); // e.g. BTC, ETH, USDT
            $table->string('wallet_address')->nullable();
            $table->decimal('amount', 12, 2); // fiat amount (matches order total)
            $table->decimal('crypto_amount', 24, 8)->nullable();
            $table->string('transaction_id')->nullable()->index();
            $table->string('payment_url')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending')->index();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('response_data')->nullable(); // raw provider payload, never contains private keys
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crypto_payments');
    }
};
