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
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE referrals ALTER COLUMN reward_percentage DROP NOT NULL');
        } else {
            DB::statement('ALTER TABLE referrals MODIFY reward_percentage DECIMAL(5,2) NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE referrals ALTER COLUMN reward_percentage SET NOT NULL');
        } else {
            DB::statement('ALTER TABLE referrals MODIFY reward_percentage DECIMAL(5,2) NOT NULL');
        }
    }
};
