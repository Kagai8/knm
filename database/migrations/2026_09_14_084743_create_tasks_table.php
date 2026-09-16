<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('description')->nullable();

            // Optional link to a matter (internal admin tasks have none)
            $table->foreignId('matter_id')->nullable()->constrained()->nullOnDelete();

            // Who is responsible for doing the work
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();

            // Audit trail: who created it
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('due_date')->nullable();

            $table->string('priority')->default('medium');   // low | medium | high | urgent
            $table->string('status')->default('pending');    // pending | in_progress | completed | cancelled

            // Completion audit
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('completed_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // Fast lookups for "My Tasks" and overdue queues
            $table->index(['assignee_id', 'status']);
            $table->index(['status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
