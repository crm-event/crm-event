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
use Illuminate\Http\UploadedFile;
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

    public function test_jessica_sends_a_version_numbered_within_its_type(): void
    {
        $wedding = $this->wedding();
        Proposal::factory()->for($wedding)->create(['type' => Proposal::DESIGN_BOOK, 'version' => 1]);
        Proposal::factory()->for($wedding)->create(['type' => 'signage', 'version' => 1]);

        $this->actingAs($this->admin)
            ->post(route('admin.wedding.design.proposals.store', $wedding->id), [
                'type' => Proposal::DESIGN_BOOK,
                'title' => 'Carnet design, deuxième version',
                'description' => 'Plus de vert, comme demandé.',
                'file' => UploadedFile::fake()->image('carnet.png'),
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.wedding.show', ['id' => $wedding->id, 'onglet' => 'design']));

        $proposal = $wedding->proposals()->latest('id')->first();
        $this->assertSame(2, $proposal->version);
        $this->assertSame('Carnet design, deuxième version', $proposal->title);
        $this->assertSame('design', $proposal->document->category);
        $this->assertFalse($proposal->document->requires_approval);
        Storage::assertExists($proposal->document->file_path);
    }

    public function test_a_version_must_be_an_image_or_a_pdf_of_a_known_type(): void
    {
        $wedding = $this->wedding();

        $this->actingAs($this->admin)
            ->post(route('admin.wedding.design.proposals.store', $wedding->id), [
                'type' => 'video',
                'title' => '',
                'file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
            ])
            ->assertSessionHasErrors(['type', 'title', 'file']);

        $this->assertDatabaseCount('proposals', 0);
    }

    public function test_jessica_answers_under_a_version(): void
    {
        $proposal = Proposal::factory()->for($this->wedding())->create();

        $this->actingAs($this->admin)
            ->post(route('admin.wedding.design.comments.store', $proposal), ['body' => '  Bien noté, je modifie.  '])
            ->assertRedirect(route('admin.wedding.show', ['id' => $proposal->wedding_id, 'onglet' => 'design']));

        $comment = $proposal->comments()->sole();
        $this->assertSame('Bien noté, je modifie.', $comment->body);
        $this->assertSame($this->admin->id, $comment->user_id);
        $this->assertSame(Proposal::AWAITING, $proposal->fresh()->status());
    }

    public function test_couples_cannot_use_the_design_tab(): void
    {
        $wedding = $this->wedding();
        $photo = MediaItem::factory()->for($wedding)->create();
        $proposal = Proposal::factory()->for($wedding)->create();

        $this->actingAs($wedding->couple->user)
            ->get(route('admin.wedding.design.media.show', $photo))
            ->assertForbidden();

        $this->post(route('admin.wedding.design.proposals.store', $wedding->id), ['type' => 'other', 'title' => 'x'])
            ->assertForbidden();

        $this->post(route('admin.wedding.design.comments.store', $proposal), ['body' => 'Coucou'])
            ->assertForbidden();
    }
}
