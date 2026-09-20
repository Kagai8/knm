<?php
$clientUser = \App\Models\User::whereNotNull('client_id')->first();
$conversation = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $clientUser->id))
    ->whereNotNull('matter_id')
    ->latest()
    ->first();

if (!$conversation) {
    echo "No client conversation found — create one from the staff UI first\n";
    exit;
}

auth()->loginUsingId($clientUser->id);
$controller = app(\App\Http\Controllers\Portal\ConversationController::class);

$request = \Illuminate\Http\Request::create(
    '/portal/api/conversations/' . $conversation->id . '/messages',
    'POST',
    ['body' => 'Second client message - live test']
);
$request->headers->set('Accept', 'application/json');
$request->setUserResolver(fn () => $clientUser);

$response = $controller->storeMessage($request, $conversation);
echo 'Status: ' . $response->getStatusCode() . "\n";
echo $response->getStatusCode() === 201
    ? "✓ Client replied successfully\n"
    : "✗ Reply failed: " . $response->getContent() . "\n";
