<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wedding;
use App\Models\Couple;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WeddingPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Disable Vite during tests
        $this->withoutVite();
    }

    /**
     * Test that an admin can access the wedding selection page.
     */
    public function test_admin_can_access_wedding_selection_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.wedding.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/WeddingSelection')
                ->has('weddings')
            );
    }

    /**
     * Test that the wedding selection page displays weddings.
     */
    public function test_wedding_selection_displays_weddings(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $couple = Couple::factory()->create([
            'partner1_first_name' => 'Alexandre',
            'partner1_last_name' => 'Martin',
            'partner2_first_name' => 'Camille',
            'partner2_last_name' => 'Durand',
        ]);

        $wedding = Wedding::factory()->create([
            'couple_id' => $couple->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.wedding.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/WeddingSelection')
                ->has('weddings', 1)
                ->where('weddings.0.id', $wedding->id)
                ->where(
                    'weddings.0.couple.partner1_first_name',
                    'Alexandre'
                )
                ->where(
                    'weddings.0.couple.partner2_first_name',
                    'Camille'
                )
            );
    }

    /**
     * Test that an admin can access a wedding page.
     */
    public function test_admin_can_access_wedding_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $couple = Couple::factory()->create();

        $wedding = Wedding::factory()->create([
            'couple_id' => $couple->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Wedding/Wedding')
                ->has('wedding')
                ->where('wedding.id', $wedding->id)
                ->where('wedding.couple_id', $couple->id)
            );
    }

    /**
     * Test that an unauthenticated user cannot access the wedding selection page.
     */
    public function test_guest_cannot_access_wedding_selection_page(): void
    {
        $this->get(route('admin.wedding.index'))
            ->assertRedirect(route('login'));
    }

    /**
     * Test that an unauthenticated user cannot access a wedding page.
     */
    public function test_guest_cannot_access_wedding_page(): void
    {
        $wedding = Wedding::factory()->create();

        $this->get(route('admin.wedding.show', $wedding->id))
            ->assertRedirect(route('login'));
    }

    /**
     * Test that a non-admin user cannot access the wedding selection page.
     */
    public function test_non_admin_cannot_access_wedding_selection_page(): void
    {
        $user = User::factory()->create([
            'role' => 'couple',
        ]);

        $this->actingAs($user)
            ->get(route('admin.wedding.index'))
            ->assertForbidden();
    }

    /**
     * Test that a non-admin user cannot access a wedding page.
     */
    public function test_non_admin_cannot_access_wedding_page(): void
    {
        $user = User::factory()->create([
            'role' => 'couple',
        ]);

        $wedding = Wedding::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.wedding.show', $wedding->id))
            ->assertForbidden();
    }
}
