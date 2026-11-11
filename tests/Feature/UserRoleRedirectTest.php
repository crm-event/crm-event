<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_new_user_is_a_couple_by_default(): void
    {
        $user = new User;

        $this->assertSame(UserRole::Couple, $user->role);
        $this->assertTrue($user->hasRole(UserRole::Couple));
        $this->assertFalse($user->hasRole(UserRole::Admin));
    }

    public function test_each_role_has_its_own_home(): void
    {
        $this->assertSame(route('couple.home'), User::factory()->make()->homeUrl());
        $this->assertSame(route('dashboard'), User::factory()->admin()->make()->homeUrl());
    }

    public function test_a_logged_in_couple_opening_the_login_page_goes_back_to_the_couple_space(): void
    {
        $response = $this->actingAs(User::factory()->make())->get(route('login'));

        $response->assertRedirect(route('couple.home'));
    }

    public function test_a_logged_in_admin_opening_the_login_page_goes_back_to_the_back_office(): void
    {
        $response = $this->actingAs(User::factory()->admin()->make())->get(route('login'));

        $response->assertRedirect(route('dashboard'));
    }

    public function test_a_couple_cannot_open_back_office_pages(): void
    {
        $this->actingAs(User::factory()->make());

        foreach (['dashboard', 'facturation.index', 'depenses.index', 'mariages.prestations'] as $routeName) {
            $this->get(route($routeName))->assertForbidden();
        }
    }

    public function test_the_admin_can_open_back_office_pages(): void
    {
        $this->actingAs(User::factory()->admin()->make());

        foreach (['dashboard', 'facturation.index', 'depenses.index', 'mariages.prestations'] as $routeName) {
            $this->get(route($routeName))->assertOk();
        }
    }
}
