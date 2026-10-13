<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Slider;
use App\Support\ImageOptimizer;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * One-off / repeatable catalog cleanup for the live ghee store:
 * - re-encodes oversized product, category and slider images (WebP)
 * - removes "download files" that are really product photos uploaded
 *   into the wrong field, so those products behave as shipped goods
 *   (delivery address, Cash on Delivery, re-orderable)
 */
Artisan::command('store:repair-catalog {--dry-run}', function () {
    $dry = (bool) $this->option('dry-run');
    $saved = 0;

    $shrink = function ($model, string $prefix, int $maxSide) use ($dry, &$saved) {
        $data = $model->{"{$prefix}_data"};
        if (! $data) {
            return;
        }
        $bytes = base64_decode($data);
        $result = ImageOptimizer::optimize($bytes, $model->{"{$prefix}_mime"}, $maxSide);
        if ($result['mime'] === 'image/webp' && strlen($result['data']) < strlen($bytes)) {
            $saved += strlen($bytes) - strlen($result['data']);
            if (! $dry) {
                $model->forceFill([
                    "{$prefix}_data" => base64_encode($result['data']),
                    "{$prefix}_mime" => $result['mime'],
                ])->save();
            }
        }
    };

    Product::query()->whereNotNull('thumbnail_data')->each(fn ($p) => $shrink($p, 'thumbnail', 1000));
    Category::query()->whereNotNull('image_data')->each(fn ($c) => $shrink($c, 'image', 600));
    Slider::query()->whereNotNull('image_data')->each(fn ($s) => $shrink($s, 'image', 1920));

    $this->info(sprintf('Images: %s %.1f MB', $dry ? 'would save' : 'saved', $saved / 1048576));

    $mistaken = Product::query()
        ->whereNotNull('product_file')
        ->whereNotNull('thumbnail_mime')
        ->get()
        ->filter(fn ($p) => preg_match('/\.(png|jpe?g|webp|gif|heic)$/i', $p->product_file));

    foreach ($mistaken as $product) {
        $this->line("Product #{$product->id} {$product->name}: image in download field → physical product");
        if (! $dry) {
            Storage::disk('local')->delete($product->product_file);
            $product->forceFill(['product_file' => null])->save();
        }
    }

    $this->info(($dry ? 'Would fix ' : 'Fixed ').$mistaken->count().' product(s).');
})->purpose('Shrink stored images and turn image "download files" into physical products');
