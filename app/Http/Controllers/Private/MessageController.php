<?php

namespace App\Http\Controllers\Private;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    private function canSend(): bool
    {
        $user = auth()->user();

        // Explicit admin disable wins over every role, including super admin
        if ($user->messages_disabled) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission(Permission::MessagesSend);
    }

    private function canManage(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MessagesManage);
    }

    /* ------------------------------------------------------------------ */
    /* Store — send a message                                             */
    /* ------------------------------------------------------------------ */

    public function store(Request $request)
    {
        abort_unless($this->canSend(), 403);

        $user = auth()->user();

        $validated = $request->validate([
            'conversation_id' => ['required', 'exists:conversations,id'],
            'body' => ['required_without:file', 'nullable', 'string', 'max:10000'],
            'parent_id' => ['nullable', 'exists:messages,id'],
            'file' => ['nullable', 'file', 'max:5120'], // 5MB limit
        ]);

        // Verify user is a participant in this conversation
        $conversation = \App\Models\Conversation::findOrFail($validated['conversation_id']);
        abort_unless(
            $conversation->hasParticipant($user),
            403,
            'You are not a participant in this conversation.'
        );

        // Check if user is muted
        abort_unless(
            !$conversation->isUserMuted($user),
            403,
            'You are muted in this conversation.'
        );

        // If replying, verify parent message belongs to this conversation
        if (!empty($validated['parent_id'])) {
            $parent = \App\Models\Message::findOrFail($validated['parent_id']);
            abort_unless(
                $parent->conversation_id === $conversation->id,
                403,
                'Cannot reply to a message from a different conversation.'
            );
        }

        // Handle file upload
        $fileData = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('messages', 'public');

            $fileData = [
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientMimeType(),
            ];
        }

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $validated['body'] ?? '',
            'parent_id' => $validated['parent_id'] ?? null,
        ] + $fileData);

        // Mark as read by sender (they obviously saw their own message)
        $user->messagesRead()->attach($message->id, ['read_at' => now()]);

        // Update conversation timestamp (for sorting by recent activity)
        $conversation->touch();

        $message->load(['sender', 'parent.sender', 'readBy']);

        // C.3.4.4: fire notification event when a message lands in a client-participant thread
        if ($conversation->participants()->whereNotNull('users.client_id')->exists()) {
            event(new \App\Events\ClientMessageReceived($message, $conversation, $user));
        }

        \Log::info('💬 Message sent', [
            'message_id' => $message->id,
            'conversation_id' => $conversation->id,
            'sender' => $user->name,
            'has_attachment' => $message->hasAttachment(),
            'is_reply' => $message->isReply(),
            'response' => $request->expectsJson() ? 'json' : 'redirect',
        ]);

        // XHR sends (composer) get JSON back — no page reload
        if ($request->expectsJson()) {
            return response()->json(['message' => $message->toThreadPayload($user)], 201);
        }

        return back()->with('success', 'Message sent.');
    }

    /* ------------------------------------------------------------------ */
    /* Update — edit a message                                            */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, Message $message)
    {
        $user = auth()->user();

        // Only the sender or admin can edit
        abort_unless(
            $this->canManage() || $message->sender_id === $user->id,
            403,
            'You are not allowed to edit this message.'
        );

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $message->update(['body' => $validated['body']]);

        \Log::info('✏️ Message edited', [
            'message_id' => $message->id,
            'edited_by' => $user->name,
            'is_sender' => $message->sender_id === $user->id,
        ]);

        return back()->with('success', 'Message updated.');
    }

    /* ------------------------------------------------------------------ */
    /* Destroy — delete a message                                         */
    /* ------------------------------------------------------------------ */

        public function destroy(Message $message)
    {
        $user = auth()->user();

        // Only the sender or admin can delete
        abort_unless(
            $this->canManage() || $message->sender_id === $user->id,
            403,
            'You are not allowed to delete this message.'
        );

        \Log::info('🗑️ Message deleted', [
            'message_id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'deleted_by' => $user->name,
            'is_sender' => $message->sender_id === $user->id,
            'had_attachment' => $message->hasAttachment(),
        ]);

        // Soft delete: record preserved for audit, hidden from threads
        $message->delete();

        return back()->with('success', 'Message deleted.');
    }
}
