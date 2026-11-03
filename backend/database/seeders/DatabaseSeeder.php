<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the default admin, the LERN guide catalog and (on a fresh
     * database) 5 demo basic users.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => (string) env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => (string) env('ADMIN_NAME', 'Super Admin'),
                'password' => Hash::make((string) env('ADMIN_PASSWORD', 'Admin@12345')),
                'role' => User::ROLE_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        // A ready-made shopper for client demos, since sign-up needs an OTP.
        if (env('DEMO_USER_EMAIL') && env('DEMO_USER_PASSWORD')) {
            User::updateOrCreate(
                ['email' => (string) env('DEMO_USER_EMAIL')],
                [
                    'name' => 'Demo Customer',
                    'password' => Hash::make((string) env('DEMO_USER_PASSWORD')),
                    'role' => User::ROLE_BASIC_USER,
                    'status' => User::STATUS_ACTIVE,
                    'email_verified_at' => now(),
                ]
            );
        }

        $isFreshDatabase = ! Category::query()->exists();

        $this->call(LernCatalogSeeder::class);

        // Demo shoppers only outside production (factories need the dev-only faker package).
        if ($isFreshDatabase && ! app()->isProduction()) {
            User::factory(5)->create();
        }
    }
}
