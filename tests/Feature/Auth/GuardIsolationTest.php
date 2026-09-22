<?php

namespace Tests\Feature\Auth;

use App\Models\Couple;
use App\Models\Manager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Garantit l'étanchéité entre le back-office et le portail : ces tests
 * doivent rester verts quelle que soit l'évolution des deux espaces.
 *
 * Les deux populations partagent la table `user` ; la séparation tient aux
 * deux guards et aux global scopes de Manager et Couple. C'est exactement
 * ce que ces tests vérifient.
 */
class GuardIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_couple_session_cannot_access_gestion_routes(): void
    {
        $couple = Couple::factory()->create();

        $this->actingAs($couple, 'couple')
            ->get('/gestion')
            ->assertRedirect(route('gestion.login'));
    }

    public function test_manager_session_cannot_access_portail_routes(): void
    {
        $manager = Manager::factory()->create();

        $this->actingAs($manager, 'manager')
            ->get('/')
            ->assertRedirect(route('portail.login'));
    }

    public function test_couple_credentials_are_rejected_on_gestion_login(): void
    {
        $couple = Couple::factory()->create();

        $this->post(route('gestion.login'), [
            'email' => $couple->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('manager');
        $this->assertGuest('couple');
    }

    public function test_manager_credentials_are_rejected_on_portail_login(): void
    {
        $manager = Manager::factory()->create();

        $this->post(route('portail.login'), [
            'email' => $manager->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('couple');
        $this->assertGuest('manager');
    }

    public function test_manager_scope_never_returns_a_couple(): void
    {
        $couple = Couple::factory()->create();

        $this->assertNull(Manager::find($couple->id));
        $this->assertNotNull(Couple::find($couple->id));
    }

    public function test_couple_scope_never_returns_a_manager(): void
    {
        $manager = Manager::factory()->create();

        $this->assertNull(Couple::find($manager->id));
        $this->assertNotNull(Manager::find($manager->id));
    }
}
