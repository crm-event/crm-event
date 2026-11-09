<?php

namespace Tests\Feature\Admin;

use App\Models\Couple;
use App\Models\Message;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $jessica;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->jessica = User::factory()->admin()->create();
    }

    public function test_the_inbox_lists_the_couples_with_access_most_recent_first_with_unread_counts(): void
    {
        $quiet = Couple::factory()->withPortalAccess()->create(['partner1_first_name' => 'Anna', 'partner2_first_name' => 'Tom']);
        $active = Couple::factory()->withPortalAccess()->create(['partner1_first_name' => 'Marie', 'partner2_first_name' => 'Paul']);
        Couple::factory()->create(['partner1_first_name' => 'Sans', 'partner2_first_name' => 'Accès']);

        $wedding = Wedding::factory()->for($active)->create();
        Message::factory()->for($wedding)->count(2)->create(['sender_id' => $active->user_id]);
        Message::factory()->for($wedding)->create(['sender_id' => $this->jessica->id, 'body' => 'Je vous réponds demain.']);

        $response = $this->actingAs($this->jessica)->get(route('admin.messages.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Messages/Index')
            ->has('threads', 2)
            ->where('threads.0.title', 'Marie & Paul')
            ->where('threads.0.unread_count', 2)
            ->where('threads.0.last_message', 'Je vous réponds demain.')
            ->where('threads.1.couple_id', $quiet->id)
            ->where('threads.1.last_message', null)
        );
    }

    public function test_the_inbox_labels_a_voice_message(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        Message::factory()->for($wedding)->create([
            'body' => null,
            'voice_note_path' => 'voice-notes/message.webm',
        ]);

        $this->actingAs($this->jessica)
            ->get(route('admin.messages.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('threads.0.last_message', 'Message vocal')
            );
    }

    public function test_opening_a_thread_marks_the_couple_s_messages_as_read(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $fromCouple = Message::factory()->for($wedding)->create(['sender_id' => $couple->user_id]);

        $response = $this->actingAs($this->jessica)->get(route('admin.messages.show', $couple));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Messages/Show')
            ->where('couple.id', $couple->id)
            ->has('messages', 1)
            ->where('canWrite', true)
        );
        $this->assertNotNull($fromCouple->fresh()->read_at);
    }

    public function test_jessica_can_reply_to_a_couple(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        $response = $this->actingAs($this->jessica)->post(route('admin.messages.store', $couple), [
            'body' => 'Bonjour, voici le devis mis à jour.',
        ]);

        $response->assertRedirect(route('admin.messages.show', $couple));
        $this->assertDatabaseHas('messages', [
            'wedding_id' => $wedding->id,
            'sender_id' => $this->jessica->id,
            'body' => 'Bonjour, voici le devis mis à jour.',
        ]);
    }

    public function test_jessica_can_send_a_voice_message(): void
    {
        Storage::fake();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        $response = $this->actingAs($this->jessica)->post(route('admin.messages.store', $couple), [
            'voice_note' => UploadedFile::fake()->create('message.webm', 500, 'audio/webm'),
        ]);

        $response->assertRedirect(route('admin.messages.show', $couple));
        $message = Message::query()->latest('id')->firstOrFail();

        $this->assertNull($message->body);
        $this->assertSame($wedding->id, $message->wedding_id);
        $this->assertNotNull($message->voice_note_path);
        Storage::assertExists($message->voice_note_path);
    }

    public function test_jessica_can_edit_and_delete_her_own_message(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $message = Message::factory()
            ->for(Wedding::factory()->for($couple))
            ->create(['sender_id' => $this->jessica->id, 'body' => 'Ancien texte']);

        $this->actingAs($this->jessica)
            ->patch(route('admin.messages.update', $message), ['body' => 'Nouveau texte'])
            ->assertRedirect(route('admin.messages.show', $couple));

        $this->assertSame('Nouveau texte', $message->fresh()->body);

        $this->actingAs($this->jessica)
            ->delete(route('admin.messages.destroy', $message))
            ->assertRedirect(route('admin.messages.show', $couple));

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_any_admin_account_can_edit_and_delete_a_message_sent_by_another_admin(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $message = Message::factory()
            ->for(Wedding::factory()->for($couple))
            ->create(['sender_id' => $this->jessica->id, 'body' => 'Ancien texte']);
        $otherAdmin = User::factory()->admin()->create();

        $this->actingAs($otherAdmin)
            ->get(route('admin.messages.show', $couple))
            ->assertInertia(fn (Assert $page) => $page->where('messages.0.is_own', true));

        $this->actingAs($otherAdmin)
            ->patch(route('admin.messages.update', $message), ['body' => 'Nouveau texte'])
            ->assertRedirect(route('admin.messages.show', $couple));

        $this->assertSame('Nouveau texte', $message->fresh()->body);

        $this->actingAs($otherAdmin)
            ->delete(route('admin.messages.destroy', $message))
            ->assertRedirect(route('admin.messages.show', $couple));

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_jessica_cannot_edit_a_message_sent_by_a_couple(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $message = Message::factory()
            ->for(Wedding::factory()->for($couple))
            ->create(['sender_id' => $couple->user_id, 'body' => 'Message du couple']);

        $this->actingAs($this->jessica)
            ->patch(route('admin.messages.update', $message), ['body' => 'Modifié'])
            ->assertForbidden();

        $this->assertSame('Message du couple', $message->fresh()->body);
    }

    public function test_jessica_cannot_write_to_a_couple_without_wedding(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($this->jessica)
            ->post(route('admin.messages.store', $couple), ['body' => 'Bonjour'])
            ->assertSessionHasErrors('body');

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_couples_and_guests_cannot_open_the_inbox(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($couple->user)->get(route('admin.messages.index'))->assertForbidden();
        $this->actingAs($couple->user)->get(route('admin.messages.show', $couple))->assertForbidden();

        auth()->logout();

        $this->get(route('admin.messages.index'))->assertRedirect(route('login'));
    }
}
