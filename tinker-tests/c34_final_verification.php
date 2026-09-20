<?php

echo "=== C.3.4 STAFF↔CLIENT THREAD SUPPORT — FINAL VERIFICATION ===\n\n";

$staffUser = \App\Models\User::whereNull('client_id')->first();
$clientUser = \App\Models\User::whereNotNull('client_id')->first();
$client2 = \App\Models\User::whereNotNull('client_id')
    ->where('id', '!=', $clientUser->id)
    ->first();

$checks = [];

// --- C.3.4.1 Backend: Client-facing endpoints ---
echo "── C.3.4.1 Backend: client-facing endpoints ──\n";

// 1. Client user exists
$checks['client_user_exists'] = $clientUser !== null;
echo '  ' . ($checks['client_user_exists'] ? '✓' : '✗') . ' Client user: ' . ($clientUser?->email ?? 'NONE') . "\n";

// 2. Client linked to Client record
$checks['client_linked'] = $clientUser && $clientUser->client_id !== null;
echo '  ' . ($checks['client_linked'] ? '✓' : '✗') . ' Linked to Client ID: ' . ($clientUser?->client_id ?? 'null') . "\n";

// 3. isClient() works
$checks['isClient_works'] = $clientUser && $clientUser->isClient() && !$staffUser->isClient();
echo '  ' . ($checks['isClient_works'] ? '✓' : '✗') . " isClient(): client=TRUE, staff=FALSE\n";

// 4. Client middleware registered
$middleware = app('router')->getMiddleware();
$checks['client_middleware'] = isset($middleware['client']);
echo '  ' . ($checks['client_middleware'] ? '✓' : '✗') . " 'client' middleware alias registered\n";

// 5. Client can view inbox
auth()->loginUsingId($clientUser->id);
$controller = app(\App\Http\Controllers\Portal\ConversationController::class);
$request = \Illuminate\Http\Request::create('/portal/api/conversations');
$request->setUserResolver(fn () => $clientUser);
$response = $controller->index($request);
$checks['client_inbox'] = $response->getStatusCode() === 200;
echo '  ' . ($checks['client_inbox'] ? '✓' : '✗') . ' Client can view inbox (status ' . $response->getStatusCode() . ")\n";

// 6. Client cannot access forbidden thread
$forbidden = \App\Models\Conversation::whereDoesntHave('participants', fn ($q) => $q->where('user_id', $clientUser->id))->first();
$checks['forbidden_blocked'] = false;
if ($forbidden) {
    try {
        $request = \Illuminate\Http\Request::create('/x');
        $request->setUserResolver(fn () => $clientUser);
        $controller->show($request, $forbidden);
    } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
        $checks['forbidden_blocked'] = $e->getStatusCode() === 403;
    }
} else {
    $checks['forbidden_blocked'] = true;
}
echo '  ' . ($checks['forbidden_blocked'] ? '✓' : '✗') . " Client blocked from forbidden threads\n";

// 7. Client cannot access matter-less thread
$matterless = \App\Models\Conversation::create([
    'is_group' => false,
    'created_by_id' => $staffUser->id,
]);
$matterless->participants()->attach([$staffUser->id, $clientUser->id], ['joined_at' => now()]);
try {
    $request = \Illuminate\Http\Request::create('/x');
    $request->setUserResolver(fn () => $clientUser);
    $controller->show($request, $matterless);
    $checks['matterless_blocked'] = false;
} catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
    $checks['matterless_blocked'] = $e->getStatusCode() === 403;
}
$matterless->delete();
echo '  ' . ($checks['matterless_blocked'] ? '✓' : '✗') . " Client blocked from matter-less threads\n";

// 8. Client cannot start threads (no store method)
$checks['no_store_method'] = !method_exists($controller, 'store');
echo '  ' . ($checks['no_store_method'] ? '✓' : '✗') . " Portal controller has no store() method\n";

// --- C.3.4.3 Staff↔Client linking ---
echo "\n── C.3.4.3 Staff↔client thread linking ──\n";

// 9. Staff can create client thread with matter
auth()->loginUsingId($staffUser->id);
$matter = \App\Models\Matter::first();
$staffController = app(\App\Http\Controllers\Private\ConversationController::class);
$request = \Illuminate\Http\Request::create('/private/conversations', 'POST', [
    'participant_ids' => [$clientUser->id],
    'title' => 'Final verification thread',
    'matter_id' => $matter->id,
]);
$request->setUserResolver(fn () => $staffUser);
$response = $staffController->store($request);
$checks['staff_creates_client_thread'] = $response->getStatusCode() === 302;
echo '  ' . ($checks['staff_creates_client_thread'] ? '✓' : '✗') . " Staff creates client thread with matter\n";

// 10. Staff blocked from client thread without matter
$request = \Illuminate\Http\Request::create('/private/conversations', 'POST', [
    'participant_ids' => [$clientUser->id],
    'title' => 'Should fail',
]);
$request->setUserResolver(fn () => $staffUser);
$response = $staffController->store($request);
$errors = $response->getSession()->get('errors');
$checks['matter_required_validation'] = $response->getStatusCode() === 302 && $errors && $errors->has('matter_id');
echo '  ' . ($checks['matter_required_validation'] ? '✓' : '✗') . " Staff blocked from client thread without matter\n";

// --- C.3.4.4 Email notification stub ---
echo "\n── C.3.4.4 Email notification stub ──\n";

// 11. Event class exists
$checks['event_exists'] = class_exists(\App\Events\ClientMessageReceived::class);
echo '  ' . ($checks['event_exists'] ? '✓' : '✗') . " ClientMessageReceived event exists\n";

// 12. Listener class exists
$checks['listener_exists'] = class_exists(\App\Listeners\LogClientMessageNotification::class);
echo '  ' . ($checks['listener_exists'] ? '✓' : '✗') . " LogClientMessageNotification listener exists\n";

// 13. Event fires on staff→client (catch in-process)
$firedStaff = false;
\Illuminate\Support\Facades\Event::listen(\App\Events\ClientMessageReceived::class, function ($e) use (&$firedStaff) {
    $firedStaff = true;
});

// Find our newly created thread
$latestClientThread = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $clientUser->id))
    ->whereNotNull('matter_id')
    ->latest()
    ->first();

auth()->loginUsingId($staffUser->id);
$msgController = app(\App\Http\Controllers\Private\MessageController::class);
$request = \Illuminate\Http\Request::create('/private/messages', 'POST', [
    'conversation_id' => (string) $latestClientThread->id,
    'body' => 'Final verification staff→client',
]);
$request->setUserResolver(fn () => $staffUser);
$msgController->store($request);
$checks['event_fires_staff_to_client'] = $firedStaff;
echo '  ' . ($checks['event_fires_staff_to_client'] ? '✓' : '✗') . " Event fires on staff→client message\n";

// 14. Event fires on client→staff
$firedClient = false;
\Illuminate\Support\Facades\Event::listen(\App\Events\ClientMessageReceived::class, function ($e) use (&$firedClient) {
    $firedClient = true;
});

auth()->loginUsingId($clientUser->id);
$portalCtrl = app(\App\Http\Controllers\Portal\ConversationController::class);
$request = \Illuminate\Http\Request::create('/portal/api/conversations/' . $latestClientThread->id . '/messages', 'POST', [
    'body' => 'Final verification client→staff',
]);
$request->headers->set('Accept', 'application/json');
$request->setUserResolver(fn () => $clientUser);
$portalCtrl->storeMessage($request, $latestClientThread);
$checks['event_fires_client_to_staff'] = $firedClient;
echo '  ' . ($checks['event_fires_client_to_staff'] ? '✓' : '✗') . " Event fires on client→staff message\n";

// --- Summary ---
echo "\n════════════════════════════════════════════════════\n";
$failed = array_filter($checks, fn ($v) => !$v);
if (empty($failed)) {
    echo "✓ ALL " . count($checks) . " CHECKS PASSED — C.3.4 COMPLETE\n";
} else {
    echo "✗ FAILED: " . implode(', ', array_keys($failed)) . "\n";
}

// Cleanup test messages
\App\Models\Message::where('body', 'like', 'Final verification%')->forceDelete();
echo "\n✓ Test messages cleaned\n";
