<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // When this user joined the conversation
            $table->timestamp('joined_at')->useCurrent();

            // Admin control: mute user until this timestamp (null = not muted)
            $table->timestamp('muted_until')->nullable();

            // Track when user last read messages (for unread count)
            $table->timestamp('last_read_at')->nullable();

            $table->timestamps();

            // Prevent duplicate participants
            $table->unique(['conversation_id', 'user_id']);

            // Index for "conversations this user is in" queries
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_participants');
    }
};
