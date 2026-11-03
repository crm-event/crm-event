<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CalendrierTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendrier_page_is_displayed_to_an_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('calendrier'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Calendrier'));
    }

    public function test_calendrier_page_redirects_a_guest_to_login(): void
    {
        $response = $this->get(route('calendrier'));

        $response->assertRedirect(route('login'));
    }
}
