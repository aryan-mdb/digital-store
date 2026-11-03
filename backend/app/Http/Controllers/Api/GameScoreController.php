<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\GameScore;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GameScoreController extends Controller
{
    use ApiResponse;

    private const TOP = 10;

    /**
     * Record a finished round. Scores come from the browser, so they are
     * only capped at what a round can produce — fine for a fun leaderboard.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'game' => ['required', Rule::in(array_keys(GameScore::MAX_SCORES))],
            'score' => ['required', 'integer', 'min:0'],
            'details' => ['nullable', 'array'],
        ]);
        $data['score'] = min($data['score'], GameScore::MAX_SCORES[$data['game']]);

        $user = $request->user();
        $previousBest = (int) GameScore::where('user_id', $user->id)->where('game', $data['game'])->max('score');

        GameScore::create([...$data, 'user_id' => $user->id]);

        $best = max($previousBest, $data['score']);

        return $this->success([
            'score' => $data['score'],
            'best' => $best,
            'is_new_best' => $data['score'] > $previousBest,
            'rank' => $this->rankOf($best, $data['game'], 'all'),
        ], 'Score saved', 201);
    }

    /**
     * Top players for one game (their best round) or overall (the sum of
     * their best round in each game), all time or for the current week.
     * Signed-in callers also get their own position, even outside the top.
     */
    public function leaderboard(Request $request)
    {
        $request->validate([
            'game' => ['nullable', Rule::in(['all', ...array_keys(GameScore::MAX_SCORES)])],
            'period' => ['nullable', Rule::in(['all', 'week'])],
        ]);
        $game = $request->input('game', 'all');
        $period = $request->input('period', 'all');

        $rows = DB::query()
            ->fromSub($this->totals($game, $period), 't')
            ->orderByDesc('points')
            ->orderBy('first_played')
            ->limit(self::TOP)
            ->get();

        $names = User::whereIn('id', $rows->pluck('user_id'))->pluck('name', 'id');
        $me = $request->user('sanctum');

        $entries = $rows->values()->map(fn ($row, $i) => [
            'rank' => $i + 1,
            'name' => $this->displayName($names[$row->user_id] ?? null),
            'points' => (int) $row->points,
            'plays' => (int) $row->plays,
            'is_me' => $me && $me->id === $row->user_id,
        ]);

        $mine = null;
        if ($me) {
            $myRow = DB::query()->fromSub($this->totals($game, $period), 't')->where('user_id', $me->id)->first();
            if ($myRow) {
                $mine = [
                    'rank' => $this->rankOf((int) $myRow->points, $game, $period),
                    'name' => $this->displayName($me->name),
                    'points' => (int) $myRow->points,
                    'plays' => (int) $myRow->plays,
                ];
            }
        }

        return $this->success([
            'game' => $game,
            'period' => $period,
            'players' => DB::query()->fromSub($this->totals($game, $period), 't')->count(),
            'entries' => $entries,
            'me' => $mine,
        ]);
    }

    /** One row per player: points (best per game, summed), rounds played, first round time. */
    private function totals(string $game, string $period): Builder
    {
        $perGame = DB::table('game_scores')
            ->select('user_id', 'game')
            ->selectRaw('MAX(score) AS best, COUNT(*) AS plays, MIN(created_at) AS first_played')
            ->when($game !== 'all', fn ($q) => $q->where('game', $game))
            ->when($period === 'week', fn ($q) => $q->where('created_at', '>=', now()->startOfWeek()))
            ->groupBy('user_id', 'game');

        return DB::query()
            ->fromSub($perGame, 'b')
            ->select('user_id')
            ->selectRaw('SUM(best) AS points, SUM(plays) AS plays, MIN(first_played) AS first_played')
            ->groupBy('user_id');
    }

    private function rankOf(int $points, string $game, string $period): int
    {
        return DB::query()->fromSub($this->totals($game, $period), 't')->where('points', '>', $points)->count() + 1;
    }

    /** "Priya Sharma" → "Priya S." so full names never appear on a public board. */
    private function displayName(?string $name): string
    {
        $parts = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY);
        if (! $parts) {
            return 'Player';
        }

        $first = Str::limit($parts[0], 14, '');

        return count($parts) > 1 ? $first.' '.Str::upper(Str::substr(end($parts), 0, 1)).'.' : $first;
    }
}
