<?php

namespace Tests\Feature\Couple;

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

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * A couple whose wedding is over and whom Jessica invited to leave a review.
     */
    private function invitedCouple(): Couple
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->booked()->for($couple)->create(['wedding_date' => now()->subDays(40)]);
        Review::factory()->for($wedding)->create();

        return $couple;
    }

    /**
     * @return array{rating: int, would_recommend: bool, body: string}
     */
    private function validReview(): array
    {
        return ['rating' => 5, 'would_recommend' => true, 'body' => 'Une journée parfaite, merci Jessica.'];
    }

    public function test_a_couple_not_invited_yet_sees_no_form_and_no_menu_entry(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create();

        $this->actingAs($couple->user)
            ->get(route('couple.review.show'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Couple/Review')
                ->where('review', null)
                ->where('coupleReview', null)
            );
    }

    public function test_an_invited_couple_is_asked_for_their_review(): void
    {
        $couple = $this->invitedCouple();

        $this->actingAs($couple->user)
            ->get(route('couple.review.show'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('review.submitted_at', null)
                ->where('coupleReview', 'awaiting')
                ->where('coupleNotifications.0.key', 'review')
                ->where('coupleNotifications.0.route', 'couple.review.show')
            );
    }

    public function test_a_couple_leaves_their_review_once(): void
    {
        $couple = $this->invitedCouple();
        $review = $couple->latestWedding->review;

        $this->actingAs($couple->user)
            ->post(route('couple.review.store'), $this->validReview())
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('couple.review.show'));

        $review->refresh();
        $this->assertSame(5, $review->rating);
        $this->assertTrue($review->would_recommend);
        $this->assertSame('Une journée parfaite, merci Jessica.', $review->body);
        $this->assertNotNull($review->submitted_at);

        $this->get(route('couple.review.show'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('review.rating', 5)
                ->where('coupleReview', 'submitted')
                ->where('coupleNotifications', fn ($notifications) => collect($notifications)->doesntContain('key', 'review'))
            );

        $this->post(route('couple.review.store'), [...$this->validReview(), 'rating' => 1])
            ->assertStatus(422);

        $this->assertSame(5, $review->fresh()->rating);
    }

    public function test_a_couple_cannot_leave_a_review_without_an_invitation(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->booked()->for($couple)->create(['wedding_date' => now()->subDays(40)]);

        $this->actingAs($couple->user)
            ->post(route('couple.review.store'), $this->validReview())
            ->assertStatus(422);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_the_rating_and_the_recommendation_are_required_and_errors_are_in_french(): void
    {
        $couple = $this->invitedCouple();

        $this->actingAs($couple->user)
            ->post(route('couple.review.store'), ['rating' => 6, 'body' => '   '])
            ->assertSessionHasErrors([
                'rating' => 'Choisissez une note de 1 à 5 étoiles.',
                'would_recommend' => 'Dites-nous si vous nous recommanderiez.',
            ]);

        $this->assertNull($couple->latestWedding->review->fresh()->submitted_at);
    }

    public function test_a_blank_text_is_saved_as_no_text(): void
    {
        $couple = $this->invitedCouple();

        $this->actingAs($couple->user)
            ->post(route('couple.review.store'), [...$this->validReview(), 'body' => "  \n "])
            ->assertSessionHasNoErrors();

        $this->assertNull($couple->latestWedding->review->fresh()->body);
    }

    public function test_only_couples_can_open_the_review_page(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.review.show'))
            ->assertForbidden();

        auth()->logout();

        $this->get(route('couple.review.show'))->assertRedirect(route('login'));
    }
}
