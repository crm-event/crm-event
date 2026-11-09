<?php

namespace Tests\Feature;

use App\Models\Couple;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\TestWith;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DemandesTest extends TestCase
{
    use RefreshDatabase;
    public function test_the_admin_can_view_the_demandes_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('demandes'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Demandes'));
    }

    public function test_a_couple_cannot_view_the_demandes_page(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('demandes'))
            ->assertForbidden();
    }

    public function test_a_guest_is_redirected_to_login(): void
    {
        $this->get(route('demandes'))
            ->assertRedirect(route('login'));
    }

    public function test_an_empty_database_contains_no_example_requests_or_fake_statistics(): void
    {
        $this->actingAs(User::factory()->admin()->create())->get(route('demandes'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('demandes', 0)
                ->where('statistiques.actives', 0)
                ->where('statistiques.volume_centimes', 0)
                ->where('statistiques.taux_signature', 0));
    }

    public function test_requests_services_quotes_and_statistics_are_read_from_the_database(): void
    {
        $id = $this->wedding(['estimated_budget' => '1234.56']);
        $serviceId = DB::table('services')->insertGetId(['name' => 'Décoration']);
        DB::table('wedding_services')->insert([
            'wedding_id' => $id,
            'service_id' => $serviceId,
            'quote_number' => 'DEVIS-TEST-1',
            'amount' => '1500.00',
        ]);
        $this->wedding(['status' => 'booked', 'estimated_budget' => '2000.00']);
        $this->wedding(['status' => 'cancelled', 'estimated_budget' => '9000.00']);

        $this->actingAs(User::factory()->admin()->create())->get(route('demandes'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('demandes', 3)
                ->where('demandes.2.nom', 'Camille & Alex')
                ->where('demandes.2.prestations.0', (string) $serviceId)
                ->where('demandes.2.devis.0.numero', 'DEVIS-TEST-1')
                ->where('statistiques.actives', 1)
                ->where('statistiques.volume_centimes', 123456)
                ->where('statistiques.taux_signature', 33));
    }

    public function test_creating_a_request_saves_the_couple_wedding_venue_and_selected_services(): void
    {
        $this->freezeTime();
        $serviceId = DB::table('services')->insertGetId(['name' => 'Coordination']);
        $data = [
            'partner1_first_name' => 'Lou',
            'partner2_first_name' => 'Sam',
            'email' => 'lou@example.test',
            'telephone' => '0600000000',
            'date' => '2027-06-19',
            'lieu' => 'Domaine de test',
            'budget' => '5000.25',
            'origine' => 'Site internet',
            'prestations' => [$serviceId],
            'notes' => 'Premier échange à organiser.',
        ];

        $response = $this->actingAs(User::factory()->admin()->create())
            ->post(route('demandes.store'), $data);

        $response->assertSessionHasNoErrors()->assertRedirect(route('demandes'));
        $id = (int) session('created_demande_id');
        $this->assertDatabaseHas('couples', ['partner1_first_name' => 'Lou', 'email' => 'lou@example.test', 'phone' => '0600000000']);
        $this->assertDatabaseHas('venues', ['name' => 'Domaine de test']);
        $this->assertDatabaseHas('weddings', [
            'id' => $id,
            'status' => 'inquiry',
            'inquiry_stage' => 'nouveau',
            'wedding_date' => '2027-06-19',
            'estimated_budget' => '5000.25',
            'lead_source' => 'Site internet',
            'notes' => 'Premier échange à organiser.',
        ]);
        $this->assertDatabaseHas('wedding_services', ['wedding_id' => $id, 'service_id' => $serviceId]);
        $this->get(route('demandes'))->assertInertia(fn (Assert $page) => $page
            ->has('demandes', 1)->where('demandes.0.nom', 'Lou & Sam'));
    }

    public function test_invalid_budget_and_inactive_services_do_not_create_partial_records(): void
    {
        $serviceId = DB::table('services')->insertGetId(['name' => 'Prestation inactive', 'is_active' => false]);

        $this->actingAs(User::factory()->admin()->create())->post(route('demandes.store'), [
            'partner1_first_name' => 'Lou',
            'budget' => '-5.001',
            'prestations' => [$serviceId],
        ])->assertSessionHasErrors(['budget', 'prestations.0']);

        $this->assertDatabaseCount('couples', 0);
        $this->assertDatabaseCount('weddings', 0);
        $this->assertDatabaseCount('wedding_services', 0);
    }

    #[TestWith(['nouveau', 'inquiry', null])]
    #[TestWith(['qualifie', 'inquiry', null])]
    #[TestWith(['devis', 'quote_sent', null])]
    #[TestWith(['relance', 'quote_sent', null])]
    #[TestWith(['signe', 'booked', null])]
    #[TestWith(['perdu', 'cancelled', 'Date indisponible'])]
    public function test_pipeline_stages_are_persisted_with_the_matching_wedding_status(string $stage, string $status, ?string $reason): void
    {
        $id = $this->wedding();

        $this->actingAs(User::factory()->admin()->create())->patch(route('demandes.update', $id), [
            'statut' => $stage,
            'motifPerte' => $reason,
        ])->assertSessionHasNoErrors()->assertRedirect(route('demandes'));

        $this->assertDatabaseHas('weddings', ['id' => $id, 'inquiry_stage' => $stage, 'status' => $status, 'cancellation_reason' => $reason]);
        $this->get(route('demandes'))->assertInertia(fn (Assert $page) => $page->where('demandes.0.statut', $stage));
    }

    public function test_marking_a_request_lost_requires_a_reason(): void
    {
        $id = $this->wedding();

        $this->actingAs(User::factory()->admin()->create())->patch(route('demandes.update', $id), ['statut' => 'perdu'])
            ->assertSessionHasErrors('motifPerte');

        $this->assertDatabaseHas('weddings', ['id' => $id, 'status' => 'inquiry', 'cancellation_reason' => null]);
    }

    public function test_finished_weddings_are_not_downgraded_when_the_signed_stage_is_saved(): void
    {
        $id = $this->wedding(['status' => 'closed']);

        $this->actingAs(User::factory()->admin()->create())->patch(route('demandes.update', $id), ['statut' => 'signe'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('weddings', ['id' => $id, 'status' => 'closed', 'inquiry_stage' => 'signe']);
    }

    public function test_adding_a_note_preserves_previous_notes_and_survives_a_reload(): void
    {
        $this->travelTo(Carbon::parse('2026-11-08 12:00:00'));
        $id = $this->wedding(['notes' => 'Note initiale.']);

        $this->actingAs(User::factory()->admin()->create())->patch(route('demandes.notes.store', $id), ['note' => 'Nouvel échange.'])
            ->assertSessionHasNoErrors()->assertRedirect(route('demandes'));

        $this->assertDatabaseHas('weddings', ['id' => $id, 'notes' => "Note initiale.\n\n2026-11-08 12:00 · Nouvel échange."]);
        $this->get(route('demandes'))->assertInertia(fn (Assert $page) => $page
            ->where('demandes.0.notes.0', "Note initiale.\n\n2026-11-08 12:00 · Nouvel échange."));
    }

    public function test_local_import_is_idempotent_and_keeps_services_and_notes(): void
    {
        $serviceId = DB::table('services')->insertGetId(['name' => 'Décoration']);
        $legacy = $this->legacyRequest();
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('demandes.import'), ['demandes' => [$legacy]])->assertSessionHasNoErrors()->assertRedirect(route('demandes'));
        $this->post(route('demandes.import'), ['demandes' => [$legacy]])->assertSessionHasNoErrors();

        $this->assertDatabaseCount('couples', 1);
        $this->assertDatabaseCount('weddings', 1);
        $this->assertDatabaseCount('wedding_services', 1);
        $this->assertDatabaseHas('weddings', ['legacy_inquiry_id' => 'demande-test-1', 'inquiry_stage' => 'qualifie', 'notes' => 'Une note locale.', 'first_contact_at' => null]);
        $this->assertDatabaseHas('wedding_services', ['service_id' => $serviceId]);
        $this->get(route('demandes'))->assertInertia(fn (Assert $page) => $page
            ->where('importedIds.0', 'demande-test-1')->where('demandes.0.nom', 'Lou & Sam'));
    }

    public function test_a_failed_import_rolls_back_all_requests_in_the_batch(): void
    {
        DB::table('services')->insert(['name' => 'Décoration']);
        $first = $this->legacyRequest();
        $second = [...$first, 'id' => 'demande-test-2', 'prestations' => ['inconnue']];

        $this->actingAs(User::factory()->admin()->create())->post(route('demandes.import'), ['demandes' => [$first, $second]])
            ->assertSessionHasErrors('demandes.1.prestations');

        $this->assertDatabaseCount('couples', 0);
        $this->assertDatabaseCount('weddings', 0);
        $this->assertDatabaseCount('venues', 0);
    }

    public function test_mock_requests_cannot_be_imported(): void
    {
        $legacy = [...$this->legacyRequest(), 'id' => 'camille-thomas'];

        $this->actingAs(User::factory()->admin()->create())->post(route('demandes.import'), ['demandes' => [$legacy]])
            ->assertSessionHasErrors('demandes.0.id');

        $this->assertDatabaseCount('weddings', 0);
    }

    #[TestWith(['post', '/demandes', []])]
    #[TestWith(['post', '/demandes/import', []])]
    #[TestWith(['patch', '/demandes/1', ['statut' => 'signe']])]
    #[TestWith(['patch', '/demandes/1/notes', ['note' => 'Test']])]
    public function test_couples_cannot_write_commercial_requests(string $method, string $url, array $data): void
    {
        $this->actingAs(User::factory()->create())->{$method}($url, $data)->assertForbidden();

        $this->assertDatabaseCount('weddings', 0);
    }

    #[TestWith(['/demandes/999999', ['statut' => 'signe']])]
    #[TestWith(['/demandes/999999/notes', ['note' => 'Test']])]
    public function test_unknown_requests_return_not_found(string $url, array $data): void
    {
        $this->actingAs(User::factory()->admin()->create())->patch($url, $data)->assertNotFound();
    }

    /**
     * @param array<string, mixed> $attributes
     */
    private function wedding(array $attributes = []): int
    {
        $couple = Couple::factory()->create([
            'partner1_first_name' => 'Camille',
            'partner1_last_name' => null,
            'partner2_first_name' => 'Alex',
            'partner2_last_name' => null,
        ]);

        return DB::table('weddings')->insertGetId([
            'couple_id' => $couple->id,
            ...$attributes,
        ]);
    }

    /**
     * @return array{id: string, nom: string, date: string, lieu: string, budget: string, prestations: list<string>, statut: string, notes: list<string>}
     */
    private function legacyRequest(): array
    {
        return [
            'id' => 'demande-test-1',
            'nom' => 'Lou & Sam',
            'date' => '2027-07-10',
            'lieu' => 'Domaine de test',
            'budget' => '4500.50',
            'prestations' => ['decoration'],
            'statut' => 'qualifie',
            'notes' => ['Une note locale.'],
        ];
    }
}
