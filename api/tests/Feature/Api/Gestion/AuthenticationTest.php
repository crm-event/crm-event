<?php

namespace Tests\Feature\Api\Gestion;

use App\Models\Coordinator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_coordinator_can_login(): void
    {
        $coordinator = Coordinator::factory()->create();

        $response = $this->fromGestion()->postJson('/api/v1/gestion/auth/login', [
            'email' => $coordinator->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.email', $coordinator->email)
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticatedAs($coordinator, 'coordinator');
        $this->assertGuest('client');
    }

    public function test_coordinator_cannot_login_with_wrong_password(): void
    {
        $coordinator = Coordinator::factory()->create();

        $this->fromGestion()->postJson('/api/v1/gestion/auth/login', [
            'email' => $coordinator->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertGuest('coordinator');
    }

    public function test_login_is_locked_after_five_failed_attempts(): void
    {
        $coordinator = Coordinator::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->fromGestion()->postJson('/api/v1/gestion/auth/login', [
                'email' => $coordinator->email,
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }

        // Même le bon mot de passe est refusé : le throttle de route (5/min)
        // répond 429 avant le verrouillage applicatif du LoginRequest.
        $this->fromGestion()->postJson('/api/v1/gestion/auth/login', [
            'email' => $coordinator->email,
            'password' => 'password',
        ])->assertTooManyRequests();

        $this->assertGuest('coordinator');
    }

    public function test_me_requires_authentication(): void
    {
        $this->fromGestion()->getJson('/api/v1/gestion/auth/me')
            ->assertUnauthorized();
    }

    public function test_me_returns_current_coordinator(): void
    {
        $coordinator = Coordinator::factory()->create();

        $this->actingAs($coordinator, 'coordinator')
            ->fromGestion()
            ->getJson('/api/v1/gestion/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $coordinator->id);
    }

    public function test_coordinator_can_logout(): void
    {
        $coordinator = Coordinator::factory()->create();

        $this->actingAs($coordinator, 'coordinator')
            ->fromGestion()
            ->postJson('/api/v1/gestion/auth/logout')
            ->assertNoContent();

        $this->assertGuest('coordinator');
    }
}
