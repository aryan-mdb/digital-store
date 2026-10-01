<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;

/**
 * Homepage hero slides. Public index returns only active slides; the
 * storefront falls back to built-in animated slides when there are none.
 */
class SliderController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $sliders = Slider::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();

        return $this->success($sliders->map(fn ($s) => $this->present($s)), 'OK');
    }

    public function adminIndex()
    {
        $sliders = Slider::orderBy('sort_order')->orderBy('id')->get();

        return $this->success($sliders->map(fn ($s) => $this->present($s)), 'OK');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request, true);

        $slider = Slider::create($data);

        return $this->success($this->present($slider), 'Slide added successfully', 201);
    }

    public function update(Request $request, Slider $slider)
    {
        $slider->update($this->validated($request, false));

        return $this->success($this->present($slider), 'Slide updated successfully');
    }

    public function toggleStatus(Slider $slider)
    {
        $slider->update(['is_active' => ! $slider->is_active]);

        return $this->success($this->present($slider), 'Slide status updated');
    }

    public function destroy(Slider $slider)
    {
        $slider->delete();

        return $this->success(null, 'Slide deleted successfully');
    }

    private function validated(Request $request, bool $creating): array
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'button_text' => ['nullable', 'string', 'max:60'],
            'button_link' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'image' => [$creating ? 'required' : 'nullable', 'image', 'max:8192'],
        ]);

        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image_data'] = base64_encode(file_get_contents($request->file('image')->getRealPath()));
            $data['image_mime'] = $request->file('image')->getMimeType();
        }

        return $data;
    }

    private function present(Slider $slider): array
    {
        return [
            'id' => $slider->id,
            'title' => $slider->title,
            'subtitle' => $slider->subtitle,
            'button_text' => $slider->button_text,
            'button_link' => $slider->button_link,
            'sort_order' => $slider->sort_order,
            'is_active' => $slider->is_active,
            // updated_at busts the year-long browser cache when an image is replaced.
            'image_url' => $slider->image_mime
                ? url("/media/sliders/{$slider->id}/image").'?v='.$slider->updated_at?->timestamp
                : null,
        ];
    }
}
