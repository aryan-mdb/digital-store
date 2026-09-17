<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

/**
 * Streams images stored in the database (see the migration that added
 * thumbnail_data/image_data) rather than on disk, since the app's host
 * has an ephemeral filesystem that wipes local uploads on restart.
 */
class MediaController extends Controller
{
    public function productThumbnail(Product $product): Response
    {
        abort_if(! $product->thumbnail_data, 404);

        return response($product->thumbnail_data, 200, [
            'Content-Type' => $product->thumbnail_mime ?? 'application/octet-stream',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    public function categoryImage(Category $category): Response
    {
        abort_if(! $category->image_data, 404);

        return response($category->image_data, 200, [
            'Content-Type' => $category->image_mime ?? 'application/octet-stream',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
