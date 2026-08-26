<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'required', 'in:admin,basic_user'],
            'status' => ['sometimes', 'required', 'in:active,inactive,blocked'],
        ];
    }
}
