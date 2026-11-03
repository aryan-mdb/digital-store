<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameScore extends Model
{
    public const GAME_QUIZ = 'quiz';
    public const GAME_MEMORY = 'memory';
    public const GAME_SPIN = 'spin';

    /** Highest score one round of each game can produce (scores are sent by the browser). */
    public const MAX_SCORES = [
        self::GAME_QUIZ => 1000,
        self::GAME_MEMORY => 1000,
        self::GAME_SPIN => 200,
    ];

    protected $fillable = [
        'user_id',
        'game',
        'score',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'details' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
