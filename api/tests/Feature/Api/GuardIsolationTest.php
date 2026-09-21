<?php

namespace Tests\Feature\Api;

use App\Models\Client;
use App\Models\Coordinator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Garantit l'étanchéité entre le back-office et le portail client : ces
 * tests doivent rester verts quelle que soit l'évolution des deux zones.
 */
class GuardIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_session_cannot_access_gestion_routes(): void
    {
        $client = Client::factory()->create();

        $this->actingAs($client, 'client')
            ->fromGestion()
            ->getJson('/api/v1/gestion/auth/me')
            ->assertUnauthorized();
    }

    public function test_coordinator_session_cannot_access_client_routes(): void
    {
        $coordinator = Coordinator::factory()->create();

        $this->actingAs($coordinator, 'coordinator')
            ->fromClientPortal()
            ->getJson('/api/v1/client/auth/me')
            ->assertUnauthorized();
    }

    public function test_client_credentials_are_rejected_on_gestion_login(): void
    {
        $client = Client::factory()->create();

        $this->fromGestion()->postJson('/api/v1/gestion/auth/login', [
            'email' => $client->email,
            'password' => 'password',
        ])->assertUnprocessable();

        $this->assertGuest('coordinator');
        $this->assertGuest('client');
    }

    public function test_coordinator_credentials_are_rejected_on_client_login(): void
    {
        $coordinator = Coordinator::factory()->create();

        $this->fromClientPortal()->postJson('/api/v1/client/auth/login', [
            'email' => $coordinator->email,
            'password' => 'password',
        ])->assertUnprocessable();

        $this->assertGuest('client');
        $this->assertGuest('coordinator');
    }
}
