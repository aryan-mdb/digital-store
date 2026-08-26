<?php

namespace App\Services\Product;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Handles storage of digital product files (private disk) and thumbnails
 * (public disk), including safe replacement/cleanup of old files.
 */
class ProductFileService
{
    private const FILE_DISK = 'local'; // storage/app/private — never web-served directly
    private const THUMB_DISK = 'public';

    public function storeProductFile(UploadedFile $file): string
    {
        return $file->store('products/files', self::FILE_DISK);
    }

    public function replaceProductFile(Product $product, UploadedFile $file): string
    {
        if ($product->product_file) {
            Storage::disk(self::FILE_DISK)->delete($product->product_file);
        }

        return $this->storeProductFile($file);
    }

    public function storeThumbnail(UploadedFile $file): string
    {
        $name = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        return $file->storeAs('products/thumbnails', $name, self::THUMB_DISK);
    }

    public function replaceThumbnail(Product $product, UploadedFile $file): string
    {
        if ($product->thumbnail) {
            Storage::disk(self::THUMB_DISK)->delete($product->thumbnail);
        }

        return $this->storeThumbnail($file);
    }

    public function thumbnailUrl(?string $path): ?string
    {
        return $path ? Storage::disk(self::THUMB_DISK)->url($path) : null;
    }

    public function deleteAll(Product $product): void
    {
        if ($product->product_file) {
            Storage::disk(self::FILE_DISK)->delete($product->product_file);
        }

        if ($product->thumbnail) {
            Storage::disk(self::THUMB_DISK)->delete($product->thumbnail);
        }
    }
}
