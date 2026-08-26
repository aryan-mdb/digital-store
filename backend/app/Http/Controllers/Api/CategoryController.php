<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * Public listing — active categories only, unless an admin is asking.
     */
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        if (! ($request->user()?->isAdmin())) {
            $query->where('status', Category::STATUS_ACTIVE);
        } elseif ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->string('search').'%');
        }

        $categories = $query->orderBy('name')->paginate($request->integer('per_page', 15));

        return $this->success($categories->through(fn ($c) => new CategoryResource($c)), 'OK');
    }

    public function show(Category $category)
    {
        $category->loadCount('products');

        return $this->success(new CategoryResource($category), 'OK');
    }

    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create($data);

        return $this->success(new CategoryResource($category), 'Category created successfully', 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        return $this->success(new CategoryResource($category), 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return $this->error('Cannot delete a category that still has products. Move or delete its products first.', null, 409);
        }

        $category->delete();

        return $this->success(null, 'Category deleted successfully');
    }

    public function toggleStatus(Category $category)
    {
        $category->update([
            'status' => $category->status === Category::STATUS_ACTIVE
                ? Category::STATUS_INACTIVE
                : Category::STATUS_ACTIVE,
        ]);

        return $this->success(new CategoryResource($category), 'Category status updated');
    }
}
