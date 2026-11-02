<?php

namespace Tests\Feature\Couple;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeControllerTest extends TestCase
{
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
}
