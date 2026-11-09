<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_view_the_dashboard(): void
    {
        $this->withoutVite();

        $this->actingAs(User::factory()->admin()->make())
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('finances.encaisse', 0)
                ->where('finances.seuil', null)
                ->has('planning.evenements', 0)
                ->has('suivi.rappels', 0)
                ->has('activites', 0));
    }

    public function test_a_couple_cannot_view_the_dashboard(): void
    {
        $this->withoutVite();

        $this->actingAs(User::factory()->make())
            ->get(route('dashboard'))
            ->assertForbidden();
    }

    public function test_a_guest_is_redirected_to_login(): void
    {
        $this->get(route('dashboard'))
            ->assertRedirect(route('login'));
    }

    public function test_the_dashboard_calculates_receipts_and_forecasts_from_recorded_amounts(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $booked = $this->wedding('booked', '2026-11-23');
        $this->wedding('inquiry', '2026-12-12', '3000.50');
        $this->wedding('cancelled', '2026-12-12', '9999.00');
        $service = DB::table('services')->insertGetId(['name' => 'Coordination']);
        $sold = DB::table('wedding_services')->insertGetId(['wedding_id' => $booked, 'service_id' => $service]);
        DB::table('payments')->insert([
            ['wedding_service_id' => $sold, 'type' => 'deposit', 'amount' => '1200.55', 'paid_at' => '2026-11-03', 'due_date' => null],
            ['wedding_service_id' => $sold, 'type' => 'balance', 'amount' => '500.25', 'paid_at' => null, 'due_date' => '2026-11-12'],
            ['wedding_service_id' => $sold, 'type' => 'deposit', 'amount' => '450.00', 'paid_at' => '2025-11-03', 'due_date' => null],
            ['wedding_service_id' => $sold, 'type' => 'deposit', 'amount' => '100.00', 'paid_at' => '2026-11-20', 'due_date' => null],
        ]);
        DB::table('settings')->insert([
            ['key' => 'vat_threshold', 'value' => '30000', 'valid_from' => '2025-01-01'],
            ['key' => 'vat_threshold', 'value' => '37500', 'valid_from' => '2026-01-01'],
            ['key' => 'vat_threshold', 'value' => '40000', 'valid_from' => '2027-01-01'],
        ]);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('annee', 2026)
                ->where('suivi.mariages', 1)
                ->where('suivi.demandes', 1)
                ->where('finances.encaisse', 120055)
                ->where('finances.reste', 50025)
                ->where('finances.moyenne', 120055)
                ->where('finances.seuil', 3750000)
                ->where('finances.seuilMajore', null)
                ->where('finances.mois.10.encaisse', 120055)
                ->where('finances.mois.10.signe', 50025)
                ->where('finances.mois.11.previsionnel', 300050)
                ->where('activites.0.montant', 120055));
    }

    public function test_the_selected_month_uses_existing_weddings_appointments_tasks_and_calendar_events(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = $this->wedding('booked', '2026-12-12');
        $cancelled = $this->wedding('cancelled', '2026-12-12');
        DB::table('appointments')->insert([
            ['wedding_id' => $wedding, 'type' => 'meeting', 'title' => 'Rendez-vous enregistré', 'starts_at' => '2026-12-12 09:00:00'],
            ['wedding_id' => $cancelled, 'type' => 'meeting', 'title' => 'Rendez-vous annulé', 'starts_at' => '2026-12-12 10:00:00'],
        ]);
        DB::table('tasks')->insert([
            ['wedding_id' => $wedding, 'title' => 'Ancienne échéance', 'due_date' => '2026-11-08', 'status' => 'todo'],
            ['wedding_id' => $wedding, 'title' => 'Tâche déjà faite', 'due_date' => '2026-11-10', 'status' => 'done'],
            ['wedding_id' => $wedding, 'title' => 'Jalon du dossier', 'due_date' => '2026-12-12', 'status' => 'todo'],
        ]);
        if (! Schema::hasTable('calendar_events')) {
            Schema::create('calendar_events', function (Blueprint $table): void {
                $table->id();
                $table->string('type');
                $table->string('title');
                $table->date('event_date');
                $table->string('location')->nullable();
                $table->softDeletes();
            });
        }
        DB::table('calendar_events')->insert([
            ['type' => 'jalon', 'title' => 'Jalon saisi dans le calendrier', 'event_date' => '2026-11-11'],
            ['type' => 'jalon', 'title' => 'Préparation manuelle', 'event_date' => '2026-12-12'],
        ]);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard', ['mois' => '2026-12']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('planning.mois', '2026-12')
                ->where('planning.precedent', '2026-11')
                ->where('planning.suivant', '2027-01')
                ->has('planning.evenements', 4)
                ->where('planning.evenements.3.libelle', 'Préparation manuelle')
                ->where('suivi.prochainJalon.libelle', 'Jalon saisi dans le calendrier')
                ->has('suivi.rappels', 1)
                ->where('suivi.rappels.0.libelle', 'Ancienne échéance'));
    }

    public function test_the_dashboard_rejects_an_invalid_month(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('dashboard', ['mois' => '2026-13']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('mois');
    }

    private function wedding(string $status, string $date, ?string $budget = null): int
    {
        $couple = DB::table('couples')->insertGetId(['partner1_first_name' => 'Camille', 'partner2_first_name' => 'Alex']);

        return DB::table('weddings')->insertGetId([
            'couple_id' => $couple,
            'status' => $status,
            'wedding_date' => $date,
            'estimated_budget' => $budget,
        ]);
    }
}
