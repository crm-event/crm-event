<?php

namespace Tests\Feature\Auth;

use App\Models\Couple;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FirstPasswordTest extends TestCase
{
    use RefreshDatabase;

    private const NEW_PASSWORD = 'mon-nouveau-mot-de-passe';

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_logging_in_with_a_temporary_password_leads_to_the_page_to_choose_one(): void
    {
        $user = User::factory()->mustChangePassword()->create();

        $this->post(route('login'), ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect($user->homeUrl());

        $this->get($user->homeUrl())->assertRedirect(route('password.first.edit'));

        $this->get(route('password.first.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Auth/FirstPassword'));
    }

    public function test_nothing_can_be_done_before_choosing_a_password(): void
    {
        $couple = Couple::factory()->create(['user_id' => User::factory()->mustChangePassword()]);

        $this->actingAs($couple->user)
            ->post(route('couple.community.store'), ['body' => 'Bonjour'])
            ->assertRedirect(route('password.first.edit'));

        $this->assertDatabaseCount('community_posts', 0);

        $this->get(route('profile.edit'))->assertRedirect(route('password.first.edit'));
    }

    public function test_the_administrator_is_kept_on_the_page_too(): void
    {
        $this->actingAs(User::factory()->admin()->mustChangePassword()->create())
            ->get(route('dashboard'))
            ->assertRedirect(route('password.first.edit'));
    }

    public function test_a_user_can_log_out_before_choosing_a_password(): void
    {
        $this->actingAs(User::factory()->mustChangePassword()->create())
            ->post(route('logout'))
            ->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_choosing_a_password_opens_the_space(): void
    {
        $user = User::factory()->mustChangePassword()->create();

        $this->actingAs($user)
            ->put(route('password.first.update'), [
                'password' => self::NEW_PASSWORD,
                'password_confirmation' => self::NEW_PASSWORD,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect($user->homeUrl());

        $user->refresh();
        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check(self::NEW_PASSWORD, $user->password));

        $this->get($user->homeUrl())->assertOk();
    }

    public function test_the_temporary_password_cannot_be_kept(): void
    {
        $user = User::factory()->mustChangePassword()->create(['password' => Hash::make('code-provisoire')]);

        $this->actingAs($user)
            ->put(route('password.first.update'), [
                'password' => 'code-provisoire',
                'password_confirmation' => 'code-provisoire',
            ])
            ->assertSessionHasErrors(['password' => 'Choisissez un mot de passe différent de votre code provisoire.']);

        $this->assertTrue($user->fresh()->must_change_password);
    }

    public function test_an_invalid_password_is_rejected_with_a_french_message(): void
    {
        $user = User::factory()->mustChangePassword()->create();

        $this->actingAs($user)
            ->put(route('password.first.update'), ['password' => 'court', 'password_confirmation' => 'court'])
            ->assertSessionHasErrors(['password' => 'Votre mot de passe doit contenir au moins 8 caractères.']);

        $this->put(route('password.first.update'), [
            'password' => self::NEW_PASSWORD,
            'password_confirmation' => 'autre-mot-de-passe',
        ])->assertSessionHasErrors(['password' => 'Les deux mots de passe ne correspondent pas.']);

        $this->assertTrue($user->fresh()->must_change_password);
    }

    public function test_a_user_who_has_a_password_of_their_own_is_not_concerned(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get($user->homeUrl())->assertOk();

        $this->get(route('password.first.edit'))->assertRedirect($user->homeUrl());
    }

    public function test_the_page_cannot_change_a_password_without_the_current_one(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('password.first.update'), [
                'password' => self::NEW_PASSWORD,
                'password_confirmation' => self::NEW_PASSWORD,
            ])
            ->assertRedirect($user->homeUrl());

        $this->assertFalse(Hash::check(self::NEW_PASSWORD, $user->fresh()->password));
    }

    public function test_guests_cannot_open_the_page(): void
    {
        $this->get(route('password.first.edit'))->assertRedirect(route('login'));
    }
}
