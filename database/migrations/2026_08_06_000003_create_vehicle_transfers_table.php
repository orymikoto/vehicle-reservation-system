<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignUuid('origin_location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignUuid('destination_location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignUuid('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('origin_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('destination_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status'); // PENDING_ORIGIN, PENDING_DESTINATION, COMPLETED, REJECTED
            $table->text('remarks')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_transfers');
    }
};
