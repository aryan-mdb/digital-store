<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * The reward percentage is now decided by the admin-configurable
     * setting at reward time (when the referred user's order is paid),
     * not snapshotted at signup — so it must stay null until then.
     *
     * SQLite uses Laravel's native schema modification support.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('referrals', fn (Blueprint $table) => $table->decimal('reward_percentage', 5, 2)->nullable()->change());
        } elseif (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE referrals ALTER COLUMN reward_percentage DROP NOT NULL');
        } else {
            DB::statement('ALTER TABLE referrals MODIFY reward_percentage DECIMAL(5,2) NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('referrals', fn (Blueprint $table) => $table->decimal('reward_percentage', 5, 2)->nullable(false)->change());
        } elseif (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE referrals ALTER COLUMN reward_percentage SET NOT NULL');
        } else {
            DB::statement('ALTER TABLE referrals MODIFY reward_percentage DECIMAL(5,2) NOT NULL');
        }
    }
};
