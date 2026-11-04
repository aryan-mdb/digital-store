<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * The LERN Project catalog for the staging demo: one category per pillar
 * and eight digital guides, each with a small sample PDF so the
 * download-after-payment flow can be tested end to end.
 *
 * The catalog is created once (guarded by a settings flag) so admin edits
 * survive the db:seed that runs on every boot. The sample PDFs are
 * re-written whenever they are missing, because free hosts wipe the
 * container's disk on every restart.
 */
class LernCatalogSeeder extends Seeder
{
    private const FLAG = 'catalog_lern_v1';

    /** v2: premium guides become read-online only, as on the reference site. */
    private const FLAG_LOCKED = 'catalog_lern_v2_locked';

    private const LOCKED = ['ai-automation', 'performance-marketing'];

    public function run(): void
    {
        if (! Setting::get(self::FLAG)) {
            $this->seedCatalog();
        }

        if (! Setting::get(self::FLAG_LOCKED)) {
            Product::whereIn('slug', self::LOCKED)->update(['downloadable' => false]);
            Setting::set(self::FLAG_LOCKED, now()->toDateTimeString());
        }

        foreach (array_keys($this->guides()) as $slug) {
            $path = $this->filePath($slug);
            if (! Storage::disk('local')->exists($path)) {
                $title = $this->guides()[$slug]['name'];
                Storage::disk('local')->put($path, $this->samplePdf($title));
            }
        }
    }

    private function seedCatalog(): void
    {
        $adminId = User::where('role', User::ROLE_ADMIN)->value('id');

        $categories = [];
        foreach ($this->categories() as $slug => $c) {
            $categories[$slug] = Category::updateOrCreate(['slug' => $slug], [
                'name' => $c['name'],
                'description' => $c['description'],
                'status' => Category::STATUS_ACTIVE,
            ]);
        }

        foreach ($this->guides() as $slug => $g) {
            Product::updateOrCreate(['slug' => $slug], [
                'category_id' => $categories[$g['category']]->id,
                'name' => $g['name'],
                'short_description' => $g['short'],
                'description' => $g['short']."\n\n".$g['description'],
                'price' => $g['price'],
                'currency' => 'INR',
                'product_file' => $this->filePath($slug),
                'status' => Product::STATUS_ACTIVE,
                'created_by' => $adminId,
            ]);
        }

        Setting::set(self::FLAG, now()->toDateTimeString());
    }

    private function filePath(string $slug): string
    {
        return "products/{$slug}.pdf";
    }

    /** A one-page PDF with the guide's title, so downloads open in any viewer. */
    private function samplePdf(string $title): string
    {
        $safe = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $title);
        $stream = "BT /F1 24 Tf 72 720 Td ({$safe}) Tj ET\n"
            ."BT /F1 12 Tf 72 690 Td (The LERN Project - sample guide for testing downloads.) Tj ET";

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $body) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n{$body}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= 'xref'."\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf.'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";
    }

    private function categories(): array
    {
        return [
            'learn' => ['name' => 'Learn', 'description' => 'Future-proof skills like AI automation and digital marketing.'],
            'earn' => ['name' => 'Earn', 'description' => 'Turn skills into income: ads, sales, drop shipping and affiliates.'],
            'return' => ['name' => 'Return', 'description' => 'Come back to what you want, and why you want it.'],
            'nurture' => ['name' => 'Nurture', 'description' => 'Habits and systems that keep you growing.'],
        ];
    }

    private function guides(): array
    {
        return [
            'ai-automation' => [
                'category' => 'learn', 'name' => 'AI Automation', 'price' => 1499,
                'short' => 'Build AI agents and no-code workflows that run repetitive work for you — from lead capture to customer replies.',
                'description' => 'Map the tasks worth automating, connect your tools without code, and ship agents that handle enquiries, follow-ups and reporting.',
            ],
            'performance-marketing' => [
                'category' => 'earn', 'name' => 'Performance Marketing', 'price' => 1499,
                'short' => 'Paid ads that pay back: Meta and Google campaigns, tracking, testing and scaling on ROAS.',
                'description' => 'Set up tracking you can trust, structure campaigns for learning, read the numbers and scale what works.',
            ],
            'digital-marketing' => [
                'category' => 'learn', 'name' => 'Digital Marketing', 'price' => 1299,
                'short' => 'The full growth stack — SEO, content, email and social — and how they fit together.',
                'description' => 'Plan content that ranks, build an email list that converts and turn social reach into customers.',
            ],
            'drop-shipping' => [
                'category' => 'earn', 'name' => 'Drop Shipping', 'price' => 1299,
                'short' => 'Find winning products and reliable suppliers, then launch a store without holding inventory.',
                'description' => 'Validate products, vet suppliers, price for profit and launch your first store step by step.',
            ],
            'affiliate-marketing' => [
                'category' => 'earn', 'name' => 'Affiliate Marketing', 'price' => 1199,
                'short' => 'Pick the right offers, build an audience and earn commissions on products you believe in.',
                'description' => 'Choose a niche, find programs that pay, and create content that earns while you sleep.',
            ],
            'sales' => [
                'category' => 'earn', 'name' => 'Sales', 'price' => 1199,
                'short' => 'Prospecting, discovery calls and closing — with scripts and follow-up systems that convert.',
                'description' => 'Fill your pipeline, run calls that uncover real needs and close without pressure.',
            ],
            'self-development' => [
                'category' => 'nurture', 'name' => 'Self-Development', 'price' => 999,
                'short' => 'Habits, focus and discipline systems for steady, compounding personal growth.',
                'description' => 'Design routines that stick, protect your focus and track progress that compounds.',
            ],
            'manifestation' => [
                'category' => 'return', 'name' => 'Manifestation', 'price' => 999,
                'short' => 'Mindset, visualisation and intention-setting practices to align what you want with what you do.',
                'description' => 'Get clear on what you want, why you want it, and the daily actions that move you toward it.',
            ],
        ];
    }
}
