<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClientMessageReceived
{
    use Dispatchable, SerializesModels;

    /**
     * Fired whenever a message lands in a conversation that includes
     * at least one client participant (either direction).
     */
    public function __construct(
        public Message $message,
        public Conversation $conversation,
        public User $sender,
    ) {}
}
