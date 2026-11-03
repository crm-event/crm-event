<?php

namespace Tests\Feature\Couple;

use App\Models\Appointment;
use App\Models\Couple;
use App\Models\Document;
use App\Models\Message;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class HomeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_couple_sees_the_couple_space(): void
    {
        $couple = User::factory()->make();

        $response = $this->actingAs($couple)->get(route('couple.home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Home')
            ->where('auth.homeUrl', route('couple.home'))
        );
    }

    public function test_the_home_page_receives_the_first_names_of_the_couple(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Marie',
            'partner2_first_name' => 'Paul',
        ]);

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Home')
            ->where('couple', [
                'partner1_first_name' => 'Marie',
                'partner2_first_name' => 'Paul',
            ])
        );
    }

    public function test_the_home_page_works_before_the_couple_record_is_linked(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('couple.home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Home')
            ->where('couple', null)
            ->where('nextAppointment', null)
            ->where('unreadMessages', 0)
            ->where('documents', ['total' => 0, 'unseen' => 0, 'to_sign' => 0])
        );
    }

    public function test_the_home_page_shows_the_first_appointment_to_come_among_all_the_weddings(): void
    {
        $this->travelTo('2026-11-03 10:00:00');
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $secondWedding = Wedding::factory()->for($couple)->create();

        $this->createAppointment($wedding, ['title' => 'Rendez-vous passé', 'starts_at' => '2026-11-02 10:00:00']);
        $this->createAppointment($wedding, ['title' => 'Point design M-3', 'starts_at' => '2026-12-20 14:00:00']);
        $this->createAppointment($secondWedding, [
            'title' => 'Visite technique',
            'starts_at' => '2026-11-06 15:30:00',
            'mode' => 'in_person',
            'location' => 'Domaine des Tilleuls',
        ]);
        $this->createAppointment(Wedding::factory()->create(), ['title' => 'Autre couple', 'starts_at' => '2026-11-04 09:00:00']);

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('nextAppointment', [
                'title' => 'Visite technique',
                'starts_at' => '2026-11-06T15:30:00+00:00',
                'mode' => 'in_person',
                'location' => 'Domaine des Tilleuls',
                'starts_in' => ['unit' => 'days', 'value' => 3],
            ])
        );
    }

    public function test_the_home_page_shows_no_appointment_when_none_is_to_come(): void
    {
        $this->travelTo('2026-11-03 10:00:00');
        $couple = Couple::factory()->withPortalAccess()->create();
        $this->createAppointment(Wedding::factory()->for($couple)->create(), ['starts_at' => '2026-11-03 09:59:00']);

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page->where('nextAppointment', null));
    }

    /**
     * @return array<string, array{string, string, int}>
     */
    public static function timeBeforeTheAppointmentProvider(): array
    {
        return [
            'several days, rounded down' => ['2026-11-05 21:00:00', 'days', 2],
            'exactly one day' => ['2026-11-04 10:00:00', 'days', 1],
            'less than a day' => ['2026-11-04 09:59:00', 'hours', 23],
            'exactly one hour' => ['2026-11-03 11:00:00', 'hours', 1],
            'less than an hour' => ['2026-11-03 10:59:00', 'less_than_an_hour', 0],
        ];
    }

    #[DataProvider('timeBeforeTheAppointmentProvider')]
    public function test_the_time_before_the_appointment_is_in_days_then_hours(string $startsAt, string $unit, int $value): void
    {
        $this->travelTo('2026-11-03 10:00:00');
        $couple = Couple::factory()->withPortalAccess()->create();
        $this->createAppointment(Wedding::factory()->for($couple)->create(), ['starts_at' => $startsAt]);

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('nextAppointment.starts_in', ['unit' => $unit, 'value' => $value])
        );
    }

    public function test_the_home_page_counts_the_messages_the_couple_has_not_read(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();

        Message::factory()->count(2)->for($wedding)->create();
        Message::factory()->for(Wedding::factory()->for($couple))->create(['sender_id' => null]);
        Message::factory()->for($wedding)->read()->create();
        Message::factory()->for($wedding)->sentBy($couple->user)->create();
        Message::factory()->create();

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page->where('unreadMessages', 3));
    }

    public function test_the_home_page_counts_the_documents_of_all_the_weddings_of_the_couple(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $secondWedding = Wedding::factory()->for($couple)->create();

        Document::factory()->for($wedding)->create();
        Document::factory()->for($wedding)->viewed()->create();
        Document::factory()->for($wedding)->requiringApproval()->create();
        Document::factory()->for($wedding)->approved()->create();
        Document::factory()->for($secondWedding)->requiringApproval()->viewed()->create();

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('documents', ['total' => 5, 'unseen' => 2, 'to_sign' => 2])
        );
    }

    public function test_the_home_page_ignores_the_documents_of_other_couples(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Document::factory()->for(Wedding::factory()->for($couple))->create();
        Document::factory()->count(3)->requiringApproval()->create();

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('documents', ['total' => 1, 'unseen' => 1, 'to_sign' => 0])
        );
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('couple.home'));

        $response->assertRedirect(route('login'));
    }

    public function test_the_admin_cannot_open_the_couple_space(): void
    {
        $admin = User::factory()->admin()->make();

        $response = $this->actingAs($admin)->get(route('couple.home'));

        $response->assertForbidden();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    /**
     * Create an appointment for the wedding. The Appointment model comes from
     * the page-rendez-vous branch, which does not provide a factory yet.
     *
     * @param  array<string, mixed>  $attributes
     */
    private function createAppointment(Wedding $wedding, array $attributes): Appointment
    {
        return $wedding->appointments()->create([
            'type' => 'milestone',
            'title' => 'Point design',
            ...$attributes,
        ]);
    }
}
