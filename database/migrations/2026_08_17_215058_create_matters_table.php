<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matter_roles', function (Blueprint $table) {
            $table->id();

            // Display name, e.g. "Lead Advocate"
            $table->string('name');

            // Machine code, e.g. "lead_advocate"
            $table->string('code')->unique();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_roles');
    }
};
