<?php

namespace Tests\Feature\Auth;

use App\Models\Couple;
use App\Models\Manager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_gestion_login_screen_can_be_rendered(): void
    {
        $this->get(route('gestion.login'))->assertOk();
    }

    public function test_portail_login_screen_can_be_rendered(): void
    {
        $this->get(route('portail.login'))->assertOk();
    }

    public function test_manager_can_authenticate(): void
    {
        $manager = Manager::factory()->create();

        $this->post(route('gestion.login'), [
            'email' => $manager->email,
            'password' => 'password',
        ])->assertRedirect(route('gestion.dashboard'));

        $this->assertAuthenticatedAs($manager, 'manager');
    }

    public function test_couple_can_authenticate(): void
    {
        $couple = Couple::factory()->create();

        $this->post(route('portail.login'), [
            'email' => $couple->email,
            'password' => 'password',
        ])->assertRedirect(route('portail.home'));

        $this->assertAuthenticatedAs($couple, 'couple');
    }

    public function test_manager_cannot_authenticate_with_wrong_password(): void
    {
        $manager = Manager::factory()->create();

        $this->post(route('gestion.login'), [
            'email' => $manager->email,
            'password' => 'mauvais-mot-de-passe',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('manager');
    }

    public function test_manager_can_logout(): void
    {
        $manager = Manager::factory()->create();

        $this->actingAs($manager, 'manager')
            ->post(route('gestion.logout'))
            ->assertRedirect(route('gestion.login'));

        $this->assertGuest('manager');
    }

    public function test_couple_can_logout(): void
    {
        $couple = Couple::factory()->create();

        $this->actingAs($couple, 'couple')
            ->post(route('portail.logout'))
            ->assertRedirect(route('portail.login'));

        $this->assertGuest('couple');
    }
}
