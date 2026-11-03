<?php

namespace Tests\Feature\Couple;

use App\Models\Couple;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeControllerTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_the_home_page_receives_the_first_names_of_the_couple(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Marie',
            'partner2_first_name' => 'Paul',
        ]);

        $response = $this->actingAs($couple->user)->get(route('couple.home'));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Home')
            ->where('couple', [
                'partner1_first_name' => 'Marie',
                'partner2_first_name' => 'Paul',
            ])
        );
    }

    public function test_the_home_page_works_before_the_couple_record_is_linked(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('couple.home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Home')
            ->where('couple', null)
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
