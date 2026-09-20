<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            // Which conversation this message belongs to
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();

            // Who sent this message
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();

            // Message content (supports markdown/formatting)
            $table->text('body');

            // Optional: parent message ID for replies (1-level threading)
            $table->foreignId('parent_id')->nullable()->constrained('messages')->nullOnDelete();

            // File attachment fields (all nullable)
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->string('file_type')->nullable();

            // Soft deletes for audit trail (messages are never truly deleted)
            $table->softDeletes();

            $table->timestamps();

            // Index for fetching messages in a conversation (most recent first)
            $table->index(['conversation_id', 'created_at']);

            // Index for finding replies to a specific message
            $table->index('parent_id');

            // Index for "messages sent by user" queries
            $table->index('sender_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
