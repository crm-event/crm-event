<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard'));
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
}
