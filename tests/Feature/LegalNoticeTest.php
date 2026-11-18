<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LegalNoticeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guests_can_read_the_public_legal_notice(): void
    {
        $response = $this->get(route('legal-notice'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('LegalNotice'));
    }

    public function test_a_couple_can_read_the_legal_notice_of_its_space(): void
    {
        $couple = User::factory()->create();

        $response = $this->actingAs($couple)->get(route('couple.legal-notice'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('Couple/LegalNotice'));
    }

    public function test_the_legal_notice_of_the_couple_space_requires_a_couple_account(): void
    {
        $this->get(route('couple.legal-notice'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.legal-notice'))
            ->assertForbidden();
    }
}
