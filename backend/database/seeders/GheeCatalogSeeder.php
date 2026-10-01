<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Slider;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * PAYAN Pure Cow Ghee catalog: categories, products and homepage slides,
 * with images generated from the brand's packaging artwork.
 *
 * Runs once per database (guarded by a settings flag) because the deploy
 * script runs db:seed on every boot — admin edits afterwards are kept.
 * The original digital-goods demo categories are deactivated, not deleted.
 */
class GheeCatalogSeeder extends Seeder
{
    private const FLAG = 'catalog_payan_ghee_v1';

    private const OLD_DEMO_CATEGORIES = ['software', 'templates', 'ebooks', 'courses', 'graphics'];

    public function run(): void
    {
        if (Setting::get(self::FLAG)) {
            return;
        }

        $adminId = User::where('role', User::ROLE_ADMIN)->value('id');

        $oldCategoryIds = Category::whereIn('slug', self::OLD_DEMO_CATEGORIES)->pluck('id');
        Category::whereIn('id', $oldCategoryIds)->update(['status' => Category::STATUS_INACTIVE]);
        Product::whereIn('category_id', $oldCategoryIds)->update(['status' => Product::STATUS_INACTIVE]);

        $categories = [];
        foreach ($this->categories() as $slug => $c) {
            $categories[$slug] = Category::updateOrCreate(['slug' => $slug], [
                'name' => $c['name'],
                'description' => $c['description'],
                'status' => Category::STATUS_ACTIVE,
                ...$this->image($c['image'], 'image'),
            ]);
        }

        foreach ($this->products() as $slug => $p) {
            Product::updateOrCreate(['slug' => $slug], [
                'category_id' => $categories[$p['category']]->id,
                'name' => $p['name'],
                'short_description' => $p['short'],
                'description' => $p['description'],
                'price' => $p['price'],
                'currency' => 'INR',
                'product_file' => null, // physical product — shipped, not downloaded
                'status' => Product::STATUS_ACTIVE,
                'created_by' => $adminId,
                ...$this->image($p['image'], 'thumbnail'),
            ]);
        }

        if (! Slider::query()->exists()) {
            Slider::create([
                'title' => 'PAYAN Pure Cow Ghee',
                'subtitle' => 'पवित्र स्वाद • शुद्धता का भरोसा — slow-cooked the traditional way from the milk of grass-fed desi cows.',
                'button_text' => 'Shop Now',
                'button_link' => '/products',
                'sort_order' => 0,
                'is_active' => true,
                ...$this->image('slide-1.jpg', 'image'),
            ]);
            Slider::create([
                'title' => '100% Pure. Naturally Rich.',
                'subtitle' => 'No chemicals, no preservatives — just golden, granular ghee with the aroma of home.',
                'button_text' => 'Explore Ghee',
                'button_link' => '/categories',
                'sort_order' => 1,
                'is_active' => true,
                ...$this->image('slide-2.jpg', 'image'),
            ]);
        }

        Setting::set(self::FLAG, now()->toDateTimeString());
    }

    /** @return array{0?: string} column => base64 bytes, plus the mime column */
    private function image(string $file, string $column): array
    {
        $path = __DIR__.'/images/'.$file;

        if (! is_file($path)) {
            return [];
        }

        return [
            "{$column}_data" => base64_encode(file_get_contents($path)),
            "{$column}_mime" => 'image/jpeg',
        ];
    }

    private function categories(): array
    {
        return [
            'a2-desi-cow-ghee' => [
                'name' => 'A2 Desi Cow Ghee',
                'description' => 'Golden ghee from the A2 milk of grass-fed desi cows — rich aroma, granular texture.',
                'image' => 'category-a2.jpg',
            ],
            'bilona-ghee' => [
                'name' => 'Bilona Ghee',
                'description' => 'Hand-churned from curd using the age-old bilona method, then slow-cooked on low flame.',
                'image' => 'category-bilona.jpg',
            ],
            'pooja-daily-use' => [
                'name' => 'Pooja & Daily Use',
                'description' => 'Pure ghee for diyas, havan and everyday cooking.',
                'image' => 'category-desi.jpg',
            ],
            'gift-combo-packs' => [
                'name' => 'Gift & Combo Packs',
                'description' => 'Festive gift boxes and value family packs.',
                'image' => 'category-gift.jpg',
            ],
        ];
    }

    private function products(): array
    {
        $promise = "\n\n✔ 100% Pure Cow Ghee\n✔ Natural & Chemical Free\n✔ Rich Aroma & Taste\n✔ Made with Traditional Care";

        return [
            'payan-a2-desi-cow-ghee-500ml' => [
                'category' => 'a2-desi-cow-ghee',
                'name' => 'PAYAN A2 Desi Cow Ghee – 500 ml',
                'short' => 'Pure A2 cow ghee in a glass jar. पवित्र स्वाद • शुद्धता का भरोसा',
                'description' => 'Made from the A2 milk of free-grazing desi cows and slow-cooked in small batches, PAYAN A2 Ghee has a naturally golden colour, a grainy (danedar) texture and the unmistakable aroma of ghee made at home.'.$promise."\n\nNet quantity: 500 ml · Packed in a food-grade glass jar",
                'price' => 749,
                'image' => 'product-jar.jpg',
            ],
            'payan-a2-desi-cow-ghee-1l' => [
                'category' => 'a2-desi-cow-ghee',
                'name' => 'PAYAN A2 Desi Cow Ghee – 1 Litre',
                'short' => 'Family size jar of pure A2 desi cow ghee.',
                'description' => 'Our signature A2 Desi Cow Ghee in a family-size jar. Perfect for rotis, dal tadka, sweets and everything in between.'.$promise."\n\nNet quantity: 1 litre · Packed in a food-grade glass jar",
                'price' => 1399,
                'image' => 'product-label-closeup.jpg',
            ],
            'payan-cow-ghee-tin-250ml' => [
                'category' => 'a2-desi-cow-ghee',
                'name' => 'PAYAN Pure Cow Ghee – 250 ml Trial Pack',
                'short' => 'Try the PAYAN taste — a small pack of pure cow ghee.',
                'description' => 'New to PAYAN? Start with our 250 ml trial pack and taste the difference that traditional care makes.'.$promise."\n\nNet quantity: 250 ml",
                'price' => 399,
                'image' => 'product-lid.jpg',
            ],
            'payan-bilona-ghee-500ml' => [
                'category' => 'bilona-ghee',
                'name' => 'PAYAN Bilona Hand-Churned Ghee – 500 ml',
                'short' => 'Curd-churned by hand using the traditional bilona method.',
                'description' => 'Milk is set into curd, hand-churned in a wooden bilona to separate makhan, and the makhan is slowly simmered into ghee — exactly how it has been done in Indian villages for generations.'.$promise."\n\nNet quantity: 500 ml",
                'price' => 899,
                'image' => 'product-features.jpg',
            ],
            'payan-bilona-ghee-1l' => [
                'category' => 'bilona-ghee',
                'name' => 'PAYAN Bilona Hand-Churned Ghee – 1 Litre',
                'short' => 'Family pack of hand-churned bilona ghee.',
                'description' => 'Our premium bilona ghee in a 1 litre jar — rich in aroma, easy to digest and ideal for growing kids and elders.'.$promise."\n\nNet quantity: 1 litre",
                'price' => 1699,
                'image' => 'product-bowl.jpg',
            ],
            'payan-pooja-ghee-1l' => [
                'category' => 'pooja-daily-use',
                'name' => 'PAYAN Pure Ghee for Pooja – 1 Litre',
                'short' => 'Pure cow ghee for diyas, havan and aarti.',
                'description' => 'Light your diyas with pure cow ghee. Burns clean and bright with a pleasant fragrance — made with the same care as our cooking ghee.'."\n\nNet quantity: 1 litre",
                'price' => 999,
                'image' => 'product-jar.jpg',
            ],
            'payan-family-combo-2x1l' => [
                'category' => 'gift-combo-packs',
                'name' => 'PAYAN Family Combo – 2 × 1 Litre',
                'short' => 'Two 1 litre jars of A2 desi cow ghee at a special price.',
                'description' => 'Stock up and save — two family-size jars of PAYAN A2 Desi Cow Ghee.'.$promise."\n\nNet quantity: 2 × 1 litre",
                'price' => 2699,
                'image' => 'product-combo.jpg',
            ],
            'payan-festive-gift-box' => [
                'category' => 'gift-combo-packs',
                'name' => 'PAYAN Festive Gift Box (500 ml + Brass Katori)',
                'short' => 'A thoughtful gift of purity for Diwali, weddings and festivals.',
                'description' => 'A 500 ml jar of PAYAN A2 Ghee with a traditional brass katori, packed in a festive gift box. Spread the pure taste of tradition.'."\n\nIncludes: 500 ml ghee jar + brass katori",
                'price' => 1199,
                'image' => 'product-lid.jpg',
            ],
        ];
    }
}
