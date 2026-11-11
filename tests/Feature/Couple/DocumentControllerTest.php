<?php

namespace Tests\Feature\Couple;

use App\Models\Couple;
use App\Models\Document;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DocumentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_couple_sees_its_documents_grouped_and_documents_become_viewed(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $contract = Document::factory()->for($wedding)->create([
            'category' => 'contract',
            'title' => 'Contrat de prestation',
        ]);
        Document::factory()->for(Wedding::factory())->create(['category' => 'contract']);

        $response = $this->actingAs($couple->user)->get(route('couple.documents.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Documents')
            ->has('categories', 1)
            ->where('categories.0.label', 'Contrat')
            ->where('categories.0.documents.0.title', 'Contrat de prestation')
            ->where('categories.0.documents.0.status', 'viewed')
        );
        $this->assertNotNull($contract->fresh()->viewed_at);
    }

    public function test_a_couple_can_download_its_document(): void
    {
        Storage::fake();
        $couple = Couple::factory()->withPortalAccess()->create();
        $document = Document::factory()->for(Wedding::factory()->for($couple))->create([
            'file_path' => 'documents/contract.pdf',
            'mime_type' => 'application/pdf',
        ]);
        Storage::put($document->file_path, 'pdf');

        $this->actingAs($couple->user)
            ->get(route('couple.documents.download', $document))
            ->assertDownload('contract.pdf');
    }

    public function test_a_couple_can_approve_a_document_and_cannot_access_another_couples_document(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $document = Document::factory()
            ->for(Wedding::factory()->for($couple))
            ->requiringApproval()
            ->create();

        $this->actingAs($couple->user)
            ->post(route('couple.documents.approve', $document))
            ->assertRedirect(route('couple.documents.index'));

        $this->assertNotNull($document->fresh()->approved_at);

        $otherCouple = Couple::factory()->withPortalAccess()->create();
        $otherDocument = Document::factory()->for(Wedding::factory()->for($otherCouple))->create();

        $this->actingAs($couple->user)
            ->get(route('couple.documents.download', $otherDocument))
            ->assertForbidden();
    }

    public function test_guests_and_admins_cannot_open_documents(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.documents.index'))
            ->assertForbidden();

        auth()->logout();

        $this->get(route('couple.documents.index'))->assertRedirect(route('login'));
    }
}
