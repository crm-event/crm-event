<?php

namespace Tests\Feature\Couple;

use App\Models\Couple;
use App\Models\Message;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_couple_sees_its_thread_and_jessica_s_messages_become_read(): void
    {
        $jessica = User::factory()->admin()->create();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $fromJessica = Message::factory()->for($wedding)->create(['sender_id' => $jessica->id, 'body' => 'Bienvenue !']);
        Message::factory()->create(['body' => 'Message d’un autre couple']);

        $response = $this->actingAs($couple->user)->get(route('couple.messages.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Messages')
            ->has('messages', 1)
            ->where('messages.0.body', 'Bienvenue !')
            ->where('messages.0.is_own', false)
            ->where('canWrite', true)
        );
        $this->assertNotNull($fromJessica->fresh()->read_at);
    }

    public function test_a_couple_can_send_a_message_on_its_latest_wedding(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create();
        $latest = Wedding::factory()->for($couple)->create();

        $response = $this->actingAs($couple->user)->post(route('couple.messages.store'), [
            'body' => '  Bonjour Jessica, une question sur le devis.  ',
        ]);

        $response->assertRedirect(route('couple.messages.index'));
        $this->assertDatabaseHas('messages', [
            'wedding_id' => $latest->id,
            'sender_id' => $couple->user_id,
            'body' => 'Bonjour Jessica, une question sur le devis.',
            'read_at' => null,
        ]);
    }

    public function test_a_couple_without_wedding_cannot_write_yet(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($couple->user)
            ->get(route('couple.messages.index'))
            ->assertInertia(fn (Assert $page) => $page->where('canWrite', false)->has('messages', 0));

        $this->actingAs($couple->user)
            ->post(route('couple.messages.store'), ['body' => 'Bonjour'])
            ->assertSessionHasErrors('body');

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_an_empty_message_is_rejected(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create();

        $this->actingAs($couple->user)
            ->post(route('couple.messages.store'), ['body' => '   '])
            ->assertSessionHasErrors(['body' => 'Votre message est vide.']);
    }

    public function test_the_admin_and_guests_cannot_open_the_couple_thread(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.messages.index'))
            ->assertForbidden();

        auth()->logout();

        $this->get(route('couple.messages.index'))->assertRedirect(route('login'));
    }
}
