<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plate_number', 50)->unique();
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->string('type', 50);
            $table->string('ownership', 50);
            $table->string('status', 50)->default('AVAILABLE');
            $table->timestamps();
            $table->softDeletes();

            $table->index('plate_number');
            $table->index('status');
            $table->index(['type', 'ownership']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
