<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The reward percentage is now decided by the admin-configurable
     * setting at reward time (when the referred user's order is paid),
     * not snapshotted at signup — so it must stay null until then.
     *
     * Raw SQL (not Schema::table()->change()) because that requires
     * doctrine/dbal, which isn't installed in this project.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE referrals MODIFY reward_percentage DECIMAL(5,2) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE referrals MODIFY reward_percentage DECIMAL(5,2) NOT NULL');
    }
};
