<?php

namespace Tests\Feature\Auth;

use App\Models\Manager;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $manager = Manager::factory()->create();

        $this->post(route('gestion.password.email'), ['email' => $manager->email]);

        Notification::assertSentTo($manager, ResetPassword::class);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $manager = Manager::factory()->create();

        $this->post(route('gestion.password.email'), ['email' => $manager->email]);

        Notification::assertSentTo($manager, ResetPassword::class, function (object $notification) use ($manager) {
            $this->post(route('gestion.password.store'), [
                'token' => $notification->token,
                'email' => $manager->email,
                'password' => 'nouveau-mot-de-passe',
                'password_confirmation' => 'nouveau-mot-de-passe',
            ])->assertSessionHasNoErrors();

            return true;
        });
    }

    public function test_unknown_email_does_not_reveal_anything(): void
    {
        Notification::fake();

        $this->post(route('gestion.password.email'), ['email' => 'inconnu@example.test'])
            ->assertSessionHasNoErrors();

        Notification::assertNothingSent();
    }
}
