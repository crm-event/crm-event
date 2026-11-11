<?php

namespace Tests\Feature;

use App\Models\Couple;
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

    public function test_the_chosen_language_is_kept_for_the_next_pages(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($couple)->booked()->create();

        $this->actingAs($couple->user)
            ->from(route('couple.home'))
            ->post(route('locale.update'), ['locale' => 'en'])
            ->assertRedirect(route('couple.home'));

        $this->get(route('couple.home'))->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('wedding.status_label', 'Contract signed')
        );
    }

    public function test_an_unknown_language_is_refused(): void
    {
        $response = $this->post(route('locale.update'), ['locale' => 'de']);

        $response->assertSessionHasErrors('locale');
        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
    }
}
