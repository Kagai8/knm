<?php

namespace App\Http\Controllers\Private;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Permission helpers                                                  */
    /* ------------------------------------------------------------------ */

    private function canViewOwn(): bool
    {
        return auth()->user()->isSuperAdmin()
            || auth()->user()->hasPermission(Permission::MessagesViewOwn)
            || auth()->user()->hasPermission(Permission::MessagesViewAll)
            || auth()->user()->hasPermission(Permission::MessagesManage);
    }

    private function canViewAll(): bool
    {
        return auth()->user()->isSuperAdmin()
            || auth()->user()->hasPermission(Permission::MessagesViewAll)
            || auth()->user()->hasPermission(Permission::MessagesManage);
    }

    private function canModerate(): bool
    {
        return auth()->user()->isSuperAdmin()
            || auth()->user()->hasPermission(Permission::MessagesModerate)
            || auth()->user()->hasPermission(Permission::MessagesManage);
    }

    private function canExport(): bool
    {
        return auth()->user()->isSuperAdmin()
            || auth()->user()->hasPermission(Permission::MessagesExport)
            || auth()->user()->hasPermission(Permission::MessagesManage);
    }

    private function canDisableUser(): bool
    {
        return auth()->user()->isSuperAdmin()
            || auth()->user()->hasPermission(Permission::MessagesDisableUser)
            || auth()->user()->hasPermission(Permission::MessagesManage);
    }

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
    /* Index — list conversations                                          */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): Response
    {
        abort_unless($this->canViewOwn(), 403);

        $user = auth()->user();

        // Fetch conversations where current user is a participant
        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with([
                'participants' => function ($query) use ($user) {
                    $query->where('user_id', '!=', $user->id)
                        ->select('users.id', 'users.name', 'users.client_id');
                },
                'matter' => function ($query) {
                    $query->select('matters.id', 'matters.title', 'matters.file_number');
                },
                'latestMessage.sender' => function ($query) {
                    $query->select('users.id', 'users.name');
                },
            ])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('sender_id', '!=', $user->id)
                    ->whereDoesntHave('readBy', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            }])
            ->orderByRaw("COALESCE((SELECT MAX(created_at) FROM messages WHERE messages.conversation_id = conversations.id), conversations.updated_at) DESC")
            ->get()
            ->map(function (Conversation $conversation) use ($user) {
                $latestMessage = $conversation->latestMessage;
                $otherParticipants = $conversation->participants->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'is_client' => $p->client_id !== null,
                ]);

                // For 1:1 conversations, use the other participant's name as title
                $displayTitle = $conversation->title;
                if (!$conversation->is_group && $otherParticipants->count() === 1) {
                    $displayTitle = $otherParticipants->first()['name'];
                } elseif (!$displayTitle) {
                    $displayTitle = $otherParticipants->pluck('name')->join(', ') ?: 'Untitled conversation';
                }

                return [
                    'id' => $conversation->id,
                    'title' => $displayTitle,
                    'is_group' => $conversation->is_group,
                    'matter' => $conversation->matter ? [
                        'id' => $conversation->matter->id,
                        'title' => $conversation->matter->title,
                        'file_number' => $conversation->matter->file_number,
                    ] : null,
                    'participants' => $otherParticipants,
                    'latest_message' => $latestMessage ? [
                        'id' => $latestMessage->id,
                        'body' => $latestMessage->body,
                        'sender' => [
                            'id' => $latestMessage->sender->id,
                            'name' => $latestMessage->sender->name,
                        ],
                        'created_at' => $latestMessage->created_at->toIso8601String(),
                        'has_attachment' => $latestMessage->hasAttachment(),
                        'file_name' => $latestMessage->file_name,
                    ] : null,
                    'unread_count' => $conversation->unread_count,
                    'updated_at' => $conversation->updated_at->toIso8601String(),
                ];
            });

        \Log::info('💬 Conversations loaded', [
            'user' => $user->name,
            'total_conversations' => $conversations->count(),
            'total_unread' => $conversations->sum('unread_count'),
        ]);

        // Staff list for participant selection (staff only — no client_id)
        $staff = \App\Models\User::whereNull('client_id')
            ->orderBy('name')
            ->get(['id', 'name', 'messages_disabled']);

        // Clients list for participant selection (linked user accounts only)
        $clients = \App\Models\User::whereNotNull('client_id')
            ->orderBy('name')
            ->get(['id', 'name', 'client_id']);

        // Matters list for optional linking (all matters — even closed ones may need discussion)
        $matters = \App\Models\Matter::orderBy('file_number')
            ->get(['id', 'title', 'file_number']);

        return Inertia::render('private/messages/Index', [
            'conversations' => $conversations,
            'staff' => $staff,
            'clients' => $clients,
            'matters' => $matters,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Show — fetch messages for a conversation                           */
    /* ------------------------------------------------------------------ */

    public function show(Conversation $conversation): Response
    {
        abort_unless($this->canViewOwn() || $this->canViewAll(), 403);

        $user = auth()->user();

        // Verify user is a participant in this conversation
        abort_unless(
            $conversation->hasParticipant($user),
            403,
            'You are not a participant in this conversation.'
        );

        // Load conversation with participants and matter
        $conversation->load([
            'participants' => function ($query) use ($user) {
                $query->where('user_id', '!=', $user->id)->select('users.id', 'users.name', 'users.client_id');
            },
            'matter' => function ($query) {
                $query->select('matters.id', 'matters.title', 'matters.file_number');
            },
        ]);

        // Fetch messages with sender info and read receipts
        $messages = $conversation->messages()
            ->with([
                'sender' => function ($query) {
                    $query->select('users.id', 'users.name');
                },
                'readBy' => function ($query) {
                    $query->select('users.id', 'users.name');
                },
                'parent.sender' => function ($query) {
                    $query->select('users.id', 'users.name');
                },
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages as read (add to message_reads pivot)
        $unreadMessageIds = $messages->filter(function ($msg) use ($user) {
            return $msg->sender_id !== $user->id && !$msg->isReadBy($user);
        })->pluck('id')->toArray();

        if (!empty($unreadMessageIds)) {
            $user->messagesRead()->attach($unreadMessageIds, ['read_at' => now()]);

            \Log::info('📖 Messages marked as read', [
                'user' => $user->name,
                'conversation_id' => $conversation->id,
                'messages_marked_read' => count($unreadMessageIds),
            ]);
        }

        // Map messages for frontend
        $mappedMessages = $messages->map(function ($msg) use ($user) {
            return [
                'id' => $msg->id,
                'body' => $msg->body,
                'sender' => [
                    'id' => $msg->sender->id,
                    'name' => $msg->sender->name,
                ],
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
                    'sender' => [
                        'id' => $msg->parent->sender->id,
                        'name' => $msg->parent->sender->name,
                    ],
                ] : null,
                'read_by' => $msg->readBy->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'read_at' => $u->pivot->read_at,
                ]),
            ];
        });

        // Determine display title (same logic as index)
        $otherParticipants = $conversation->participants->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'is_client' => $p->client_id !== null,
            'muted_until' => $p->pivot->muted_until
                ? \Carbon\Carbon::parse($p->pivot->muted_until)->toIso8601String()
                : null,
        ]);

        $displayTitle = $conversation->title;
        if (!$conversation->is_group && $otherParticipants->count() === 1) {
            $displayTitle = $otherParticipants->first()['name'];
        } elseif (!$displayTitle) {
            $displayTitle = $otherParticipants->pluck('name')->join(', ') ?: 'Untitled conversation';
        }

        $mappedConversation = [
            'id' => $conversation->id,
            'title' => $displayTitle,
            'is_group' => $conversation->is_group,
            'matter' => $conversation->matter ? [
                'id' => $conversation->matter->id,
                'title' => $conversation->matter->title,
                'file_number' => $conversation->matter->file_number,
            ] : null,
            'participants' => $otherParticipants,
        ];

        // Composer permission state for the frontend
        $sendBlockedReason = null;
        if ($user->messages_disabled) {
            $sendBlockedReason = 'Messaging has been disabled for your account.';
        } elseif (!$user->isSuperAdmin() && !$user->hasPermission(Permission::MessagesSend)) {
            $sendBlockedReason = 'You do not have permission to send messages.';
        } elseif ($conversation->isUserMuted($user)) {
            $sendBlockedReason = 'You are muted in this conversation.';
        }

        \Log::info('💬 Conversation viewed', [
            'user' => $user->name,
            'conversation_id' => $conversation->id,
            'messages_count' => $messages->count(),
            'unread_marked_read' => count($unreadMessageIds),
        ]);

        return Inertia::render('private/messages/Show', [
            'conversation' => $mappedConversation,
            'messages' => $mappedMessages,
            'can_send' => $sendBlockedReason === null,
            'send_blocked_reason' => $sendBlockedReason,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Store — create new conversation                                    */
    /* ------------------------------------------------------------------ */

    public function store(Request $request)
    {
        abort_unless($this->canSend(), 403);

        $user = auth()->user();

        $validated = $request->validate([
            'participant_ids' => ['required', 'array', 'min:1'],
            'participant_ids.*' => ['integer', 'exists:users,id', 'not_in:' . $user->id],
            'title' => ['nullable', 'string', 'max:255'],
            'matter_id' => ['nullable', 'exists:matters,id'],
        ]);

        $participantIds = collect($validated['participant_ids'])->map(fn ($id) => (int) $id)->unique()->values();

        // Server-side enforcement: client threads require matter
        $hasClientParticipant = \App\Models\User::whereIn('id', $participantIds)
            ->whereNotNull('client_id')
            ->exists();

        if ($hasClientParticipant && empty($validated['matter_id'])) {
            \Log::warning('🚫 Staff attempted client thread without matter', [
                'staff_user' => $user->email,
                'participant_ids' => $participantIds->all(),
            ]);

            return back()->withErrors(['matter_id' => 'Conversations with clients must be linked to a matter.']);
        }

        // For 1:1 requests: reuse an existing empty-of-others 1:1 thread instead of duplicating
        if ($participantIds->count() === 1) {
            $otherId = $participantIds->first();

            $existing = Conversation::where('is_group', false)
                ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
                ->whereHas('participants', fn ($q) => $q->where('user_id', $otherId))
                ->whereDoesntHave('participants', fn ($q) => $q->whereNotIn('user_id', [$user->id, $otherId]))
                ->first();

            if ($existing) {
                \Log::info('💬 Reusing existing 1:1 conversation', [
                    'user' => $user->name,
                    'conversation_id' => $existing->id,
                ]);

                return redirect()->route('conversations.show', $existing);
            }
        }

        $conversation = Conversation::create([
            'title' => $validated['title'] ?? null,
            'is_group' => $participantIds->count() + 1 > 2,
            'matter_id' => $validated['matter_id'] ?? null,
            'created_by_id' => $user->id,
        ]);

        // Attach self + chosen participants
        $conversation->participants()->attach(
            $participantIds->push($user->id)->unique()->all(),
            ['joined_at' => now()]
        );

        \Log::info('💬 Conversation created', [
            'conversation_id' => $conversation->id,
            'created_by' => $user->name,
            'participants' => $conversation->participants()->pluck('users.name'),
            'is_group' => $conversation->is_group,
            'matter_id' => $conversation->matter_id,
        ]);

        return redirect()
            ->route('conversations.show', $conversation)
            ->with('success', 'Conversation created.');
    }

    /* ------------------------------------------------------------------ */
    /* Update — edit conversation title/settings                          */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, Conversation $conversation)
    {
        abort_unless($this->canManage(), 403);

        // TODO: validate + update
        return back()->with('success', 'Conversation updated.');
    }

    /* ------------------------------------------------------------------ */
    /* Destroy — delete conversation (soft or hard)                       */
    /* ------------------------------------------------------------------ */

    public function destroy(Conversation $conversation)
    {
        abort_unless($this->canManage(), 403);

        // TODO: delete conversation + messages
        return back()->with('success', 'Conversation deleted.');
    }

    /* ------------------------------------------------------------------ */
    /* Add participant                                                     */
    /* ------------------------------------------------------------------ */

    public function addParticipant(Request $request, Conversation $conversation)
    {
        $user = auth()->user();

        // Must be able to send messages AND be a participant (or admin)
        abort_unless($this->canSend(), 403);
        abort_unless(
            $this->canManage() || $conversation->hasParticipant($user),
            403,
            'You are not allowed to add participants to this conversation.'
        );

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $newUser = User::findOrFail($validated['user_id']);

        abort_if(
            $conversation->hasParticipant($newUser),
            422,
            'That user is already a participant.'
        );

        $conversation->participants()->attach($newUser->id, ['joined_at' => now()]);

        // A 1:1 that gains a third person becomes a group
        if (!$conversation->is_group && $conversation->participants()->count() > 2) {
            $conversation->update(['is_group' => true]);
        }

        $conversation->touch();

        \Log::info('➕ Participant added', [
            'conversation_id' => $conversation->id,
            'added_by' => $user->name,
            'new_participant' => $newUser->name,
            'now_group' => $conversation->is_group,
        ]);

        return back()->with('success', $newUser->name . ' added to the conversation.');
    }

    /* ------------------------------------------------------------------ */
    /* Remove participant (or leave)                                       */
    /* ------------------------------------------------------------------ */

    public function removeParticipant(Request $request, Conversation $conversation, User $participant)
    {
        $user = auth()->user();
        $isSelf = $participant->id === $user->id;

        // Admin can remove anyone; anyone can remove themselves (leave)
        abort_unless(
            $this->canManage() || $isSelf,
            403,
            'You are not allowed to remove participants from this conversation.'
        );

        abort_unless(
            $conversation->hasParticipant($participant),
            422,
            'That user is not a participant in this conversation.'
        );

        $conversation->participants()->detach($participant->id);
        $conversation->touch();

        \Log::info('➖ Participant removed', [
            'conversation_id' => $conversation->id,
            'removed_by' => $user->name,
            'removed_user' => $participant->name,
            'was_self_leave' => $isSelf,
        ]);

        return back()->with('success', $isSelf ? 'You left the conversation.' : $participant->name . ' removed from the conversation.');
    }

    /* ------------------------------------------------------------------ */
    /* Admin: mute / unmute a participant in this conversation            */
    /* ------------------------------------------------------------------ */

    public function muteParticipant(Request $request, Conversation $conversation)
    {
        abort_unless($this->canModerate(), 403, 'You are not allowed to mute users.');

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'minutes' => ['required', 'integer', 'min:0'], // 0 = unmute
        ]);

        $target = User::findOrFail($validated['user_id']);

        abort_unless(
            $conversation->hasParticipant($target),
            422,
            'That user is not a participant in this conversation.'
        );

        $mutedUntil = $validated['minutes'] > 0 ? now()->addMinutes($validated['minutes']) : null;

        $conversation->participants()->updateExistingPivot($target->id, ['muted_until' => $mutedUntil]);

        \Log::info($mutedUntil ? '🔇 Participant muted' : '🔊 Participant unmuted', [
            'conversation_id' => $conversation->id,
            'target' => $target->name,
            'muted_until' => $mutedUntil?->toIso8601String(),
            'by' => auth()->user()->name,
        ]);

        return back()->with('success', $mutedUntil
            ? $target->name . ' muted until ' . $mutedUntil->format('d M Y H:i') . '.'
            : $target->name . ' unmuted.');
    }

    /* ------------------------------------------------------------------ */
    /* Admin: globally disable / re-enable messaging for a user           */
    /* ------------------------------------------------------------------ */

    public function setMessagingDisabled(Request $request, User $user)
    {
        abort_unless($this->canDisableUser(), 403, 'You are not allowed to block users from messaging.');

        $validated = $request->validate([
            'disabled' => ['required', 'boolean'],
        ]);

        $user->messages_disabled = $validated['disabled'];
        $user->save();

        \Log::info($validated['disabled'] ? '🚫 Messaging disabled for user' : '✅ Messaging re-enabled for user', [
            'target' => $user->name,
            'by' => auth()->user()->name,
        ]);

        return back()->with('success', $validated['disabled']
            ? 'Messaging disabled for ' . $user->name . '.'
            : 'Messaging re-enabled for ' . $user->name . '.');
    }

    /* ------------------------------------------------------------------ */
    /* Export conversation (compliance record, includes deleted messages) */
    /* ------------------------------------------------------------------ */

    public function export(Conversation $conversation)
    {
        $user = auth()->user();

        abort_unless(
            $this->canExport() || $conversation->hasParticipant($user),
            403,
            'You are not allowed to export this conversation.'
        );

        $messages = $conversation->messages()
            ->withTrashed()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        $lines = [];
        $lines[] = 'CONVERSATION EXPORT';
        $lines[] = 'Title: ' . ($conversation->title ?: '(untitled)');
        $lines[] = 'Matter: ' . ($conversation->matter
            ? $conversation->matter->file_number . ' - ' . $conversation->matter->title
            : 'none');
        $lines[] = 'Participants: ' . $conversation->participants()->pluck('users.name')->join(', ');
        $lines[] = 'Exported by: ' . $user->name . ' at ' . now()->format('Y-m-d H:i:s');
        $lines[] = str_repeat('-', 60);

        foreach ($messages as $msg) {
            $lines[] = '[' . $msg->created_at->format('Y-m-d H:i:s') . '] ' . $msg->sender->name . ': ' . $msg->body
                . ($msg->hasAttachment() ? ' [attachment: ' . $msg->file_name . ']' : '')
                . ($msg->trashed() ? ' [DELETED]' : '');
        }

        \Log::info('📤 Conversation exported', [
            'conversation_id' => $conversation->id,
            'exported_by' => $user->name,
            'messages_count' => $messages->count(),
        ]);

        $filename = 'conversation-' . $conversation->id . '-' . now()->format('Ymd-His') . '.txt';

        return response()->streamDownload(function () use ($lines) {
            echo implode(PHP_EOL, $lines);
        }, $filename, ['Content-Type' => 'text/plain']);
    }

    /* ------------------------------------------------------------------ */
    /* Polling: inbox snapshot (unread counts + latest previews)          */
    /* ------------------------------------------------------------------ */

    public function pollInbox(Request $request)
    {
        abort_unless($this->canViewOwn(), 403);

        $user = auth()->user();

        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'participants' => fn ($q) => $q->where('user_id', '!=', $user->id)->select('users.id', 'users.name', 'users.client_id'),
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
                'title' => $this->displayTitle($conversation),
                'is_group' => $conversation->is_group,
                'matter' => $conversation->matter ? [
                    'id' => $conversation->matter->id,
                    'title' => $conversation->matter->title,
                    'file_number' => $conversation->matter->file_number,
                ] : null,
                'participants' => $conversation->participants->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'is_client' => $p->client_id !== null,
                ]),
                'latest_message' => $conversation->latestMessage ? [
                    'id' => $conversation->latestMessage->id,
                    'body' => $conversation->latestMessage->body,
                    'sender' => [
                        'id' => $conversation->latestMessage->sender->id,
                        'name' => $conversation->latestMessage->sender->name,
                    ],
                    'created_at' => $conversation->latestMessage->created_at->toIso8601String(),
                    'has_attachment' => $conversation->latestMessage->hasAttachment(),
                    'file_name' => $conversation->latestMessage->file_name,
                ] : null,
                'unread_count' => $conversation->unread_count,
                'updated_at' => $conversation->updated_at->toIso8601String(),
            ]);

        return response()->json(['conversations' => $conversations]);
    }

    /* ------------------------------------------------------------------ */
    /* Polling: new messages in a thread + live read receipts             */
    /* ------------------------------------------------------------------ */

        public function pollMessages(Request $request, Conversation $conversation)
    {
        $user = auth()->user();

        abort_unless(
            ($this->canViewOwn() || $this->canViewAll()) && $conversation->hasParticipant($user),
            403
        );

        $after = (int) $request->query('after', 0);

        $messages = $conversation->messages()
            ->with(['sender', 'readBy', 'parent.sender'])
            ->where('messages.id', '>', $after)
            ->orderBy('messages.id')
            ->get()
            ->map(fn (Message $msg) => $this->mapMessage($msg, $user));

        $receipts = $conversation->messages()
            ->where('sender_id', $user->id)
            ->with('readBy')
            ->get()
            ->map(fn (Message $msg) => [
                'id' => $msg->id,
                'read_by' => $msg->readBy->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'read_at' => $u->pivot->read_at,
                ]),
            ]);

        if ($messages->isNotEmpty()) {
            \Log::info('📡 Poll delivered new messages', [
                'conversation_id' => $conversation->id,
                'user' => $user->name,
                'count' => $messages->count(),
            ]);
        }

        return response()->json(['messages' => $messages, 'receipts' => $receipts]);
    }

    /* ------------------------------------------------------------------ */
    /* Mark messages as read (called by the live poller)                  */
    /* ------------------------------------------------------------------ */

        public function markRead(Request $request, Conversation $conversation)
    {
        $user = auth()->user();

        abort_unless($conversation->hasParticipant($user), 403);

        $validated = $request->validate([
            'message_ids' => ['required', 'array'],
            'message_ids.*' => ['integer'],
        ]);

        $already = \DB::table('message_reads')
            ->where('user_id', $user->id)
            ->whereIn('message_id', $validated['message_ids'])
            ->pluck('message_id');

        $new = array_values(array_diff($validated['message_ids'], $already->all()));

        if (!empty($new)) {
            $user->messagesRead()->attach(
                collect($new)->mapWithKeys(fn ($id) => [$id => ['read_at' => now()]])->all()
            );

            \Log::info('📖 Marked read (live poller)', [
                'user' => $user->name,
                'conversation_id' => $conversation->id,
                'message_ids' => $new,
            ]);
        }

        return response()->json(['ok' => true, 'marked' => count($new)]);
    }

    /* ------------------------------------------------------------------ */
    /* Unread total for the sidebar badge                                 */
    /* ------------------------------------------------------------------ */

    public function unreadCount()
    {
        abort_unless($this->canViewOwn(), 403);

        $user = auth()->user();

        $conversationIds = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->pluck('id');

        $count = Message::whereIn('conversation_id', $conversationIds)
            ->where('sender_id', '!=', $user->id)
            ->whereDoesntHave('readBy', fn ($r) => $r->where('user_id', $user->id))
            ->count();

        return response()->json(['count' => $count]);
    }

    /* ------------------------------------------------------------------ */
    /* Search message bodies across the user's conversations              */
    /* ------------------------------------------------------------------ */

    public function searchMessages(Request $request)
    {
        abort_unless($this->canViewOwn() || $this->canViewAll(), 403);

        $user = auth()->user();
        $q = trim((string) $request->query('q', ''));

        if (mb_strlen($q) < 3) {
            return response()->json(['results' => []]);
        }

        // Escape LIKE wildcards so users can search literal % and _
        $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $q) . '%';

        $conversationIds = Conversation::whereHas('participants', fn ($qq) => $qq->where('user_id', $user->id))
            ->pluck('id');

        $results = Message::whereIn('conversation_id', $conversationIds)
            ->where(fn ($qq) => $qq->where('body', 'ilike', $like)->orWhere('file_name', 'ilike', $like))
            ->with([
                'sender' => fn ($sq) => $sq->select('users.id', 'users.name'),
                'conversation.matter' => fn ($mq) => $mq->select('matters.id', 'matters.title', 'matters.file_number'),
                'conversation.participants' => fn ($pq) => $pq->where('users.id', '!=', $user->id)->select('users.id', 'users.name'),
            ])
            ->latest()
            ->limit(25)
            ->get()
            ->map(fn (Message $m) => [
                'id' => $m->id,
                'conversation_id' => $m->conversation_id,
                'conversation_title' => $this->displayTitle($m->conversation),
                'sender' => ['id' => $m->sender->id, 'name' => $m->sender->name],
                'body' => $m->body,
                'file_name' => $m->file_name,
                'created_at' => $m->created_at->toIso8601String(),
            ]);

        \Log::info('🔎 Message search', [
            'user' => $user->name,
            'query' => $q,
            'results' => $results->count(),
        ]);

        return response()->json(['results' => $results]);
    }

    /* ------------------------------------------------------------------ */
    /* Typing indicators (cache-backed heartbeat)                         */
    /* ------------------------------------------------------------------ */

    public function typingHeartbeat(Conversation $conversation)
    {
        $user = auth()->user();

        abort_unless($conversation->hasParticipant($user), 403);

        \Cache::put("typing:{$conversation->id}:{$user->id}", $user->name, now()->addSeconds(5));

        return response()->json(['ok' => true]);
    }

    public function typingStatus(Conversation $conversation)
    {
        $user = auth()->user();

        abort_unless($conversation->hasParticipant($user), 403);

        $typing = $conversation->participants()
            ->where('users.id', '!=', $user->id)
            ->pluck('users.id')
            ->map(fn ($id) => [
                'id' => $id,
                'name' => \Cache::get("typing:{$conversation->id}:{$id}"),
            ])
            ->filter(fn ($t) => !empty($t['name']))
            ->values();

        return response()->json(['typing' => $typing]);
    }

    /* ------------------------------------------------------------------ */
    /* Shared helpers                                                      */
    /* ------------------------------------------------------------------ */


    private function displayTitle(Conversation $conversation): string
    {
        if ($conversation->title) {
            return $conversation->title;
        }

        $names = $conversation->participants->pluck('name');

        if (!$conversation->is_group && $names->count() === 1) {
            return $names->first();
        }

        return $names->join(', ') ?: 'Untitled conversation';
    }

    private function mapMessage(Message $msg, User $user): array
    {
        return [
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
        ];
    }
}
