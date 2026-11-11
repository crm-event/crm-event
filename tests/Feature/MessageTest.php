<?php

namespace Tests\Feature;

use App\Models\Couple;
use App\Models\Message;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_thread_of_a_couple_gathers_the_messages_of_all_its_weddings_oldest_first(): void
    {
        $couple = Couple::factory()->create();
        $firstWedding = Wedding::factory()->for($couple)->create();
        $secondWedding = Wedding::factory()->for($couple)->create();

        $later = Message::factory()->for($secondWedding)->create(['created_at' => now()->addHour()]);
        $earlier = Message::factory()->for($firstWedding)->create(['created_at' => now()]);
        Message::factory()->create();

        $this->assertSame([$earlier->id, $later->id], $couple->messages->pluck('id')->all());
    }

    public function test_new_messages_go_to_the_latest_wedding(): void
    {
        $couple = Couple::factory()->create();
        Wedding::factory()->for($couple)->create();
        $latest = Wedding::factory()->for($couple)->create();

        $this->assertTrue($couple->latestWedding->is($latest));
    }

    public function test_only_the_messages_received_and_not_read_are_unread(): void
    {
        $reader = User::factory()->create();
        $received = Message::factory()->create(['sender_id' => User::factory()]);
        Message::factory()->create(['sender_id' => $reader->id]);
        Message::factory()->read()->create(['sender_id' => User::factory()]);

        $this->assertSame([$received->id], Message::unreadFor($reader)->pluck('id')->all());
    }

    public function test_marking_as_read_leaves_the_reader_s_own_messages_untouched(): void
    {
        $reader = User::factory()->create();
        $received = Message::factory()->create(['sender_id' => User::factory()]);
        $sent = Message::factory()->create(['sender_id' => $reader->id]);

        Message::markAsReadBy($reader, [$received, $sent]);

        $this->assertNotNull($received->fresh()->read_at);
        $this->assertNull($sent->fresh()->read_at);
    }

    public function test_the_thread_item_tells_who_sent_the_message(): void
    {
        $jessica = User::factory()->admin()->create();
        $message = Message::factory()->create(['sender_id' => $jessica->id, 'body' => 'Bonjour !']);
        $couple = User::factory()->create();

        $item = $message->toThreadItem($couple);

        $this->assertSame('Bonjour !', $item['body']);
        $this->assertFalse($item['is_own']);
        $this->assertTrue($item['sender_is_admin']);
        $this->assertTrue($message->toThreadItem($jessica)['is_own']);
    }

    public function test_every_admin_sees_the_messages_of_any_admin_as_their_own(): void
    {
        $jessica = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        $fromJessica = Message::factory()->create(['sender_id' => $jessica->id]);
        $fromCouple = Message::factory()->create(['sender_id' => User::factory()]);
        $fromDeletedAccount = Message::factory()->create(['sender_id' => null]);

        $this->assertTrue($fromJessica->toThreadItem($otherAdmin)['is_own']);
        $this->assertFalse($fromCouple->toThreadItem($otherAdmin)['is_own']);
        $this->assertFalse($fromDeletedAccount->toThreadItem($otherAdmin)['is_own']);
    }

    public function test_for_an_admin_only_the_messages_of_couples_are_unread(): void
    {
        $admin = User::factory()->admin()->create();
        $fromCouple = Message::factory()->create(['sender_id' => User::factory()]);
        $fromDeletedAccount = Message::factory()->create(['sender_id' => null]);
        Message::factory()->create(['sender_id' => User::factory()->admin()]);

        $this->assertEqualsCanonicalizing(
            [$fromCouple->id, $fromDeletedAccount->id],
            Message::unreadFor($admin)->pluck('id')->all(),
        );
    }

    public function test_an_admin_opening_a_thread_does_not_mark_another_admin_s_messages_as_read(): void
    {
        $admin = User::factory()->admin()->create();
        $fromAnotherAdmin = Message::factory()->create(['sender_id' => User::factory()->admin()]);

        Message::markAsReadBy($admin, [$fromAnotherAdmin]);

        $this->assertNull($fromAnotherAdmin->fresh()->read_at);
    }

    public function test_a_voice_message_whose_file_is_missing_has_no_url(): void
    {
        Storage::fake();
        Storage::put('voice-notes/here.webm', 'audio');
        $viewer = User::factory()->create();
        $playable = Message::factory()->create(['body' => null, 'voice_note_path' => 'voice-notes/here.webm']);
        $missing = Message::factory()->create(['body' => null, 'voice_note_path' => 'voice-notes/elsewhere.webm']);

        $this->assertNotNull($playable->toThreadItem($viewer)['voice_note_url']);

        $item = $missing->toThreadItem($viewer);
        $this->assertTrue($item['has_voice_note']);
        $this->assertNull($item['voice_note_url']);
    }
}
