<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_event_types', function (Blueprint $table) {
            $table->id();

            // Display name, e.g. "Court Hearing"
            $table->string('name');

            // Machine code, e.g. "court_hearing"
            $table->string('code')->unique();

            // Hex color for calendar display, e.g. "#891920"
            $table->string('color', 7)->default('#891920');

            // Is this a deadline type? (triggers different notifications later)
            $table->boolean('is_deadline')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_types');
    }
};
