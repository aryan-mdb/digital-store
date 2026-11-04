<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareerApplication extends Model
{
    public const STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected'];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'city',
        'role',
        'experience',
        'linkedin',
        'message',
        'cv_name',
        'cv_mime',
        'cv_data',
        'status',
    ];

    protected $hidden = ['cv_data'];

    protected function casts(): array
    {
        return [
            'experience' => 'integer',
        ];
    }
}
