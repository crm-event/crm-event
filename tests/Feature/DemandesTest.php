<?php

namespace Tests\Feature;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DemandesTest extends TestCase
{
    public function test_an_authenticated_user_can_view_the_demandes_page(): void
    {
        $user = User::factory()->make();

        $this->actingAs($user)
            ->get(route('demandes'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Demandes'));
    }

    public function test_a_guest_is_redirected_to_login(): void
    {
        $this->get(route('demandes'))
            ->assertRedirect(route('login'));
    }
}
