<?php

use App\Events\ClientMessageReceived;

// Catch the event in-process
\Illuminate\Support\Facades\Event::listen(ClientMessageReceived::class, function ($e) {
    echo "⚡ EVENT FIRED: ClientMessageReceived\n";
    echo '   message_id: ' . $e->message->id . "\n";
    echo '   conversation_id: ' . $e->conversation->id . "\n";
    echo '   sender: ' . $e->sender->name . "\n";
});

$staffUser = \App\Models\User::whereNull('client_id')->first();
$clientUser = \App\Models\User::whereNotNull('client_id')->first();
$conversation = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $clientUser->id))
    ->whereNotNull('matter_id')
    ->latest()
    ->first();

echo "--- Test 1: staff sends into client thread ---\n";
auth()->loginUsingId($staffUser->id);
$controller = app(\App\Http\Controllers\Private\MessageController::class);
$request = \Illuminate\Http\Request::create('/private/messages', 'POST', [
    'conversation_id' => (string) $conversation->id,
    'body' => 'Event dispatch test from staff',
]);
$request->setUserResolver(fn () => $staffUser);
$response = $controller->store($request);
echo 'Staff send status: ' . $response->getStatusCode() . "\n\n";

echo "--- Test 2: client replies into same thread ---\n";
auth()->loginUsingId($clientUser->id);
$portalController = app(\App\Http\Controllers\Portal\ConversationController::class);
$request2 = \Illuminate\Http\Request::create('/portal/api/conversations/' . $conversation->id . '/messages', 'POST', [
    'body' => 'Event dispatch test from client',
]);
$request2->headers->set('Accept', 'application/json');
$request2->setUserResolver(fn () => $clientUser);
$response2 = $portalController->storeMessage($request2, $conversation);
echo 'Client send status: ' . $response2->getStatusCode() . "\n\n";

echo "--- Test 3 (negative): staff-only thread must NOT fire ---\n";
$staffOnly = \App\Models\Conversation::whereDoesntHave('participants', fn ($q) => $q->whereNotNull('users.client_id'))
    ->whereHas('participants', fn ($q) => $q->where('user_id', $staffUser->id))
    ->first();

if ($staffOnly) {
    auth()->loginUsingId($staffUser->id);
    $request3 = \Illuminate\Http\Request::create('/private/messages', 'POST', [
        'conversation_id' => (string) $staffOnly->id,
        'body' => 'Staff-only thread no event expected',
    ]);
    $request3->setUserResolver(fn () => $staffUser);
    $controller->store($request3);
    echo "Staff-only send done — no EVENT line should appear above\n";
} else {
    echo "⚠ No staff-only conversation available for negative test\n";
}

// Cleanup test messages
\App\Models\Message::where('body', 'like', 'Event dispatch test%')->forceDelete();
\App\Models\Message::where('body', 'like', 'Staff-only thread no event%')->forceDelete();
echo "\n✓ Test messages cleaned\n";
