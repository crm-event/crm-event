<?php

namespace Tests\Feature;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DemandesTest extends TestCase
{
    public function test_the_admin_can_view_the_demandes_page(): void
    {
        $admin = User::factory()->admin()->make();

        $this->actingAs($admin)
            ->get(route('demandes'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Demandes'));
    }

    public function test_a_couple_cannot_view_the_demandes_page(): void
    {
        $this->actingAs(User::factory()->make())
            ->get(route('demandes'))
            ->assertForbidden();
    }

    public function test_a_guest_is_redirected_to_login(): void
    {
        $this->get(route('demandes'))
            ->assertRedirect(route('login'));
    }
}
