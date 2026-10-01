<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the default admin, the PAYAN ghee catalog and (on a fresh
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

        $isFreshDatabase = ! Category::query()->exists();

        $this->call(GheeCatalogSeeder::class);

        if ($isFreshDatabase) {
            User::factory(5)->create();
        }
    }
}
