<?php

$staffUser = \App\Models\User::whereNull('client_id')->first();
$clientUser = \App\Models\User::whereNotNull('client_id')->first();
$conversation = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $clientUser->id))
    ->whereNotNull('matter_id')
    ->latest()
    ->first();

echo "--- Test: staff sends message to client thread ---\n";
auth()->loginUsingId($staffUser->id);
$controller = app(\App\Http\Controllers\Private\MessageController::class);
$request = \Illuminate\Http\Request::create('/private/messages', 'POST', [
    'conversation_id' => (string) $conversation->id,
    'body' => 'Listener test from staff',
]);
$request->setUserResolver(fn () => $staffUser);
$response = $controller->store($request);
echo 'Staff send status: ' . $response->getStatusCode() . "\n\n";

echo "--- Test: client replies (should NOT notify themselves) ---\n";
auth()->loginUsingId($clientUser->id);
$portalController = app(\App\Http\Controllers\Portal\ConversationController::class);
$request2 = \Illuminate\Http\Request::create('/portal/api/conversations/' . $conversation->id . '/messages', 'POST', [
    'body' => 'Listener test from client',
]);
$request2->headers->set('Accept', 'application/json');
$request2->setUserResolver(fn () => $clientUser);
$response2 = $portalController->storeMessage($request2, $conversation);
echo 'Client send status: ' . $response2->getStatusCode() . "\n\n";

// Cleanup
\App\Models\Message::where('body', 'like', 'Listener test%')->forceDelete();
echo "✓ Test messages cleaned\n";
