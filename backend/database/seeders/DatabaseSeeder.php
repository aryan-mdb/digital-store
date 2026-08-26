<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a default admin, 5 basic users,
     * 5 categories and 15 digital products (3 per category).
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => (string) env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => (string) env('ADMIN_NAME', 'Super Admin'),
                'password' => Hash::make((string) env('ADMIN_PASSWORD', 'Admin@12345')),
                'role' => User::ROLE_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        User::factory(5)->create();

        $categories = [
            'Software' => 'Apps, plugins and developer tools ready to download.',
            'Templates' => 'Website, presentation and document templates.',
            'Ebooks' => 'Guides and ebooks on a range of topics.',
            'Courses' => 'Self-paced video and text courses.',
            'Graphics' => 'Icon packs, UI kits and design assets.',
        ];

        foreach ($categories as $name => $description) {
            $category = Category::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => $description,
                'status' => Category::STATUS_ACTIVE,
            ]);

            Product::factory(3)->create([
                'category_id' => $category->id,
                'created_by' => $admin->id,
            ]);
        }
    }
}
