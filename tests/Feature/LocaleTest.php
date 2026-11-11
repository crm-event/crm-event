<?php

namespace Tests\Feature;

use App\Http\Middleware\SetLocale;
use App\Models\Couple;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_site_is_in_french_by_default(): void
    {
        $response = $this->get(route('home'));

        $response->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
    }

    public function test_choosing_a_language_keeps_it_in_a_cookie_and_reloads_the_page(): void
    {
        $response = $this->from(route('login'))->post(route('locale.update'), ['locale' => 'en']);

        $response->assertRedirect(route('login'));
        $response->assertPlainCookie(SetLocale::COOKIE, 'en');
    }

    public function test_the_chosen_language_applies_to_the_pages_and_to_the_server_texts(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->booked()->create();

        $this->actingAs($couple->user)
            ->withUnencryptedCookie(SetLocale::COOKIE, 'en')
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->where('wedding.status_label', 'Contract signed')
            );
    }

    public function test_the_error_messages_follow_the_chosen_language(): void
    {
        $credentials = ['email' => 'inconnu@example.test', 'password' => 'mauvais-mot-de-passe'];

        $this->post(route('login'), $credentials)
            ->assertSessionHasErrors(['email' => 'Ces identifiants ne correspondent à aucun compte.']);

        $this->withUnencryptedCookie(SetLocale::COOKIE, 'en')
            ->post(route('login'), $credentials)
            ->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
    }

    public function test_the_error_page_follows_the_chosen_language(): void
    {
        $this->withUnencryptedCookie(SetLocale::COOKIE, 'en')
            ->get('/page-qui-n-existe-pas')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Error')
                ->where('status', 404)
                ->where('locale', 'en')
            );
    }

    public function test_a_couple_without_a_choice_gets_the_language_of_their_request(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create(['preferred_language' => 'en']);
        Wedding::factory()->for($couple)->booked()->create();

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));

        $this->actingAs($couple->user)
            ->withUnencryptedCookie(SetLocale::COOKIE, 'fr')
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
    }

    public function test_the_back_office_always_stays_in_french(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->withUnencryptedCookie(SetLocale::COOKIE, 'en')
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
    }

    public function test_an_unknown_language_is_refused(): void
    {
        $response = $this->post(route('locale.update'), ['locale' => 'de']);

        $response->assertSessionHasErrors('locale');
        $response->assertCookieMissing(SetLocale::COOKIE);
    }
}
