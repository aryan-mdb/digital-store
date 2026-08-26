<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Product\ProductFileService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ProductFileService $files)
    {
    }

    /**
     * Public/browse listing — search, filter by category, price range.
     */
    public function index(Request $request)
    {
        $query = Product::query()->with('category')->withCount('orderItems');

        if (! ($request->user()?->isAdmin())) {
            $query->where('status', Product::STATUS_ACTIVE);
        } elseif ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('short_description', 'like', "%{$term}%");
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->float('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->float('max_price'));
        }

        $sort = $request->string('sort', 'newest');
        match ((string) $sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $products = $query->paginate($request->integer('per_page', 12));

        return $this->success($products->through(fn ($p) => new ProductResource($p)), 'OK');
    }

    public function show(Request $request, Product $product)
    {
        $product->load('category', 'creator');

        return $this->success(new ProductResource($product), 'OK');
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->safe()->except(['thumbnail', 'product_file']);
        $data['created_by'] = $request->user()->id;
        $data['currency'] = $data['currency'] ?? 'USD';

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $this->files->storeThumbnail($request->file('thumbnail'));
        }

        $data['product_file'] = $this->files->storeProductFile($request->file('product_file'));

        $product = Product::create($data);

        return $this->success(new ProductResource($product->load('category')), 'Product created successfully', 201);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->safe()->except(['thumbnail', 'product_file']);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $this->files->replaceThumbnail($product, $request->file('thumbnail'));
        }

        if ($request->hasFile('product_file')) {
            $data['product_file'] = $this->files->replaceProductFile($product, $request->file('product_file'));
        }

        $product->update($data);

        return $this->success(new ProductResource($product->load('category')), 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        $this->files->deleteAll($product);
        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }

    public function toggleStatus(Product $product)
    {
        $product->update([
            'status' => $product->status === Product::STATUS_ACTIVE
                ? Product::STATUS_INACTIVE
                : Product::STATUS_ACTIVE,
        ]);

        return $this->success(new ProductResource($product), 'Product status updated');
    }
}
