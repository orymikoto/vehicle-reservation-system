<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reservation_code', 50)->unique();
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('vehicle_id')->constrained('vehicles');
            $table->foreignUuid('driver_id')->constrained('drivers');
            $table->string('purpose');
            $table->string('destination');
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->string('status', 50)->default('PENDING');
            $table->integer('current_approval_level')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index('reservation_code');
            $table->index('status');
            $table->index(['start_datetime', 'end_datetime']);
            $table->index(['vehicle_id', 'driver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
