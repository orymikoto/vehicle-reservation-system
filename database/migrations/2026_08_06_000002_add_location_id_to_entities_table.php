<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->constrained('locations')->nullOnDelete();
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->constrained('locations')->cascadeOnDelete();
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->constrained('locations')->cascadeOnDelete();
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->constrained('locations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });
    }
};
