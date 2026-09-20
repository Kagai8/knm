<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_reads', function (Blueprint $table) {
            $table->id();

            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // When this user read this message (for blue-checkmark receipts)
            $table->timestamp('read_at')->useCurrent();

            // One read receipt per user per message
            $table->unique(['message_id', 'user_id']);

            // Index for "messages this user has read" queries
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reads');
    }
};