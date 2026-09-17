<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Images are stored in the database (not the local disk) because the
 * app runs on a host with an ephemeral filesystem — anything written to
 * disk disappears whenever the container restarts or redeploys, which
 * silently broke every uploaded thumbnail/category image after a few
 * hours. The database is a separate, persistent service, so this is
 * the fix that needs no new infrastructure.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->binary('thumbnail_data')->nullable()->after('thumbnail');
            $table->string('thumbnail_mime')->nullable()->after('thumbnail_data');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->binary('image_data')->nullable()->after('image');
            $table->string('image_mime')->nullable()->after('image_data');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['thumbnail_data', 'thumbnail_mime']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['image_data', 'image_mime']);
        });
    }
};
