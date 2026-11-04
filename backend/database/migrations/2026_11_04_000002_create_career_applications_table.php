<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Job applications from the Careers page. The CV is kept in the database
 * (like product images) because the host's filesystem is ephemeral.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('career_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('role');
            $table->unsignedTinyInteger('experience')->nullable();
            $table->string('linkedin', 500);
            $table->text('message')->nullable();
            $table->string('cv_name');
            $table->string('cv_mime', 100);
            $table->longText('cv_data');
            $table->string('status', 20)->default('new')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('career_applications');
    }
};
