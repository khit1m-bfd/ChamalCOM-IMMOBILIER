<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Message\ConversationResource;
use App\Http\Resources\Message\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    // GET /api/v1/conversations
    public function conversations(): JsonResponse
    {
        $user = auth()->user();
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'participants' => fn ($q) => $q->where('user_id', '!=', $user->id)->with('profile'),
                'lastMessage',
                'property',
            ])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => ConversationResource::collection($conversations->items()),
            'meta'    => ['total' => $conversations->total(), 'current_page' => $conversations->currentPage()],
        ]);
    }

    // GET /api/v1/conversations/{conversation}/messages
    public function messages(Conversation $conversation): JsonResponse
    {
        $user = auth()->user();
        $this->authorizeParticipant($conversation, $user);

        $messages = $conversation->messages()
            ->with('sender.profile')
            ->latest()
            ->paginate(30);

        // Mark messages as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['is_read' => true, 'read_at' => now()]);

        // Update last_read_at
        DB::table('conversation_participants')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        return response()->json([
            'success' => true,
            'data'    => MessageResource::collection(array_reverse($messages->items())),
            'meta'    => ['total' => $messages->total(), 'current_page' => $messages->currentPage()],
        ]);
    }

    // POST /api/v1/conversations
    public function createConversation(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|uuid|exists:users,id',
            'property_id'  => 'nullable|uuid|exists:properties,id',
            'booking_id'   => 'nullable|uuid|exists:bookings,id',
            'message'      => 'required|string|max:5000',
        ]);

        $user      = auth()->user();
        $recipient = User::findOrFail($request->recipient_id);

        // Find existing conversation between these users for this property
        $conversation = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $recipient->id))
            ->when($request->property_id, fn ($q) => $q->where('property_id', $request->property_id))
            ->first();

        if (!$conversation) {
            $conversation = DB::transaction(function () use ($user, $recipient, $request) {
                $conv = Conversation::create([
                    'property_id' => $request->property_id,
                    'booking_id'  => $request->booking_id,
                ]);
                $conv->participants()->attach([$user->id, $recipient->id]);
                return $conv;
            });
        }

        // Send the initial message
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $request->message,
            'type'            => 'text',
        ]);
        $conversation->update(['last_message_at' => now()]);

        // Return the conversation resource (not the message)
        $conversation->load([
            'participants' => fn ($q) => $q->where('user_id', '!=', $user->id)->with('profile'),
            'lastMessage',
            'property',
        ]);

        return response()->json([
            'success' => true,
            'data'    => ConversationResource::make($conversation),
        ], 201);
    }

    // POST /api/v1/conversations/{conversation}/messages
    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($conversation, auth()->user());
        return $this->sendMessage($request, $conversation);
    }

    private function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => auth()->id(),
            'body'            => $request->message,
            'type'            => 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);
        $this->notificationService->notifyNewMessage($message);

        return response()->json([
            'success' => true,
            'data'    => MessageResource::make($message->load('sender')),
        ], 201);
    }

    // GET /api/v1/messages/unread-count
    public function unreadCount(): JsonResponse
    {
        $count = Message::whereHas('conversation.participants', fn ($q) => $q->where('user_id', auth()->id()))
            ->where('sender_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['success' => true, 'data' => ['count' => $count]]);
    }

    // POST /api/v1/conversations/{conversation}/read
    public function markRead(Conversation $conversation): JsonResponse
    {
        $user = auth()->user();
        $this->authorizeParticipant($conversation, $user);

        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['is_read' => true, 'read_at' => now()]);

        DB::table('conversation_participants')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        return response()->json(['success' => true]);
    }

    private function authorizeParticipant(Conversation $conversation, User $user): void
    {
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            abort(403, 'Not a conversation participant');
        }
    }
}
