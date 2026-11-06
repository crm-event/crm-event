<?php

namespace Tests\Feature\Couple;

use App\Models\Couple;
use App\Models\Document;
use App\Models\User;
use App\Models\Venue;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_a_couple_sees_its_own_project(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Carla',
            'partner2_first_name' => 'Martin',
        ]);
        Wedding::factory()->booked()->for($couple)->create([
            'wedding_date' => '2027-06-26',
            'venue_id' => Venue::factory()->create(['name' => 'Commanderie de Peyrassol', 'city' => 'Flassans-sur-Issole']),
        ]);

        $this->actingAs($couple->user)
            ->get(route('couple.design.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Couple/Design')
                ->where('project', [
                    'couple' => 'Carla et Martin',
                    'date' => '2027-06-26',
                    'venue' => 'Commanderie de Peyrassol · Flassans-sur-Issole',
                    'status' => 'Contrat signé',
                ])
            );
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

    public function test_opening_the_page_does_not_mark_the_documents_as_viewed(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $document = Document::factory()
            ->for(Wedding::factory()->for($couple))
            ->create(['category' => 'design']);

        $this->actingAs($couple->user)->get(route('couple.design.index'))->assertOk();

        $this->assertNull($document->fresh()->viewed_at);
    }

    public function test_a_couple_without_wedding_sees_an_empty_page(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($couple->user)
            ->get(route('couple.design.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('project', null)->has('versions', 0));
    }

    public function test_the_admin_and_guests_cannot_open_the_page(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.design.index'))
            ->assertForbidden();

        auth()->logout();

        $this->get(route('couple.design.index'))->assertRedirect(route('login'));
    }
}
