<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = ucwords(fake()->words(3, true));

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'short_description' => fake()->sentence(10),
            'description' => fake()->paragraphs(3, true),
            'price' => fake()->randomFloat(2, 4.99, 199.99),
            'currency' => 'USD',
            'thumbnail' => null,
            // Seeded demo products ship without a real binary file — the
            // admin panel is used to upload actual files after seeding.
            'product_file' => null,
            'status' => Product::STATUS_ACTIVE,
            'created_by' => User::where('role', User::ROLE_ADMIN)->value('id'),
        ];
    }
}
