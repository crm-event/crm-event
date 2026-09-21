<?php

namespace Tests\Feature\Api\Client;

use App\Models\Client;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_activated_client_can_login(): void
    {
        $client = Client::factory()->create();

        $response = $this->fromClientPortal()->postJson('/api/v1/client/auth/login', [
            'email' => $client->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.email', $client->email)
            ->assertJsonPath('data.is_activated', true)
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticatedAs($client, 'client');
        $this->assertGuest('coordinator');
    }

    public function test_pending_client_cannot_login(): void
    {
        $client = Client::factory()->pending()->create();

        $this->fromClientPortal()->postJson('/api/v1/client/auth/login', [
            'email' => $client->email,
            'password' => 'password',
        ])->assertUnprocessable();

        $this->assertGuest('client');
    }

    public function test_me_requires_authentication(): void
    {
        $this->fromClientPortal()->getJson('/api/v1/client/auth/me')
            ->assertUnauthorized();
    }

    public function test_client_can_logout(): void
    {
        $client = Client::factory()->create();

        $this->actingAs($client, 'client')
            ->fromClientPortal()
            ->postJson('/api/v1/client/auth/logout')
            ->assertNoContent();

        $this->assertGuest('client');
    }

    public function test_reset_link_points_to_client_portal(): void
    {
        Notification::fake();

        $client = Client::factory()->pending()->create();

        $this->fromClientPortal()->postJson('/api/v1/client/auth/forgot-password', [
            'email' => $client->email,
        ])->assertOk();

        Notification::assertSentTo($client, ResetPassword::class, function (ResetPassword $notification) use ($client) {
            $url = ($notification->toMail($client))->actionUrl;

            return str_starts_with($url, config('frontend.client_url').'/reset-password?');
        });
    }

    public function test_forgot_password_does_not_reveal_unknown_emails(): void
    {
        Notification::fake();

        $this->fromClientPortal()->postJson('/api/v1/client/auth/forgot-password', [
            'email' => 'inconnu@example.com',
        ])->assertOk();

        Notification::assertNothingSent();
    }

    public function test_reset_password_activates_pending_client(): void
    {
        $client = Client::factory()->pending()->create();
        $token = Password::broker('clients')->createToken($client);

        $this->fromClientPortal()->postJson('/api/v1/client/auth/reset-password', [
            'token' => $token,
            'email' => $client->email,
            'password' => 'nouveau-mot-de-passe',
            'password_confirmation' => 'nouveau-mot-de-passe',
        ])->assertOk();

        $this->assertTrue($client->fresh()->isActivated());
        $this->assertNotNull($client->fresh()->activated_at);
    }
}
