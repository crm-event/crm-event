<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Wedding;
use App\Models\Couple;
use App\Models\Service;
use App\Models\Venue;
use App\Models\WeddingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WeddingSelectionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * Create an administrator.
     */
    private function creerAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    /**
     * Create a wedding with an associated couple.
     */
    private function creerMariage(): Wedding
    {
        return Wedding::factory()->create();
    }

    /**
     * Create an editable wedding service.
     */
    private function creerPrestationModifiable(
        Wedding $wedding,
        Service $service,
        float $amount = 1500
    ): WeddingService {
        return WeddingService::factory()->create([
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
            'amount' => $amount,
            'quote_accepted_at' => null,
            'contract_signed_at' => null,
        ]);
    }

    /**
     * Create a locked wedding service.
     */
    private function creerPrestationVerrouillee(
        Wedding $wedding,
        Service $service,
        array $attributes = []
    ): WeddingService {
        return WeddingService::factory()->create(array_merge([
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
            'amount' => 1500,
            'quote_accepted_at' => now(),
            'contract_signed_at' => null,
        ], $attributes));
    }

    // -------------------------------------------------------
    // INDEX
    // -------------------------------------------------------

    public function test_admin_can_access_wedding_selection_page(): void
    {
        $admin = $this->creerAdmin();

        $this->actingAs($admin)
            ->get(route('admin.wedding.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/WeddingSelection')
                ->has('weddings')
            );
    }

    public function test_weddings_are_displayed_in_chronological_order(): void
    {
        $admin = $this->creerAdmin();

        $wedding1 = $this->creerMariage();
        $wedding2 = $this->creerMariage();
        $wedding3 = $this->creerMariage();

        $wedding1->update(['wedding_date' => '2030-08-15']);
        $wedding2->update(['wedding_date' => '2029-05-20']);
        $wedding3->update(['wedding_date' => '2031-02-10']);

        $this->actingAs($admin)
            ->get(route('admin.wedding.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/WeddingSelection')
                ->where('weddings.0.id', $wedding2->id)
                ->where('weddings.1.id', $wedding1->id)
                ->where('weddings.2.id', $wedding3->id)
            );
    }

    // -------------------------------------------------------
    // SHOW
    // -------------------------------------------------------

    public function test_admin_can_access_a_wedding_page(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $this->actingAs($admin)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/Wedding')
                ->has('wedding')
                ->where('wedding.id', $wedding->id)
                ->has('prestations')
                ->has('prestataires')
                ->has('milestones')
                ->has('documents')
                ->has('design')
            );
    }

    public function test_nonexistent_wedding_returns_404_on_show(): void
    {
        $admin = $this->creerAdmin();

        $this->actingAs($admin)
            ->get(route('admin.wedding.show', 999999))
            ->assertNotFound();
    }

    // -------------------------------------------------------
    // EDIT
    // -------------------------------------------------------

    public function test_admin_can_access_wedding_edit_page(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $this->actingAs($admin)
            ->get(route('admin.wedding.edit', $wedding->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/Edit')
                ->has('wedding')
                ->has('venues')
                ->has('services')
                ->has('selectedServiceIds')
                ->has('selectedServices')
            );
    }

    public function test_edit_page_displays_selected_services_and_amounts(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $service = Service::factory()->create();

        $weddingService = $this->creerPrestationModifiable(
            $wedding,
            $service,
            2500
        );

        $this->actingAs($admin)
            ->get(route('admin.wedding.edit', $wedding->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/Edit')
                ->where('selectedServiceIds.0', $service->id)
                ->where('selectedServices.0.service_id', $service->id)
                ->where('selectedServices.0.amount', $weddingService->amount)
                ->where('selectedServices.0.locked', false)
            );
    }

    public function test_edit_page_identifies_locked_services(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $service = Service::factory()->create();

        $this->creerPrestationVerrouillee(
            $wedding,
            $service
        );

        $this->actingAs($admin)
            ->get(route('admin.wedding.edit', $wedding->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('selectedServices.0.locked', true)
            );
    }

    // -------------------------------------------------------
    // UPDATE : GENERAL INFORMATION
    // -------------------------------------------------------

    public function test_admin_can_update_wedding_information_and_couple_email(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $venue = Venue::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => 'nouveau@example.com',
                'wedding_date' => '2030-06-15',
                'venue_id' => $venue->id,
                'guest_count' => 120,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertRedirect(route('admin.wedding.show', $wedding->id))
            ->assertSessionHas('success');

        $wedding->refresh();
        $wedding->couple->refresh();

        $this->assertSame('2030-06-15', $wedding->wedding_date->format('Y-m-d'));
        $this->assertEquals($venue->id, $wedding->venue_id);
        $this->assertEquals(120, $wedding->guest_count);
        $this->assertSame('nouveau@example.com', $wedding->couple->email);
    }

    public function test_admin_can_update_wedding_without_a_venue(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => 'couple@example.com',
                'wedding_date' => '2030-09-12',
                'venue_id' => null,
                'guest_count' => 80,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertRedirect(route('admin.wedding.show', $wedding->id));

        $this->assertNull($wedding->fresh()->venue_id);
    }

    // -------------------------------------------------------
    // UPDATE : SERVICES
    // -------------------------------------------------------

    public function test_admin_can_add_a_service(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [$service->id],
                'service_amounts' => [
                    $service->id => 2500,
                ],
            ])
            ->assertRedirect(route('admin.wedding.show', $wedding->id));

        $this->assertDatabaseHas('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
            'amount' => 2500,
        ]);
    }

    public function test_admin_can_update_an_editable_service_amount(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->creerPrestationModifiable($wedding, $service, 1500);

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [$service->id],
                'service_amounts' => [
                    $service->id => 3000,
                ],
            ])
            ->assertRedirect(route('admin.wedding.show', $wedding->id));

        $this->assertDatabaseHas('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
            'amount' => 3000,
        ]);
    }

    public function test_admin_can_permanently_remove_an_unselected_service(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $oldService = Service::factory()->create();
        $newService = Service::factory()->create();

        $this->creerPrestationModifiable($wedding, $oldService);

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [$newService->id],
                'service_amounts' => [
                    $newService->id => 2000,
                ],
            ])
            ->assertRedirect(route('admin.wedding.show', $wedding->id));

        $this->assertDatabaseMissing('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $oldService->id,
        ]);

        $this->assertDatabaseHas('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $newService->id,
        ]);
    }

    public function test_admin_can_remove_all_editable_services(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->creerPrestationModifiable($wedding, $service);

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertRedirect(route('admin.wedding.show', $wedding->id));

        $this->assertDatabaseMissing('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
        ]);
    }

    // -------------------------------------------------------
    // UPDATE : LOCKED SERVICES
    // -------------------------------------------------------

    public function test_admin_cannot_remove_a_service_with_an_accepted_quote(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->creerPrestationVerrouillee($wedding, $service);

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertSessionHasErrors('service_ids');

        $this->assertDatabaseHas('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
        ]);
    }

    public function test_admin_cannot_change_the_amount_of_an_accepted_quote(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->creerPrestationVerrouillee($wedding, $service, [
            'amount' => 1500,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [$service->id],
                'service_amounts' => [
                    $service->id => 2000,
                ],
            ])
            ->assertSessionHasErrors('service_amounts.'.$service->id);

        $this->assertDatabaseHas('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
            'amount' => 1500,
        ]);
    }

    public function test_admin_cannot_remove_a_service_with_a_signed_contract(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->creerPrestationVerrouillee($wedding, $service, [
            'quote_accepted_at' => null,
            'contract_signed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => $wedding->wedding_date->format('Y-m-d'),
                'venue_id' => null,
                'guest_count' => $wedding->guest_count,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertSessionHasErrors('service_ids');

        $this->assertDatabaseHas('wedding_services', [
            'wedding_id' => $wedding->id,
            'service_id' => $service->id,
        ]);
    }

    // -------------------------------------------------------
    // UPDATE : VALIDATION
    // -------------------------------------------------------

    public function test_admin_cannot_update_wedding_with_invalid_email(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => 'adresse-invalide',
                'wedding_date' => '2030-06-15',
                'venue_id' => null,
                'guest_count' => 100,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_admin_cannot_update_wedding_with_invalid_guest_count(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => '2030-06-15',
                'venue_id' => null,
                'guest_count' => -10,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertSessionHasErrors('guest_count');
    }

    public function test_admin_cannot_select_a_nonexistent_service(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => '2030-06-15',
                'venue_id' => null,
                'guest_count' => 100,
                'service_ids' => [999999],
                'service_amounts' => [
                    999999 => 1500,
                ],
            ])
            ->assertSessionHasErrors('service_ids.0');
    }

    public function test_admin_must_provide_an_amount_for_each_selected_service(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => '2030-06-15',
                'venue_id' => null,
                'guest_count' => 100,
                'service_ids' => [$service->id],
                'service_amounts' => [],
            ])
            ->assertSessionHasErrors('service_amounts');
    }

    public function test_admin_cannot_provide_a_negative_service_amount(): void
    {
        $admin = $this->creerAdmin();
        $wedding = $this->creerMariage();
        $service = Service::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', $wedding->id), [
                'email' => $wedding->couple->email,
                'wedding_date' => '2030-06-15',
                'venue_id' => null,
                'guest_count' => 100,
                'service_ids' => [$service->id],
                'service_amounts' => [
                    $service->id => -500,
                ],
            ])
            ->assertSessionHasErrors('service_amounts.'.$service->id);
    }

    public function test_updating_a_nonexistent_wedding_returns_404(): void
    {
        $admin = $this->creerAdmin();

        $this->actingAs($admin)
            ->put(route('admin.wedding.update', 999999), [
                'email' => 'test@example.com',
                'wedding_date' => '2030-06-15',
                'venue_id' => null,
                'guest_count' => 100,
                'service_ids' => [],
                'service_amounts' => [],
            ])
            ->assertNotFound();
    }
}
