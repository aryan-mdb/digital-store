<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\CareerApplication;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CareerApplicationController extends Controller
{
    use ApiResponse;

    /** Public: submit an application from the Careers page. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:100'],
            'role' => ['required', 'string', 'max:255'],
            'experience' => ['nullable', 'integer', 'min:0', 'max:50'],
            'linkedin' => ['required', 'url', 'max:500', 'regex:/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i'],
            'message' => ['nullable', 'string', 'max:3000'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:8192'],
        ], [
            'linkedin.regex' => 'Please paste your full LinkedIn profile link.',
        ]);

        $cv = $request->file('cv');

        CareerApplication::create([
            ...collect($data)->except('cv')->all(),
            'cv_name' => $cv->getClientOriginalName(),
            'cv_mime' => $cv->getMimeType() ?: 'application/octet-stream',
            'cv_data' => base64_encode($cv->get()),
        ]);

        return $this->success(null, 'Thanks for applying! We’ll be in touch if there’s a fit.', 201);
    }

    /** Admin: newest applications first, optionally filtered by status or role. */
    public function index(Request $request)
    {
        $applications = CareerApplication::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->input('search').'%';
                $q->where(fn ($w) => $w->where('name', 'like', $term)->orWhere('email', 'like', $term)->orWhere('role', 'like', $term));
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->success($applications);
    }

    public function updateStatus(Request $request, CareerApplication $application)
    {
        $data = $request->validate(['status' => ['required', Rule::in(CareerApplication::STATUSES)]]);
        $application->update($data);

        return $this->success($application, 'Status updated');
    }

    public function cv(CareerApplication $application)
    {
        return response(base64_decode($application->cv_data), 200, [
            'Content-Type' => $application->cv_mime,
            'Content-Disposition' => 'attachment; filename="'.addslashes($application->cv_name).'"',
        ]);
    }

    public function destroy(CareerApplication $application)
    {
        $application->delete();

        return $this->success(null, 'Application deleted');
    }
}
