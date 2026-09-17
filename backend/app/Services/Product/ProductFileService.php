<?php

namespace App\Services\Product;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Handles storage of digital product files (private disk) and safe
 * cleanup of old files. Thumbnails are handled separately — see
 * thumbnailDataFromUpload() — since they're stored in the database.
 */
class ProductFileService
{
    private const FILE_DISK = 'local'; // storage/app/private — never web-served directly

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

    /**
     * Thumbnails are stored as bytes in the database, not on disk — the
     * app runs on a host with an ephemeral filesystem, so anything
     * written to disk is lost on the next restart/redeploy. The
     * database is a separate, persistent service.
     *
     * @return array{thumbnail_data: string, thumbnail_mime: string}
     */
    public function thumbnailDataFromUpload(UploadedFile $file): array
    {
        return [
            'thumbnail_data' => base64_encode(file_get_contents($file->getRealPath())),
            'thumbnail_mime' => $file->getMimeType(),
        ];
    }

    public function deleteAll(Product $product): void
    {
        if ($product->product_file) {
            Storage::disk(self::FILE_DISK)->delete($product->product_file);
        }
    }
}
