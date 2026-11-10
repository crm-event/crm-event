<?php

namespace Tests\Feature\Admin;

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

    private User $jessica;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->jessica = User::factory()->admin()->create();
    }

    public function test_jessica_can_select_a_couple_and_see_its_shared_documents(): void
    {
        Storage::fake();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $document = Document::factory()->for($wedding)->create([
            'title' => 'Contrat de prestation',
            'category' => 'contract',
            'file_path' => 'documents/contract.pdf',
            'viewed_at' => now(),
        ]);
        Storage::put($document->file_path, 'pdf');

        $response = $this->actingAs($this->jessica)
            ->get(route('admin.documents.index', ['couple_id' => $couple->id]));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Documents/Index')
            ->where('selectedCouple.id', $couple->id)
            ->where('selectedCouple.title', $couple->threadTitle())
            ->has('documents', 1)
            ->where('documents.0.title', 'Contrat de prestation')
            ->where('documents.0.status', 'viewed')
        );
    }

    public function test_jessica_can_download_a_shared_document(): void
    {
        Storage::fake();
        $document = Document::factory()->create(['file_path' => 'documents/contract.pdf']);
        Storage::put($document->file_path, 'pdf');

        $this->actingAs($this->jessica)
            ->get(route('admin.documents.download', $document))
            ->assertDownload('contract.pdf');
    }

    public function test_a_couple_without_portal_access_cannot_be_selected(): void
    {
        $couple = Couple::factory()->create();

        $this->actingAs($this->jessica)
            ->get(route('admin.documents.index', ['couple_id' => $couple->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('selectedCouple', null)
                ->has('documents', 0)
            );
    }
}
