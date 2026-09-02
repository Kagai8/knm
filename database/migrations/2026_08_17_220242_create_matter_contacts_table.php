<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matter_contacts', function (Blueprint $table) {
            $table->id();

            // The matter
            $table->foreignId('matter_id')->constrained()->cascadeOnDelete();

            // The contact (opposing party, witness, expert, court, etc.)
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();

            // Their role in THIS matter, e.g. "opposing_counsel", "witness"
            $table->string('role')->nullable();

            $table->timestamps();

            // Prevent the same contact being linked twice to the same matter
            $table->unique(['matter_id', 'contact_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_contacts');
    }
};
