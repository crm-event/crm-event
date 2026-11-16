<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\CalendarEvent;
use App\Models\Couple;
use App\Models\Document;
use App\Models\Message;
use App\Models\Payment;
use App\Models\Proposal;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\TestWith;
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
                ->has('evenementsTous', 0)
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
                ->has('suivi.rappels', 3)
                ->where('suivi.rappels.0.libelle', 'Ancienne échéance'));
    }

    public function test_reminders_include_calendar_milestones_tasks_appointments_and_unpaid_invoices_in_due_order(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2027-07-20']);
        $overdue = CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Validation du plan de table', 'event_date' => '2026-11-08',
        ]);
        $task = DB::table('tasks')->insertGetId([
            'wedding_id' => $wedding->id, 'title' => 'Appeler le traiteur', 'due_date' => '2026-11-09',
        ]);
        $appointment = Appointment::factory()->for($wedding)->create(['starts_at' => '2026-11-09 14:30:00']);
        $payment = Payment::factory()->for(WeddingService::factory()->for($wedding))->create([
            'paid_at' => null, 'due_date' => '2026-11-10', 'invoice_number' => 'FAC-001',
        ]);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('suivi.rappels', 4)
                ->where('suivi.rappels.0.id', 'event-'.$overdue->id)
                ->where('suivi.rappels.0.url', route('calendrier', ['date' => '2026-11-08', 'event' => 'event-'.$overdue->id]))
                ->where('suivi.rappels.1.id', 'tache-'.$task)
                ->where('suivi.rappels.1.url', route('admin.wedding.show', $wedding->id))
                ->where('suivi.rappels.2.id', 'appointment-'.$appointment->id)
                ->where('suivi.rappels.2.heure', '14:30')
                ->where('suivi.rappels.3.id', 'paiement-'.$payment->id)
                ->where('suivi.rappels.3.url', route('facturation.index')));
    }

    public function test_reminders_hide_past_appointments_deleted_events_completed_tasks_and_cancelled_weddings(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2027-07-20']);
        $cancelled = Wedding::factory()->create(['status' => 'cancelled', 'wedding_date' => '2026-11-10']);
        Appointment::factory()->for($wedding)->create(['starts_at' => '2026-11-09 09:00:00']);
        Appointment::factory()->for($wedding)->create(['starts_at' => '2026-11-17 09:00:00']);
        $cancelledAppointment = Appointment::factory()->for($cancelled)->create(['starts_at' => '2026-11-10 09:00:00']);
        $deleted = CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Supprimé', 'event_date' => '2026-11-09',
        ]);
        $deleted->delete();
        CalendarEvent::query()->create([
            'type' => 'rdv', 'title' => 'Rendez-vous terminé', 'event_date' => '2026-11-09', 'event_time' => '10:00:00',
        ]);
        CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Hors période', 'event_date' => '2026-11-17',
        ]);
        DB::table('tasks')->insert([
            ['wedding_id' => $wedding->id, 'title' => 'Faite', 'due_date' => '2026-11-09', 'status' => 'done', 'completed_at' => null, 'deleted_at' => null],
            ['wedding_id' => $wedding->id, 'title' => 'Terminée', 'due_date' => '2026-11-09', 'status' => 'todo', 'completed_at' => now(), 'deleted_at' => null],
            ['wedding_id' => $wedding->id, 'title' => 'Supprimée', 'due_date' => '2026-11-09', 'status' => 'todo', 'completed_at' => null, 'deleted_at' => now()],
        ]);
        Payment::factory()->for(WeddingService::factory()->for($wedding))->create([
            'paid_at' => '2026-11-08', 'due_date' => '2026-11-09',
        ]);
        Payment::factory()->for(WeddingService::factory()->for($cancelled))->create([
            'paid_at' => null, 'due_date' => '2026-11-09',
        ]);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('suivi.rappels', 0)
                ->where('evenementsTous', fn ($events): bool => collect($events)->where('id', 'appointment-'.$cancelledAppointment->id)->isEmpty()));
    }

    public function test_automatic_wedding_milestones_feed_the_next_milestone_and_reminders(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2027-05-09']);
        Wedding::factory()->booked()->create(['wedding_date' => '2026-11-01']);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('suivi.prochainJalon.id', 'wedding-'.$wedding->id.'-m6')
                ->where('suivi.prochainJalon.date', '2026-11-09')
                ->where('suivi.prochainJalon.url', route('calendrier', ['date' => '2026-11-09', 'event' => 'wedding-'.$wedding->id.'-m6']))
                ->has('suivi.rappels', 1)
                ->where('suivi.rappels.0.id', 'wedding-'.$wedding->id.'-m6'));
    }

    public function test_recent_activity_includes_new_dossiers_without_a_first_contact_date_and_excludes_future_records(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        Wedding::factory()->create(['first_contact_at' => '2026-11-08', 'created_at' => '2026-11-08 09:00:00']);
        $wedding = Wedding::factory()->create(['first_contact_at' => null, 'created_at' => '2026-11-09 11:00:00']);
        Wedding::factory()->create(['created_at' => '2026-11-09 15:00:00']);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('activites', 2)
                ->where('activites.0.id', 'contact-'.$wedding->id)
                ->where('activites.0.libelle', 'Nouvelle demande')
                ->where('activites.0.heure', '11:00')
                ->where('activites.0.url', route('admin.wedding.show', $wedding->id)));
    }

    public function test_recent_activity_merges_real_events_in_timestamp_order_and_limits_the_list(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create(['created_at' => '2026-11-08 12:00:00']);
        $proposal = Proposal::factory()->for($wedding)->create([
            'document_id' => null, 'approved_at' => '2026-11-09 09:00:00',
        ]);
        $document = Document::factory()->for($wedding)->create(['created_at' => '2026-11-09 10:00:00']);
        $message = Message::factory()->for($wedding)->create(['sender_id' => $couple->user_id, 'created_at' => '2026-11-09 11:00:00']);
        $event = CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Nouveau jalon', 'event_date' => '2026-12-01',
        ]);
        $event->forceFill(['created_at' => '2026-11-09 11:30:00'])->save();
        $deleted = CalendarEvent::query()->create(['type' => 'jalon', 'title' => 'Supprimé', 'event_date' => '2026-12-01']);
        $deleted->delete();
        Proposal::factory()->for($wedding)->create(['document_id' => null, 'approved_at' => '2026-11-09 15:00:00']);
        Message::factory()->for($wedding)->create(['created_at' => '2026-11-09 15:00:00']);
        Document::factory()->for($wedding)->create(['created_at' => '2026-11-09 15:00:00']);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('activites', 4)
                ->where('activites.0.id', 'calendrier-'.$event->id)
                ->where('activites.0.date', '2026-11-09')
                ->where('activites.0.url', route('calendrier', ['date' => '2026-12-01', 'event' => 'event-'.$event->id]))
                ->where('activites.1.id', 'message-'.$message->id)
                ->where('activites.1.libelle', 'Message reçu')
                ->where('activites.1.url', route('admin.messages.show', $couple->id))
                ->where('activites.2.id', 'document-'.$document->id)
                ->where('activites.2.url', route('admin.documents.index', ['couple_id' => $couple->id]))
                ->where('activites.3.id', 'proposition-'.$proposal->id));
    }

    public function test_partial_dashboard_refresh_reads_changed_payments_tasks_and_deleted_events_from_the_database(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2027-07-20']);
        $payment = Payment::factory()->for(WeddingService::factory()->for($wedding))->create([
            'amount' => '250.50', 'paid_at' => null, 'due_date' => '2026-11-09',
        ]);
        $task = DB::table('tasks')->insertGetId([
            'wedding_id' => $wedding->id, 'title' => 'À terminer', 'due_date' => '2026-11-09',
        ]);
        $event = CalendarEvent::query()->create(['type' => 'jalon', 'title' => 'À supprimer', 'event_date' => '2026-11-09']);
        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->has('suivi.rappels', 3)->where('finances.encaisse', 0));

        $payment->update(['paid_at' => '2026-11-09']);
        DB::table('tasks')->where('id', $task)->update(['status' => 'done', 'completed_at' => now()]);
        $event->delete();

        $this->get(route('dashboard'), [
            'X-Inertia' => 'true', 'X-Inertia-Partial-Component' => 'Dashboard',
            'X-Inertia-Version' => Inertia::getVersion() ?? '',
            'X-Inertia-Partial-Data' => 'finances,suivi,activites,evenementsTous',
        ])->assertOk()
            ->assertJsonCount(0, 'props.suivi.rappels')
            ->assertJsonPath('props.finances.encaisse', 25050)
            ->assertJsonPath('props.finances.reste', 0)
            ->assertJsonCount(0, 'props.evenementsTous')
            ->assertJsonMissingPath('props.planning');
    }

    public function test_activity_links_to_the_dossier_for_couples_without_portal_access(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $admin = User::factory()->admin()->create();
        $couple = Couple::factory()->create(['user_id' => null]);
        $wedding = Wedding::factory()->for($couple)->create(['created_at' => '2026-11-08 12:00:00']);
        $document = Document::factory()->for($wedding)->create(['created_at' => '2026-11-09 10:00:00']);
        $message = Message::factory()->for($wedding)->create(['sender_id' => $admin->id, 'created_at' => '2026-11-09 11:00:00']);

        $this->actingAs($admin)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('activites.0.id', 'message-'.$message->id)
                ->where('activites.0.libelle', 'Message envoyé')
                ->where('activites.0.url', route('admin.wedding.show', $wedding->id))
                ->where('activites.1.id', 'document-'.$document->id)
                ->where('activites.1.url', route('admin.wedding.show', $wedding->id)));
    }

    public function test_year_end_totals_include_december_31_and_exclude_next_year(): void
    {
        $this->travelTo(Carbon::parse('2026-12-31 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2027-07-20']);
        $service = WeddingService::factory()->for($wedding)->create();
        Payment::factory()->for($service)->create(['amount' => '12.34', 'paid_at' => '2026-12-31']);
        Payment::factory()->for($service)->create(['amount' => '5.25', 'due_date' => '2026-12-31', 'paid_at' => null]);
        Payment::factory()->for($service)->create(['amount' => '999.00', 'paid_at' => '2027-01-01']);
        Payment::factory()->for($service)->create(['amount' => '999.00', 'due_date' => '2027-01-01', 'paid_at' => null]);
        Wedding::factory()->create(['wedding_date' => '2026-12-31', 'estimated_budget' => '100.25']);
        Wedding::factory()->create(['wedding_date' => '2027-01-01', 'estimated_budget' => '999.00']);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('finances.encaisse', 1234)
                ->where('finances.reste', 525)
                ->where('finances.mois.11.encaisse', 1234)
                ->where('finances.mois.11.signe', 525)
                ->where('finances.mois.11.previsionnel', 10025));
    }

    public function test_the_dashboard_rejects_an_invalid_month(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('dashboard', ['mois' => '2026-13']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('mois');
    }

    public function test_selected_year_filters_indicators_finances_calendar_and_activity(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $booked = $this->wedding('booked', '2025-12-20');
        $this->wedding('inquiry', '2025-12-22', '3000.50');
        $this->wedding('booked', '2026-12-20');
        $this->wedding('quote_sent', '2026-12-22', '9000.00');
        $service = DB::table('services')->insertGetId(['name' => 'Coordination']);
        $sold = DB::table('wedding_services')->insertGetId(['wedding_id' => $booked, 'service_id' => $service]);
        DB::table('payments')->insert([
            ['wedding_service_id' => $sold, 'type' => 'deposit', 'amount' => '1200.55', 'paid_at' => '2025-12-31', 'due_date' => null],
            ['wedding_service_id' => $sold, 'type' => 'balance', 'amount' => '500.25', 'paid_at' => null, 'due_date' => '2025-12-20'],
            ['wedding_service_id' => $sold, 'type' => 'deposit', 'amount' => '9999.00', 'paid_at' => '2026-01-01', 'due_date' => null],
        ]);
        DB::table('settings')->insert([
            ['key' => 'vat_threshold', 'value' => '30000', 'valid_from' => '2025-01-01'],
            ['key' => 'vat_threshold', 'value' => '37500', 'valid_from' => '2026-01-01'],
        ]);
        CalendarEvent::query()->create(['type' => 'jalon', 'title' => 'Jalon de 2026', 'event_date' => '2026-11-10']);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard', ['annee' => 2025]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('annee', 2025)
            ->where('annees', fn ($years): bool => collect($years)->contains(2025) && collect($years)->contains(2026))
            ->where('suivi.mariages', 1)
            ->where('suivi.demandes', 1)
            ->where('finances.encaisse', 120055)
            ->where('finances.reste', 50025)
            ->where('finances.seuil', 3000000)
            ->where('finances.mois.11.encaisse', 120055)
            ->where('finances.mois.11.previsionnel', 300050)
            ->where('planning.mois', '2025-11')
            ->where('evenementsTous', fn ($events): bool => collect($events)->every(fn ($event): bool => str_starts_with($event['date'], '2025-')))
            ->has('suivi.rappels', 1)
            ->where('suivi.rappels.0.type', 'paiement')
            ->has('activites', 1)
            ->where('activites.0.montant', 120055));
    }

    public function test_a_future_year_shows_forecasts_without_counting_future_receipts(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2027-07-20']);
        $service = WeddingService::factory()->for($wedding)->create();
        Payment::factory()->for($service)->create(['amount' => '1200.55', 'paid_at' => '2027-01-01']);
        Payment::factory()->for($service)->create(['amount' => '500.25', 'paid_at' => null, 'due_date' => '2027-07-20']);
        $this->wedding('inquiry', '2027-12-12', '3000.50');

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard', ['annee' => 2027]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('annee', 2027)
                ->where('suivi.mariages', 1)
                ->where('suivi.demandes', 1)
                ->where('finances.encaisse', 0)
                ->where('finances.reste', 50025)
                ->where('finances.mois.11.previsionnel', 300050)
                ->has('activites', 0));
    }

    public function test_an_empty_selected_year_is_available_and_survives_partial_refresh(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard', ['annee' => 2031, 'mois' => '2031-01']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('annee', 2031)
                ->where('annees', [2031, 2027, 2026])
                ->where('planning.mois', '2031-01')
                ->where('finances.encaisse', 0)
                ->where('suivi.mariages', 0)
                ->has('evenementsTous', 0)
                ->has('activites', 0));

        $this->get(route('dashboard', ['annee' => 2031, 'mois' => '2031-01']), [
            'X-Inertia' => 'true', 'X-Inertia-Partial-Component' => 'Dashboard',
            'X-Inertia-Version' => Inertia::getVersion() ?? '',
            'X-Inertia-Partial-Data' => 'annee,annees,finances,suivi,planning,evenementsTous,activites',
        ])->assertOk()
            ->assertJsonPath('props.annee', 2031)
            ->assertJsonPath('props.planning.mois', '2031-01')
            ->assertJsonPath('props.finances.encaisse', 0);
    }

    public function test_year_choices_include_recorded_payment_and_automatic_milestone_years(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        $wedding = Wedding::factory()->booked()->create(['wedding_date' => '2029-02-20']);
        Payment::factory()->for(WeddingService::factory()->for($wedding))->create([
            'paid_at' => '2024-12-31', 'due_date' => '2025-01-01',
        ]);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('annee', 2026)
                ->where('annees', [2029, 2028, 2027, 2026, 2025, 2024]));
    }

    public function test_undated_inquiries_use_their_first_contact_or_creation_year(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        $this->withoutVite();
        Wedding::factory()->create(['wedding_date' => null, 'first_contact_at' => '2025-12-31']);
        Wedding::factory()->create(['wedding_date' => null, 'first_contact_at' => null, 'created_at' => '2025-11-01 10:00:00']);
        Wedding::factory()->create(['wedding_date' => null, 'first_contact_at' => '2026-01-01']);

        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard', ['annee' => 2025]))
            ->assertInertia(fn (Assert $page) => $page->where('suivi.demandes', 2));
    }

    #[TestWith([1999])]
    #[TestWith([2101])]
    #[TestWith(['invalide'])]
    #[TestWith([[2025]])]
    public function test_the_dashboard_rejects_invalid_years(mixed $year): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('dashboard', ['annee' => $year]))
            ->assertUnprocessable()->assertJsonValidationErrors('annee');
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
