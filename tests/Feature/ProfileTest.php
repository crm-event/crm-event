<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    public function test_the_page_follows_the_space_of_the_user(): void
    {
        $this->withoutVite();

        $this->actingAs(User::factory()->create())
            ->get('/profile')
            ->assertInertia(fn (Assert $page) => $page->component('Profile/Edit')->where('canDeleteAccount', true));

        $this->actingAs(User::factory()->admin()->create())
            ->get('/profile')
            ->assertInertia(fn (Assert $page) => $page->component('Profile/Edit')->where('canDeleteAccount', false));
    }

    public function test_the_administrator_cannot_delete_her_account(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->delete('/profile', ['password' => 'password'])
            ->assertForbidden();

        $this->assertNotNull($admin->fresh());
        $this->assertAuthenticatedAs($admin);
    }

    public function test_errors_are_given_in_french(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from('/profile')
            ->delete('/profile', ['password' => 'wrong-password'])
            ->assertSessionHasErrors(['password' => 'Ce mot de passe est incorrect.']);

        $this->actingAs($user)
            ->from('/profile')
            ->put('/password', [
                'current_password' => 'password',
                'password' => 'court',
                'password_confirmation' => 'court',
            ])
            ->assertSessionHasErrors(['password' => 'Votre mot de passe doit contenir au moins 8 caractères.']);
    }

    public function test_the_e_mail_is_saved_in_lower_case(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profile', ['name' => 'Carla & Martin', 'email' => ' Carla@Example.TEST '])
            ->assertSessionHasNoErrors();

        $this->assertSame('carla@example.test', $user->fresh()->email);
    }
}
