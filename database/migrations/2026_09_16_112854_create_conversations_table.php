<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            // Optional title (null for 1:1 chats, set for group threads)
            $table->string('title')->nullable();

            // Is this a group conversation (3+ participants)?
            $table->boolean('is_group')->default(false);

            // Optional link to a matter (for matter-specific discussions)
            $table->foreignId('matter_id')->nullable()->constrained()->nullOnDelete();

            // Who created this conversation
            $table->foreignId('created_by_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            // Index for fetching conversations by matter
            $table->index('matter_id');

            // Index for sorting by recent activity
            $table->index('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
