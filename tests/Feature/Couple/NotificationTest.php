<?php

namespace Tests\Feature\Couple;

use App\Models\Appointment;
use App\Models\Couple;
use App\Models\DesignBrief;
use App\Models\Document;
use App\Models\MediaItem;
use App\Models\Message;
use App\Models\Proposal;
use App\Models\ProposalComment;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * A couple whose wedding already has a creative brief, so that the
     * invitation to share their ideas does not show.
     */
    private function coupleWithBrief(): Couple
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        DesignBrief::factory()->for(Wedding::factory()->for($couple))->create();

        return $couple;
    }

    public function test_a_couple_with_nothing_new_has_no_notification(): void
    {
        $couple = $this->coupleWithBrief();
        $wedding = $couple->latestWedding;
        Document::factory()->for($wedding)->viewed()->create();
        Message::factory()->for($wedding)->create(['sender_id' => $couple->user_id]);

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_the_notifications_come_from_the_couple_s_data(): void
    {
        $jessica = User::factory()->admin()->create();
        $couple = $this->coupleWithBrief();
        $wedding = $couple->latestWedding;
        Message::factory()->count(2)->for($wedding)->create(['sender_id' => $jessica->id]);
        Document::factory()->for($wedding)->create();
        Document::factory()->for($wedding)->create(['category' => 'design']);
        Document::factory()->for($wedding)->viewed()->requiringApproval()->create();
        Appointment::factory()->for($wedding)->create(['title' => 'Point design M-6', 'starts_at' => now()->addDays(3)]);
        Appointment::factory()->for($wedding)->create(['starts_at' => now()->addMonths(2)]);
        Document::factory()->count(3)->create();

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('coupleNotifications', 4)
                ->where('coupleNotifications.0.key', 'messages')
                ->where('coupleNotifications.0.title', '2 nouveaux messages de Jessica')
                ->where('coupleNotifications.1.key', 'documents')
                ->where('coupleNotifications.1.title', 'Un nouveau document')
                ->where('coupleNotifications.2.key', 'approvals')
                ->where('coupleNotifications.3.key', 'appointment')
                ->where('coupleNotifications.3.text', 'Point design M-6')
                ->where('coupleNotifications.3.route', 'couple.appointments.index')
            );
    }

    public function test_reading_the_messages_removes_their_notification(): void
    {
        $jessica = User::factory()->admin()->create();
        $couple = $this->coupleWithBrief();
        Message::factory()->for($couple->latestWedding)->create(['sender_id' => $jessica->id]);

        $this->actingAs($couple->user)
            ->get(route('couple.messages.index'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_a_new_couple_is_invited_to_share_their_ideas_until_they_do(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('coupleNotifications', 1)
                ->where('coupleNotifications.0.key', 'design_start')
                ->where('coupleNotifications.0.route', 'couple.design.index')
            );

        MediaItem::factory()->moodboard()->for($wedding)->create();

        $this->get(route('couple.home'))->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_a_new_proposal_is_announced_until_the_couple_answers_it(): void
    {
        $couple = $this->coupleWithBrief();
        $proposal = Proposal::factory()->for($couple->latestWedding)->create();

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('coupleNotifications', 1)
                ->where('coupleNotifications.0.key', 'design_proposals')
                ->where('coupleNotifications.0.title', 'Nouvelle proposition de design')
            );

        ProposalComment::factory()->for($proposal)->create(['user_id' => $couple->user_id]);

        $this->get(route('couple.home'))->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_an_approved_or_replaced_proposal_is_not_announced(): void
    {
        $couple = $this->coupleWithBrief();
        $wedding = $couple->latestWedding;
        Proposal::factory()->for($wedding)->approved()->create(['type' => 'signage']);
        $old = Proposal::factory()->for($wedding)->create(['version' => 1]);
        ProposalComment::factory()->for($old)->create(['user_id' => User::factory()->admin()]);
        $latest = Proposal::factory()->for($wedding)->create(['version' => 2]);
        ProposalComment::factory()->for($latest)->create(['user_id' => $couple->user_id]);

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_jessica_s_reply_is_announced_until_the_couple_answers(): void
    {
        $jessica = User::factory()->admin()->create();
        $couple = $this->coupleWithBrief();
        $proposal = Proposal::factory()->for($couple->latestWedding)->create();
        ProposalComment::factory()->for($proposal)->create(['user_id' => $couple->user_id, 'created_at' => now()->subDay()]);
        ProposalComment::factory()->for($proposal)->create(['user_id' => $jessica->id]);

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('coupleNotifications', 1)
                ->where('coupleNotifications.0.key', 'design_replies')
                ->where('coupleNotifications.0.title', 'Jessica a répondu à vos remarques')
            );

        $this->post(route('couple.design.proposals.approve', $proposal));

        $this->get(route('couple.home'))->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_the_administrator_and_guests_get_no_couple_notification(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));

        auth()->logout();

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }
}
