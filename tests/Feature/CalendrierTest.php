<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Models\Wedding;
use App\Support\CalendarSchedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CalendrierTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_calendar_changes_persist_and_appear_on_the_dashboard(): void
    {
        $this->withoutVite();
        $this->actingAs(User::factory()->admin()->create());
        $wedding = Wedding::factory()->create(['status' => 'booked', 'wedding_date' => '2027-05-15']);
        $payload = ['type' => 'jalon', 'title' => 'Préparation', 'event_date' => '2027-05-12'];

        $this->post(route('calendrier.events.store'), $payload)->assertRedirect(route('calendrier'));
        $event = CalendarEvent::query()->sole();
        $this->patch(route('calendrier.events.update', $event), [...$payload, 'title' => 'Validation finale'])
            ->assertRedirect(route('calendrier'));

        $this->get(route('calendrier'))->assertInertia(fn (Assert $page) => $page
            ->component('Calendrier')
            ->has('evenementsTous', 5)
            ->where('evenementsTous.3.titre', 'Validation finale')
            ->where('evenementsTous.4.id', 'wedding-'.$wedding->id)
        );
        $this->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
            ->where('evenementsTous.3.titre', 'Validation finale')
        );

        $this->delete(route('calendrier.events.destroy', $event))->assertRedirect(route('calendrier'));
        $this->assertSoftDeleted($event);
    }

    public function test_calendar_import_is_idempotent_and_does_not_restore_deleted_events(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $payload = ['events' => [[
            'legacy_id' => 'jalon-123456',
            'type' => 'jalon',
            'title' => 'Repérage',
            'event_date' => '2027-06-12',
        ]]];

        $this->post(route('calendrier.import'), $payload)->assertRedirect(route('calendrier'));
        $this->post(route('calendrier.import'), $payload)->assertRedirect(route('calendrier'));
        $event = CalendarEvent::query()->sole();
        $event->delete();
        $this->post(route('calendrier.import'), $payload)->assertRedirect(route('calendrier'));

        $this->assertDatabaseCount('calendar_events', 1);
        $this->assertSoftDeleted($event);
    }

    public function test_guests_and_couples_cannot_use_admin_calendar_routes(): void
    {
        $this->get(route('calendrier'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create());
        $this->getJson(route('calendrier'))->assertForbidden();
        $this->postJson(route('calendrier.events.store'), [])->assertForbidden();
        $this->postJson(route('calendrier.import'), [])->assertForbidden();
    }

    public function test_the_dashboard_does_not_expose_calendar_events_to_a_couple(): void
    {
        $this->withoutVite();
        CalendarEvent::query()->create([
            'type' => 'jalon',
            'title' => 'Événement privé',
            'event_date' => '2027-05-12',
        ]);

        $this->actingAs(User::factory()->create())->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->has('evenementsTous', 0));
    }

    public function test_calendar_data_and_import_markers_are_loaded_in_one_database_query(): void
    {
        $wedding = Wedding::factory()->create(['status' => 'booked', 'wedding_date' => '2027-05-15']);
        $event = CalendarEvent::query()->create([
            'type' => 'jalon',
            'title' => 'Repérage',
            'event_date' => '2027-05-12',
            'event_time' => '14:30',
        ]);
        $removed = CalendarEvent::query()->create([
            'legacy_id' => 'jalon-imported',
            'type' => 'jalon',
            'title' => 'Ancien repérage',
            'event_date' => '2027-05-11',
        ]);
        $removed->delete();
        $appointmentId = DB::table('appointments')->insertGetId([
            'wedding_id' => $wedding->id,
            'type' => 'discovery',
            'title' => 'Premier rendez-vous',
            'starts_at' => '2027-05-10 11:00:00',
        ]);

        DB::flushQueryLog();
        DB::enableQueryLog();
        try {
            $calendar = new CalendarSchedule;
            $events = $calendar->events();
            $importedIds = $calendar->importedIds();
            $queryCount = count(DB::getQueryLog());
        } finally {
            DB::disableQueryLog();
            DB::flushQueryLog();
        }

        $this->assertSame(1, $queryCount);
        $this->assertCount(6, $events);
        $this->assertSame('14:30', $events->firstWhere('id', 'event-'.$event->id)['heure']);
        $this->assertSame('11:00', $events->firstWhere('id', 'appointment-'.$appointmentId)['heure']);
        $this->assertNull($events->firstWhere('id', 'event-'.$removed->id));
        $this->assertSame(['jalon-imported'], $importedIds->all());
    }

    public function test_invalid_events_are_not_written(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $this->postJson(route('calendrier.events.store'), [
            'type' => 'jalon',
            'title' => 'Repérage',
            'event_date' => '2027-02-31',
        ])->assertUnprocessable()->assertJsonValidationErrors('event_date');

        $this->assertDatabaseEmpty('calendar_events');
    }
}
