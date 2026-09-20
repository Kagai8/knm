<?php

namespace App\Listeners;

use App\Events\ClientMessageReceived;

class LogClientMessageNotification
{
    /**
     * Log placeholder email notifications for client participants.
     * Stub — C.4.13 wires this to the real Communications layer.
     */
    public function handle(ClientMessageReceived $event): void
    {
        $conversation = $event->conversation;
        $message = $event->message;
        $sender = $event->sender;

        // Client participants only, excluding the sender
        $clientParticipants = $conversation->participants()
            ->whereNotNull('users.client_id')
            ->where('users.id', '!=', $sender->id)
            ->get();

        foreach ($clientParticipants as $clientUser) {
            // Future: preference check lands here in C.4.2
            $shouldEmail = true;

            if ($shouldEmail) {
                $matterInfo = $conversation->matter
                    ? "re: {$conversation->matter->file_number} ({$conversation->matter->title})"
                    : 're: untitled conversation';

                \Log::info('✉️ WOULD EMAIL client notification', [
                    'client_user' => $clientUser->email,
                    'client_name' => $clientUser->name,
                    'client_id' => $clientUser->client_id,
                    'matter' => $matterInfo,
                    'message_sender' => $sender->name,
                    'message_body' => $message->body,
                    'conversation_id' => $conversation->id,
                ]);
            }
        }
    }
}
