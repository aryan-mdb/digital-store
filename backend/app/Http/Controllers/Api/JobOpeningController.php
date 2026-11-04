<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\JobOpening;
use Illuminate\Http\Request;

/**
 * Careers page roles. The public list shows active roles only; admins see
 * and manage all of them.
 */
class JobOpeningController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(JobOpening::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get());
    }

    public function adminIndex()
    {
        return $this->success(JobOpening::orderBy('sort_order')->orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $opening = JobOpening::create($this->validated($request));

        return $this->success($opening, 'Role added', 201);
    }

    public function update(Request $request, JobOpening $opening)
    {
        $opening->update($this->validated($request));

        return $this->success($opening, 'Role updated');
    }

    public function toggleStatus(JobOpening $opening)
    {
        $opening->update(['is_active' => ! $opening->is_active]);

        return $this->success($opening, $opening->is_active ? 'Role activated' : 'Role deactivated');
    }

    public function destroy(JobOpening $opening)
    {
        $opening->delete();

        return $this->success(null, 'Role deleted');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'summary' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
