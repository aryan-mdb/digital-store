<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Raw binary bytes bound through PDO as a plain string trip Postgres'
 * UTF-8 validation ("invalid byte sequence for encoding UTF8") — bytea
 * columns need special LOB binding that Eloquent's create()/update()
 * don't do automatically. Store base64-encoded text instead: it's
 * plain ASCII, so it round-trips through the query builder with no
 * special handling, at the cost of ~33% more storage (irrelevant for
 * image-sized payloads).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('thumbnail_data');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->longText('thumbnail_data')->nullable()->after('thumbnail');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('image_data');
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->longText('image_data')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('thumbnail_data');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->binary('thumbnail_data')->nullable()->after('thumbnail');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('image_data');
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->binary('image_data')->nullable()->after('image');
        });
    }
};
