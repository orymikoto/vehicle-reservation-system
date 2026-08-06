<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained('vehicles');
            $table->foreignUuid('driver_id')->constrained('drivers');
            $table->date('fuel_date');
            $table->decimal('fuel_amount', 10, 2);
            $table->decimal('fuel_cost', 14, 2);
            $table->integer('odometer');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'fuel_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_logs');
    }
};
