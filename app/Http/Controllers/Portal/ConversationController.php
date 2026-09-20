<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Index — list client's conversations                                */
    /* ------------------------------------------------------------------ */

    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->whereNotNull('matter_id') // Client threads must have a matter
            ->with([
                'participants' => fn ($q) => $q->where('users.id', '!=', $user->id)->select('users.id', 'users.name'),
                'matter' => fn ($q) => $q->select('matters.id', 'matters.title', 'matters.file_number'),
                'latestMessage.sender' => fn ($q) => $q->select('users.id', 'users.name'),
            ])
            ->withCount(['messages as unread_count' => fn ($q) => $q
                ->where('sender_id', '!=', $user->id)
                ->whereDoesntHave('readBy', fn ($r) => $r->where('user_id', $user->id))])
            ->orderByRaw("COALESCE((SELECT MAX(created_at) FROM messages WHERE messages.conversation_id = conversations.id), conversations.updated_at) DESC")
            ->get()
            ->map(fn (Conversation $conversation) => [
                'id' => $conversation->id,
                'title' => $conversation->title ?: $conversation->participants->pluck('name')->join(', '),
                'matter' => $conversation->matter ? [
                    'id' => $conversation->matter->id,
                    'title' => $conversation->matter->title,
                    'file_number' => $conversation->matter->file_number,
                ] : null,
                'participants' => $conversation->participants->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
                'latest_message' => $conversation->latestMessage ? [
                    'id' => $conversation->latestMessage->id,
                    'body' => $conversation->latestMessage->body,
                    'sender' => [
                        'id' => $conversation->latestMessage->sender->id,
                        'name' => $conversation->latestMessage->sender->name,
                    ],
                    'created_at' => $conversation->latestMessage->created_at->toIso8601String(),
                ] : null,
                'unread_count' => $conversation->unread_count,
                'updated_at' => $conversation->updated_at->toIso8601String(),
            ]);

        \Log::info('👤 Client viewed inbox', [
            'client_user' => $user->email,
            'client_id' => $user->client_id,
            'total_conversations' => $conversations->count(),
            'total_unread' => $conversations->sum('unread_count'),
        ]);

        return response()->json(['conversations' => $conversations]);
    }

    /* ------------------------------------------------------------------ */
    /* Show — fetch messages for a conversation + mark as read            */
    /* ------------------------------------------------------------------ */

    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        // Verify client is a participant
        if (!$conversation->hasParticipant($user)) {
            \Log::warning('🚫 Client attempted to view forbidden thread', [
                'client_user' => $user->email,
                'conversation_id' => $conversation->id,
            ]);

            abort(403, 'You are not a participant in this conversation.');
        }

        // Verify conversation has a matter (client threads must)
        if (!$conversation->matter_id) {
            \Log::warning('🚫 Client attempted to view matter-less thread', [
                'client_user' => $user->email,
                'conversation_id' => $conversation->id,
            ]);

            abort(403, 'This conversation is not linked to a matter.');
        }

        $conversation->load([
            'participants' => fn ($q) => $q->where('users.id', '!=', $user->id)->select('users.id', 'users.name'),
            'matter' => fn ($q) => $q->select('matters.id', 'matters.title', 'matters.file_number'),
        ]);

        $messages = $conversation->messages()
            ->with([
                'sender' => fn ($q) => $q->select('users.id', 'users.name'),
                'readBy' => fn ($q) => $q->select('users.id', 'users.name'),
                'parent.sender' => fn ($q) => $q->select('users.id', 'users.name'),
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages as read
        $unreadMessageIds = $messages->filter(fn ($msg) => $msg->sender_id !== $user->id && !$msg->isReadBy($user))
            ->pluck('id')
            ->toArray();

        if (!empty($unreadMessageIds)) {
            $user->messagesRead()->attach($unreadMessageIds, ['read_at' => now()]);

            \Log::info('👤 Client marked messages as read', [
                'client_user' => $user->email,
                'conversation_id' => $conversation->id,
                'messages_marked_read' => count($unreadMessageIds),
            ]);
        }

        $mappedMessages = $messages->map(fn (Message $msg) => [
            'id' => $msg->id,
            'body' => $msg->body,
            'sender' => ['id' => $msg->sender->id, 'name' => $msg->sender->name],
            'is_mine' => $msg->sender_id === $user->id,
            'created_at' => $msg->created_at->toIso8601String(),
            'file' => $msg->hasAttachment() ? [
                'url' => $msg->fileUrl(),
                'name' => $msg->file_name,
                'size' => $msg->formattedFileSize(),
                'type' => $msg->file_type,
            ] : null,
            'parent' => $msg->parent ? [
                'id' => $msg->parent->id,
                'body' => $msg->parent->body,
                'sender' => ['id' => $msg->parent->sender->id, 'name' => $msg->parent->sender->name],
            ] : null,
            'read_by' => $msg->readBy->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'read_at' => $u->pivot->read_at,
            ]),
        ]);

        $otherParticipants = $conversation->participants->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]);

        \Log::info('👤 Client viewed thread', [
            'client_user' => $user->email,
            'conversation_id' => $conversation->id,
            'matter_id' => $conversation->matter_id,
            'messages_count' => $messages->count(),
            'unread_marked_read' => count($unreadMessageIds),
        ]);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title ?: $otherParticipants->pluck('name')->join(', '),
                'matter' => $conversation->matter ? [
                    'id' => $conversation->matter->id,
                    'title' => $conversation->matter->title,
                    'file_number' => $conversation->matter->file_number,
                ] : null,
                'participants' => $otherParticipants,
            ],
            'messages' => $mappedMessages,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Store message — reply only (client cannot start new threads)       */
    /* ------------------------------------------------------------------ */

    public function storeMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        // Verify client is a participant
        if (!$conversation->hasParticipant($user)) {
            \Log::warning('🚫 Client attempted to reply to forbidden thread', [
                'client_user' => $user->email,
                'conversation_id' => $conversation->id,
            ]);

            abort(403, 'You are not a participant in this conversation.');
        }

        // Verify conversation has a matter
        if (!$conversation->matter_id) {
            \Log::warning('🚫 Client attempted to reply to matter-less thread', [
                'client_user' => $user->email,
                'conversation_id' => $conversation->id,
            ]);

            abort(403, 'This conversation is not linked to a matter.');
        }

        $validated = $request->validate([
            'body' => ['required_without:file', 'nullable', 'string', 'max:10000'],
            'parent_id' => ['nullable', 'exists:messages,id'],
            'file' => ['nullable', 'file', 'max:5120'],
        ]);

        // If replying, verify parent message belongs to this conversation
        if (!empty($validated['parent_id'])) {
            $parent = Message::findOrFail($validated['parent_id']);
            if ($parent->conversation_id !== $conversation->id) {
                \Log::warning('🚫 Client attempted cross-conversation reply', [
                    'client_user' => $user->email,
                    'conversation_id' => $conversation->id,
                    'parent_conversation_id' => $parent->conversation_id,
                ]);

                abort(403, 'Cannot reply to a message from a different conversation.');
            }
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

        // Mark as read by sender
        $user->messagesRead()->attach($message->id, ['read_at' => now()]);

        // Update conversation timestamp
        $conversation->touch();

        $message->load(['sender', 'parent.sender', 'readBy']);

        // C.3.4.4: fire notification event when a message lands in a client-participant thread
        if ($conversation->participants()->whereNotNull('users.client_id')->exists()) {
            event(new \App\Events\ClientMessageReceived($message, $conversation, $user));
        }

        \Log::info('👤 Client replied to thread', [
            'client_user' => $user->email,
            'client_id' => $user->client_id,
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
            'has_attachment' => $message->hasAttachment(),
            'is_reply' => $message->isReply(),
        ]);

        return response()->json(['message' => $message->toThreadPayload($user)], 201);
    }
}
