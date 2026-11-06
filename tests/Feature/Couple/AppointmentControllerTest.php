<?php

namespace Tests\Feature\Couple;

use App\Models\Appointment;
use App\Models\Couple;
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
