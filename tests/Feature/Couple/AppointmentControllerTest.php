<?php

namespace Tests\Feature\Couple;

use App\Models\Appointment;
use App\Models\Couple;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppointmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_couple_sees_appointments(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        Appointment::factory()->for($wedding)->create(['title' => 'Point design M-3']);
        Appointment::factory()->for($wedding)->past()->create();

        $response = $this->actingAs($couple->user)->get(route('couple.appointments.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Appointments/Index')
            ->has('upcoming', 1)
            ->where('upcoming.0.title', 'Point design M-3')
            ->has('past', 1)
        );
    }

    public function test_appointments_are_sorted(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        $later = Appointment::factory()->for($wedding)->create(['starts_at' => now()->addMonths(3)]);
        $soon = Appointment::factory()->for($wedding)->create(['starts_at' => now()->addWeek()]);
        $older = Appointment::factory()->for($wedding)->create(['starts_at' => now()->subMonths(3)]);
        $recent = Appointment::factory()->for($wedding)->create(['starts_at' => now()->subWeek()]);

        $response = $this->actingAs($couple->user)->get(route('couple.appointments.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('upcoming.0.id', $soon->id)
            ->where('upcoming.1.id', $later->id)
            ->where('past.0.id', $recent->id)
            ->where('past.1.id', $older->id)
        );
    }

    public function test_appointment_details_are_sent(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        Appointment::factory()->for($wedding)->create([
            'starts_at' => '2099-05-10 14:00:00',
            'location' => 'Domaine des Tilleuls',
            'notes' => 'Prévoir 2 h sur place.',
        ]);

        $response = $this->actingAs($couple->user)->get(route('couple.appointments.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('upcoming.0.starts_at', '2099-05-10T14:00:00')
            ->where('upcoming.0.location', 'Domaine des Tilleuls')
            ->where('upcoming.0.notes', 'Prévoir 2 h sur place.')
        );
    }

    public function test_account_without_couple_record_sees_empty_lists(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('couple.appointments.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Appointments/Index')
            ->has('upcoming', 0)
            ->has('past', 0)
        );
    }

    public function test_other_couple_appointments_hidden(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create();

        Appointment::factory()->create();

        $response = $this->actingAs($couple->user)->get(route('couple.appointments.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('upcoming', 0)
            ->has('past', 0)
        );
    }

    public function test_guest_is_redirected(): void
    {
        $this->get(route('couple.appointments.index'))
            ->assertRedirect(route('login'));
    }
}
