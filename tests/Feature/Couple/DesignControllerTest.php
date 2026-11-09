<?php

namespace Tests\Feature\Couple;

use App\Models\Couple;
use App\Models\DesignBrief;
use App\Models\Document;
use App\Models\MediaItem;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DesignControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function coupleWithWedding(): Couple
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create();

        return $couple;
    }

    public function test_a_couple_sees_its_own_brief_and_images(): void
    {
        Storage::fake();
        $couple = $this->coupleWithWedding();
        $wedding = $couple->latestWedding;
        DesignBrief::factory()->for($wedding)->create(['title' => 'La Dolce Vita', 'palette' => ['Ivoire', 'Citron']]);
        $oldMoodboard = MediaItem::factory()->moodboard()->for($wedding)->create(['created_at' => now()->subDay()]);
        $moodboard = MediaItem::factory()->moodboard()->for($wedding)->create();
        $photo = MediaItem::factory()->for($wedding)->create();
        Storage::put($photo->file_path, 'image');
        MediaItem::factory()->create();
        DesignBrief::factory()->create(['title' => 'Autre couple']);

        $this->actingAs($couple->user)
            ->get(route('couple.design.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Couple/Design')
                ->where('canEdit', true)
                ->where('brief.title', 'La Dolce Vita')
                ->where('brief.palette', ['Ivoire', 'Citron'])
                ->where('moodboard.id', $moodboard->id)
                ->where('moodboard.url', null)
                ->has('inspirations', 1)
                ->where('inspirations.0.id', $photo->id)
                ->where('inspirations.0.url', route('couple.design.media.show', $photo))
            );

        $this->assertNotSame($oldMoodboard->id, $moodboard->id);
    }

    public function test_a_couple_saves_its_brief(): void
    {
        $couple = $this->coupleWithWedding();

        $this->actingAs($couple->user)
            ->put(route('couple.design.brief.update'), [
                'title' => 'Un jardin au coucher du soleil',
                'description' => 'Des fleurs blanches.',
                'palette_input' => ' Ivoire, , vert sauge ,lin',
                'avoid' => 'Les couleurs vives.',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('couple.design.index'));

        $brief = $couple->latestWedding->designBrief;
        $this->assertSame('Un jardin au coucher du soleil', $brief->title);
        $this->assertSame(['Ivoire', 'vert sauge', 'lin'], $brief->palette);

        $this->put(route('couple.design.brief.update'), ['title' => 'Nouvelle idée', 'palette_input' => '']);

        $this->assertSame(1, DesignBrief::query()->count());
        $this->assertSame('Nouvelle idée', $brief->fresh()->title);
        $this->assertSame([], $brief->fresh()->palette);
    }

    public function test_a_couple_adds_and_removes_an_inspiration_photo(): void
    {
        Storage::fake();
        $couple = $this->coupleWithWedding();

        $this->actingAs($couple->user)
            ->post(route('couple.design.media.store'), [
                'collection' => 'images',
                'file' => UploadedFile::fake()->image('plage.jpg'),
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('couple.design.index'));

        $photo = MediaItem::query()->sole();
        $this->assertSame('plage.jpg', $photo->title);
        $this->assertSame($couple->user_id, $photo->uploaded_by);
        Storage::assertExists($photo->file_path);

        $this->get(route('couple.design.media.show', $photo))->assertOk();

        $this->delete(route('couple.design.media.destroy', $photo))->assertRedirect(route('couple.design.index'));

        $this->assertModelMissing($photo);
        Storage::assertMissing($photo->file_path);
    }

    public function test_a_new_moodboard_replaces_the_previous_one(): void
    {
        Storage::fake();
        $couple = $this->coupleWithWedding();
        $previous = MediaItem::factory()->moodboard()->for($couple->latestWedding)->create();
        Storage::put($previous->file_path, 'image');

        $this->actingAs($couple->user)
            ->post(route('couple.design.media.store'), [
                'collection' => 'moodboards',
                'file' => UploadedFile::fake()->image('moodboard.png'),
            ])
            ->assertSessionHasNoErrors();

        $this->assertModelMissing($previous);
        Storage::assertMissing($previous->file_path);
        $this->assertSame(1, MediaItem::query()->where('collection', 'moodboards')->count());
    }

    public function test_only_images_are_accepted(): void
    {
        Storage::fake();
        $couple = $this->coupleWithWedding();

        $this->actingAs($couple->user)
            ->post(route('couple.design.media.store'), [
                'collection' => 'images',
                'file' => UploadedFile::fake()->create('contrat.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors(['file' => 'L’image doit être au format JPG, PNG ou WebP.']);

        $this->assertDatabaseCount('media_items', 0);
    }

    public function test_the_gallery_is_limited(): void
    {
        Storage::fake();
        $couple = $this->coupleWithWedding();
        MediaItem::factory()->count(30)->for($couple->latestWedding)->create();

        $this->actingAs($couple->user)
            ->post(route('couple.design.media.store'), [
                'collection' => 'images',
                'file' => UploadedFile::fake()->image('une-de-trop.jpg'),
            ])
            ->assertSessionHasErrors('file');

        $this->assertDatabaseCount('media_items', 30);
    }

    public function test_a_couple_cannot_see_or_remove_the_images_of_another_couple(): void
    {
        Storage::fake();
        $couple = $this->coupleWithWedding();
        $otherPhoto = MediaItem::factory()->create();
        Storage::put($otherPhoto->file_path, 'image');

        $this->actingAs($couple->user);
        $this->get(route('couple.design.media.show', $otherPhoto))->assertForbidden();
        $this->delete(route('couple.design.media.destroy', $otherPhoto))->assertForbidden();

        $this->assertModelExists($otherPhoto);
    }

    public function test_versions_are_the_design_documents_of_the_couple_latest_first(): void
    {
        Storage::fake();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $first = Document::factory()->for($wedding)->create(['category' => 'design', 'title' => 'Version 1', 'created_at' => now()->subWeek()]);
        $second = Document::factory()->for($wedding)->create(['category' => 'design', 'title' => 'Version 2', 'requires_approval' => true]);
        Storage::put($second->file_path, 'pdf');
        Document::factory()->for($wedding)->create(['category' => 'contract']);
        Document::factory()->create(['category' => 'design', 'title' => 'Autre couple']);

        $this->actingAs($couple->user)
            ->get(route('couple.design.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('versions', 2)
                ->where('versions.0.id', $second->id)
                ->where('versions.0.number', 2)
                ->where('versions.0.awaiting_approval', true)
                ->where('versions.0.download_url', route('couple.documents.download', $second))
                ->where('versions.1.id', $first->id)
                ->where('versions.1.number', 1)
                ->where('versions.1.awaiting_approval', false)
                ->where('versions.1.download_url', null)
            );
    }

    public function test_a_version_approved_from_the_design_page_stays_on_it(): void
    {
        $couple = $this->coupleWithWedding();
        $document = Document::factory()->for($couple->latestWedding)->requiringApproval()->create(['category' => 'design']);

        $this->actingAs($couple->user)
            ->from(route('couple.design.index'))
            ->post(route('couple.documents.approve', $document))
            ->assertRedirect(route('couple.design.index'));

        $this->assertNotNull($document->fresh()->approved_at);
    }

    public function test_opening_the_page_does_not_mark_the_documents_as_viewed(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $document = Document::factory()
            ->for(Wedding::factory()->for($couple))
            ->create(['category' => 'design']);

        $this->actingAs($couple->user)->get(route('couple.design.index'))->assertOk();

        $this->assertNull($document->fresh()->viewed_at);
    }

    public function test_a_couple_without_wedding_sees_an_empty_page_and_cannot_save(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($couple->user)
            ->get(route('couple.design.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('canEdit', false)
                ->where('brief', null)
                ->has('versions', 0)
            );

        $this->put(route('couple.design.brief.update'), ['title' => 'Idée'])->assertStatus(422);
        $this->assertDatabaseCount('design_briefs', 0);
    }

    public function test_the_admin_and_guests_cannot_open_the_page(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.design.index'))
            ->assertForbidden();

        auth()->logout();

        $this->get(route('couple.design.index'))->assertRedirect(route('login'));
        $this->put(route('couple.design.brief.update'), ['title' => 'Idée'])->assertRedirect(route('login'));
    }
}
