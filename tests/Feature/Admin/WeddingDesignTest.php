<?php

namespace Tests\Feature\Admin;

use App\Models\Couple;
use App\Models\DesignBrief;
use App\Models\MediaItem;
use App\Models\Proposal;
use App\Models\ProposalComment;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WeddingDesignTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake();
        $this->admin = User::factory()->admin()->create();
    }

    private function wedding(): Wedding
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        return Wedding::factory()->for($couple)->booked()->create();
    }

    public function test_jessica_sees_what_the_couple_shared_and_that_they_wait_for_a_proposal(): void
    {
        $wedding = $this->wedding();
        DesignBrief::factory()->for($wedding)->create(['title' => 'La Dolce Vita', 'palette' => ['Ivoire', 'Citron']]);
        $moodboard = MediaItem::factory()->moodboard()->for($wedding)->create();
        Storage::put($moodboard->file_path, 'image');
        MediaItem::factory()->for($wedding)->count(2)->create();

        $this->actingAs($this->admin)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/Wedding')
                ->where('design.status', 'waiting_for_proposal')
                ->where('design.brief.title', 'La Dolce Vita')
                ->where('design.brief.palette', ['Ivoire', 'Citron'])
                ->where('design.moodboard.url', route('admin.wedding.design.media.show', $moodboard))
                ->has('design.inspirations', 2)
                ->has('design.proposals', 0)
            );
    }

    public function test_a_couple_who_shared_nothing_is_shown_as_such(): void
    {
        $wedding = $this->wedding();

        $this->actingAs($this->admin)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertInertia(fn (Assert $page) => $page->where('design.status', 'waiting_for_couple'));
    }

    public function test_the_proposals_show_their_status_and_conversation(): void
    {
        $wedding = $this->wedding();
        $first = Proposal::factory()->for($wedding)->create(['version' => 1, 'created_at' => now()->subWeek()]);
        $second = Proposal::factory()->for($wedding)->create(['version' => 2]);
        ProposalComment::factory()->for($second)->create(['user_id' => $this->admin->id, 'body' => 'Voici la nouvelle version.']);
        ProposalComment::factory()->for($second)->create(['user_id' => $wedding->couple->user_id, 'body' => 'Plus de vert, svp.']);

        $this->actingAs($this->admin)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertInertia(fn (Assert $page) => $page
                ->where('design.status', 'changes_requested')
                ->where('design.revisions.used', 1)
                ->where('design.revisions.max', 3)
                ->has('design.proposals', 2)
                ->where('design.proposals.0.id', $second->id)
                ->where('design.proposals.0.status', 'changes_requested')
                ->where('design.proposals.0.is_current', true)
                ->where('design.proposals.0.comments.0.from_couple', false)
                ->where('design.proposals.0.comments.1.from_couple', true)
                ->where('design.proposals.0.comments.1.body', 'Plus de vert, svp.')
                ->where('design.proposals.1.id', $first->id)
                ->where('design.proposals.1.is_current', false)
            );
    }

    public function test_an_approved_design_is_shown_as_validated(): void
    {
        $wedding = $this->wedding();
        Proposal::factory()->for($wedding)->approved()->create();

        $this->actingAs($this->admin)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertInertia(fn (Assert $page) => $page->where('design.status', 'approved'));
    }

    public function test_jessica_opens_the_images_and_files_of_the_design(): void
    {
        $wedding = $this->wedding();
        $photo = MediaItem::factory()->for($wedding)->create();
        Storage::put($photo->file_path, 'image');
        $proposal = Proposal::factory()->for($wedding)->create();
        Storage::put($proposal->document->file_path, 'pdf');

        $this->actingAs($this->admin)->get(route('admin.wedding.design.media.show', $photo))->assertOk();
        $this->actingAs($this->admin)->get(route('admin.wedding.design.proposals.file', $proposal))->assertOk();
    }

    public function test_couples_cannot_use_the_design_tab(): void
    {
        $wedding = $this->wedding();
        $photo = MediaItem::factory()->for($wedding)->create();

        $this->actingAs($wedding->couple->user)
            ->get(route('admin.wedding.design.media.show', $photo))
            ->assertForbidden();
    }
}
