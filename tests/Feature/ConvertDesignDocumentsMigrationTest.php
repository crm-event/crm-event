<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Proposal;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConvertDesignDocumentsMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function runMigration(): void
    {
        $migration = require database_path('migrations/2026_11_12_163140_convert_design_documents_to_proposals.php');

        $migration->up();
    }

    public function test_design_documents_become_numbered_design_book_proposals(): void
    {
        $wedding = Wedding::factory()->create();
        $first = Document::factory()->for($wedding)->approved()->create([
            'category' => 'design',
            'title' => 'Première version',
            'message' => 'Votre concept.',
            'created_at' => now()->subWeek(),
        ]);
        $second = Document::factory()->for($wedding)->requiringApproval()->create(['category' => 'design', 'title' => 'Deuxième version']);
        $contract = Document::factory()->for($wedding)->create(['category' => 'contract']);

        $this->runMigration();

        $proposals = Proposal::query()->orderBy('version')->get();
        $this->assertCount(2, $proposals);

        $this->assertSame($first->id, $proposals[0]->document_id);
        $this->assertSame(Proposal::DESIGN_BOOK, $proposals[0]->type);
        $this->assertSame(1, $proposals[0]->version);
        $this->assertSame('Votre concept.', $proposals[0]->description);
        $this->assertNotNull($proposals[0]->approved_at);

        $this->assertSame($second->id, $proposals[1]->document_id);
        $this->assertSame(2, $proposals[1]->version);
        $this->assertNull($proposals[1]->approved_at);

        $this->assertFalse($second->fresh()->requires_approval);
        $this->assertDatabaseMissing('proposals', ['document_id' => $contract->id]);
    }

    public function test_running_it_again_does_not_duplicate_the_proposals(): void
    {
        $wedding = Wedding::factory()->create();
        Proposal::factory()->for($wedding)->create(['version' => 1]);
        Document::factory()->for($wedding)->create(['category' => 'design']);

        $this->runMigration();
        $this->runMigration();

        $this->assertSame([1, 2], Proposal::query()->orderBy('version')->pluck('version')->all());
    }
}
