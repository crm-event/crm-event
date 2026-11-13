<?php

namespace Tests\Feature\Admin;

use App\Models\Couple;
use App\Models\Review;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $jessica;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->jessica = User::factory()->admin()->create();
    }

    public function test_the_list_only_has_the_couples_that_can_be_invited(): void
    {
        $due = Wedding::factory()->booked()->create(['wedding_date' => now()->subDays(40)]);
        Wedding::factory()->booked()->create(['wedding_date' => now()->subDays(5)]);
        $invited = Wedding::factory()->booked()->create(['wedding_date' => now()->subDays(60)]);
        Review::factory()->for($invited)->create();

        $this->actingAs($this->jessica)
            ->get(route('admin.reviews.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Reviews/Index')
                ->has('weddings', 1)
                ->where('weddings.0.id', $due->id)
            );
    }

    public function test_jessica_invites_a_couple_once(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->booked()->for($couple)->create(['wedding_date' => now()->subDays(40)]);

        $this->actingAs($this->jessica)
            ->post(route('admin.reviews.store', $wedding))
            ->assertRedirect(route('admin.reviews.index'));

        $this->assertNotNull($wedding->review()->first()->requested_at);
        $this->assertDatabaseHas('messages', [
            'wedding_id' => $wedding->id,
            'sender_id' => $this->jessica->id,
        ]);

        $this->actingAs($this->jessica)
            ->post(route('admin.reviews.store', $wedding))
            ->assertStatus(422);

        $this->assertDatabaseCount('messages', 1);
    }

    public function test_jessica_sees_the_couples_waiting_to_answer_and_the_reviews_received(): void
    {
        $waiting = Review::factory()->create(['requested_at' => now()->subDays(3)]);
        $received = Review::factory()->submitted()->create(['rating' => 4, 'body' => 'Très belle journée.']);

        $this->actingAs($this->jessica)
            ->get(route('admin.reviews.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('pending', 1)
                ->where('pending.0.id', $waiting->id)
                ->has('received', 1)
                ->where('received.0.id', $received->id)
                ->where('received.0.rating', 4)
                ->where('received.0.would_recommend', true)
                ->where('received.0.body', 'Très belle journée.')
            );
    }

    public function test_couples_and_guests_cannot_invite(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->booked()->for($couple)->create(['wedding_date' => now()->subDays(40)]);

        $this->actingAs($couple->user)->get(route('admin.reviews.index'))->assertForbidden();
        $this->actingAs($couple->user)->post(route('admin.reviews.store', $wedding))->assertForbidden();

        auth()->logout();

        $this->get(route('admin.reviews.index'))->assertRedirect(route('login'));
    }
}
