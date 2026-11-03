<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per finished round of an arcade game; the leaderboard ranks
 * each player by their best score.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('game', 20);
            $table->unsignedInteger('score');
            $table->json('details')->nullable();
            $table->timestamps();

            $table->index(['game', 'created_at']);
            $table->index(['user_id', 'game']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_scores');
    }
};
