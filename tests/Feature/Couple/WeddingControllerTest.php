<?php

namespace Tests\Feature\Couple;

use App\Models\Couple;
use App\Models\Service;
use App\Models\User;
use App\Models\Venue;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WeddingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_couple_sees_the_key_information_of_its_wedding(): void
    {
        $this->travelTo('2026-11-06 10:00:00');
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Carla',
            'partner2_first_name' => 'Martin',
        ]);
        $venue = Venue::factory()->create([
            'name' => 'Domaine des Tilleuls',
            'address' => '12 chemin des Vignes',
            'postal_code' => '84000',
            'city' => 'Avignon',
            'access_notes' => 'Parking à l’entrée du domaine.',
        ]);
        $wedding = Wedding::factory()->for($couple)->for($venue)->booked()->create([
            'wedding_date' => '2027-06-12',
            'guest_count' => 85,
        ]);
        $wedding->services()->attach(Service::factory()->create(['name' => 'Wedding design']));
        $wedding->services()->attach(Service::factory()->create(['name' => 'Coordination']));

        $response = $this->actingAs($couple->user)->get(route('couple.wedding.show'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Wedding')
            ->where('coupleNames', 'Carla & Martin')
            ->where('wedding', [
                'date' => '2027-06-12',
                'days_until' => 218,
                'status' => 'booked',
                'status_label' => 'Contrat signé',
                'guest_count' => 85,
                'venue' => [
                    'name' => 'Domaine des Tilleuls',
                    'address' => '12 chemin des Vignes',
                    'postal_code' => '84000',
                    'city' => 'Avignon',
                    'access_notes' => 'Parking à l’entrée du domaine.',
                ],
                'services' => ['Wedding design', 'Coordination'],
            ])
        );
    }

    public function test_the_page_only_lists_the_services_of_the_couples_wedding(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $officiant = Service::factory()->create(['name' => 'Officiante de cérémonie']);
        $wedding->services()->attach($officiant);
        Wedding::factory()->create()->services()->attach(Service::factory()->create(['name' => 'Coordination']));

        $response = $this->actingAs($couple->user)->get(route('couple.wedding.show'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('wedding.services', ['Officiante de cérémonie'])
        );
    }

    public function test_the_page_shows_the_most_recent_wedding_of_the_couple(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create(['wedding_date' => '2025-05-10']);
        Wedding::factory()->for($couple)->create(['wedding_date' => '2027-09-18']);

        $response = $this->actingAs($couple->user)->get(route('couple.wedding.show'));

        $response->assertInertia(fn (Assert $page) => $page->where('wedding.date', '2027-09-18'));
    }

    public function test_the_venue_and_the_guest_count_can_be_unknown(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create(['venue_id' => null, 'guest_count' => null]);

        $response = $this->actingAs($couple->user)->get(route('couple.wedding.show'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('wedding.venue', null)
            ->where('wedding.guest_count', null)
        );
    }

    /**
     * @return array<string, array{string|null, int|null}>
     */
    public static function daysBeforeTheWeddingProvider(): array
    {
        return [
            'tomorrow' => ['2026-11-07', 1],
            'today' => ['2026-11-06', 0],
            'already celebrated' => ['2026-11-03', -3],
            'date not set' => [null, null],
        ];
    }

    #[DataProvider('daysBeforeTheWeddingProvider')]
    public function test_the_days_before_the_wedding_are_counted_in_calendar_days(?string $weddingDate, ?int $daysUntil): void
    {
        $this->travelTo('2026-11-06 23:30:00');
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->create(['wedding_date' => $weddingDate]);

        $response = $this->actingAs($couple->user)->get(route('couple.wedding.show'));

        $response->assertInertia(fn (Assert $page) => $page->where('wedding.days_until', $daysUntil));
    }

    public function test_the_page_works_before_any_wedding_is_recorded(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('couple.wedding.show'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Wedding')
            ->where('coupleNames', null)
            ->where('wedding', null)
        );
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('couple.wedding.show'));

        $response->assertRedirect(route('login'));
    }

    public function test_the_admin_cannot_open_the_wedding_tab(): void
    {
        $admin = User::factory()->admin()->make();

        $response = $this->actingAs($admin)->get(route('couple.wedding.show'));

        $response->assertForbidden();
    }
}
