<?php
$clientUser = \App\Models\User::whereNotNull('client_id')->first();
$conversation = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $clientUser->id))
    ->whereNotNull('matter_id')
    ->latest()
    ->first();

$clientMessage = $conversation->messages()->where('sender_id', $clientUser->id)->latest()->first();
$readBy = $clientMessage->readBy()->pluck('users.name');

echo 'Client message: "' . $clientMessage->body . '"' . "\n";
echo 'Read by: ' . ($readBy->isEmpty() ? '(nobody yet)' : $readBy->join(', ')) . "\n";
echo $readBy->isNotEmpty()
    ? "✓ Read receipt recorded\n"
    : "✗ No read receipt yet — open the thread as staff first\n";
