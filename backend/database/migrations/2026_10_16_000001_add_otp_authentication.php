<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('phone', 16)->nullable()->unique();
            $table->timestamp('phone_verified_at')->nullable();
        });
        Schema::create('otp_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('channel');
            $table->string('identifier');
            $table->string('purpose');
            $table->string('name')->nullable();
            $table->string('referral_code')->nullable();
            $table->string('code_hash')->nullable();
            $table->string('provider_sid')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_challenges');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'phone_verified_at']);
        });
        // Email stays nullable to preserve accounts registered by phone.
    }
};
