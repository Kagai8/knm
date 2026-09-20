<?php
$clientUser = \App\Models\User::whereNotNull('client_id')->first();
$conversation = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $clientUser->id))
    ->whereNotNull('matter_id')
    ->latest()
    ->first();

\Cache::put("typing:{$conversation->id}:{$clientUser->id}", $clientUser->name, now()->addSeconds(10));
echo "✓ Client typing heartbeat set (expires in 10s) — watch the staff thread\n";
