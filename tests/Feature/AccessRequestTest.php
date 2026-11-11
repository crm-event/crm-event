<?php

namespace Tests\Feature;

use App\Models\Couple;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AccessRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        RateLimiter::clear('access-request|127.0.0.1');
    }

    /**
     * @param  array<string, string>  $overrides
     * @return array<string, string>
     */
    private function validRequest(array $overrides = []): array
    {
        return [
            'partner1_first_name' => 'Nina',
            'partner2_first_name' => 'Hugo',
            'email' => 'nina.hugo@example.test',
            'wedding_date' => now()->addYear()->toDateString(),
            ...$overrides,
        ];
    }

    public function test_a_visitor_can_request_access(): void
    {
        $this->post(route('access-request.store'), $this->validRequest(['email' => ' Nina.Hugo@Example.test ', 'language' => 'en']))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $couple = Couple::query()->awaitingAccess()->sole();
        $this->assertSame('nina.hugo@example.test', $couple->email);
        $this->assertSame('Nina & Hugo', $couple->threadTitle());
        $this->assertSame('en', $couple->preferred_language);
        $this->assertNull($couple->user_id);
        $this->assertSame('inquiry', $couple->latestWedding->status);
        $this->assertSame('Site', $couple->latestWedding->lead_source);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_the_form_does_not_tell_whether_an_address_has_an_account(): void
    {
        User::factory()->create(['email' => 'pris@example.test']);

        $this->post(route('access-request.store'), $this->validRequest(['email' => 'pris@example.test']))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertDatabaseCount('couples', 0);
    }

    public function test_a_second_request_with_the_same_address_is_ignored(): void
    {
        $this->post(route('access-request.store'), $this->validRequest());
        $this->post(route('access-request.store'), $this->validRequest())->assertRedirect(route('home'));

        $this->assertDatabaseCount('couples', 1);
    }

    public function test_a_couple_can_ask_again_after_a_refusal(): void
    {
        $couple = Couple::factory()->create(['email' => 'nina.hugo@example.test']);
        Wedding::factory()->for($couple)->create(['status' => 'cancelled']);

        $this->post(route('access-request.store'), $this->validRequest());

        $this->assertSame(1, Couple::query()->awaitingAccess()->count());
    }

    public function test_a_request_filling_the_hidden_field_is_ignored(): void
    {
        $this->post(route('access-request.store'), $this->validRequest(['website' => 'https://spam.example']))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertDatabaseCount('couples', 0);
    }

    public function test_an_invalid_request_is_rejected_in_the_language_of_the_visitor(): void
    {
        $this->post(route('access-request.store'), $this->validRequest(['partner1_first_name' => '', 'email' => 'pas-un-email']))
            ->assertSessionHasErrors([
                'partner1_first_name' => 'Indiquez votre prénom.',
                'email' => 'Cette adresse e-mail n’est pas valide.',
            ]);

        $this->post(route('access-request.store'), $this->validRequest(['email' => '', 'language' => 'en']))
            ->assertSessionHasErrors(['email' => 'Please enter your email address.']);

        $this->post(route('access-request.store'), $this->validRequest(['wedding_date' => '2020-01-01']))
            ->assertSessionHasErrors(['wedding_date' => 'La date du mariage doit être à venir.']);

        $this->assertDatabaseCount('couples', 0);
    }

    public function test_too_many_requests_are_refused(): void
    {
        foreach (range(1, 5) as $attempt) {
            $this->post(route('access-request.store'), $this->validRequest(['email' => "couple{$attempt}@example.test"]))
                ->assertSessionHasNoErrors();
        }

        $this->post(route('access-request.store'), $this->validRequest(['email' => 'couple6@example.test']))
            ->assertSessionHasErrors(['email' => 'Trop de demandes. Réessayez dans quelques minutes.']);

        $this->assertDatabaseCount('couples', 5);
    }
}
