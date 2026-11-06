<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Couple;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CoupleControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $jessica;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->jessica = User::factory()->admin()->create();
    }

    public function test_the_list_shows_the_couples_who_have_a_space_and_their_state(): void
    {
        $waiting = Couple::factory()->create([
            'user_id' => User::factory()->mustChangePassword(),
            'partner1_first_name' => 'Carla',
            'partner2_first_name' => 'Martin',
        ]);
        Wedding::factory()->for($waiting)->create(['wedding_date' => '2027-06-26']);
        $active = Couple::factory()->withPortalAccess()->create();
        Couple::factory()->create();

        $this->actingAs($this->jessica)
            ->get(route('admin.couples.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Couples/Index')
                ->has('couples', 2)
                ->where('couples.0.id', $active->id)
                ->where('couples.0.is_waiting_first_login', false)
                ->where('couples.1.names', 'Carla & Martin')
                ->where('couples.1.email', $waiting->user->email)
                ->where('couples.1.wedding_date', '2027-06-26')
                ->where('couples.1.is_waiting_first_login', true)
                ->where('temporaryCode', null)
            );
    }

    public function test_jessica_opens_a_space_with_a_temporary_code(): void
    {
        $response = $this->actingAs($this->jessica)->post(route('admin.couples.store'), [
            'partner1_first_name' => 'Carla',
            'partner1_last_name' => 'Facchini',
            'partner2_first_name' => 'Martin',
            'partner2_last_name' => 'Catrysse',
            'email' => ' Carla.Martin@Example.test ',
            'wedding_date' => '2027-06-26',
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect(route('admin.couples.index'));

        $user = User::query()->where('email', 'carla.martin@example.test')->firstOrFail();
        $this->assertSame('Carla & Martin', $user->name);
        $this->assertSame(UserRole::Couple, $user->role);
        $this->assertTrue($user->must_change_password);

        $couple = $user->couple;
        $this->assertSame('Facchini', $couple->partner1_last_name);
        $this->assertSame('carla.martin@example.test', $couple->email);
        $this->assertSame('quote_sent', $couple->latestWedding->status);
        $this->assertSame('2027-06-26', $couple->latestWedding->wedding_date->toDateString());

        $code = session('temporaryCode')['code'];
        $this->assertGreaterThanOrEqual(8, strlen($code));
        $this->assertTrue(Hash::check($code, $user->password));
        $this->assertNotSame($code, $user->password);
    }

    public function test_the_code_is_displayed_only_once(): void
    {
        $this->actingAs($this->jessica)->post(route('admin.couples.store'), [
            'partner1_first_name' => 'Carla',
            'email' => 'carla@example.test',
        ]);
        $code = session('temporaryCode')['code'];

        $this->get(route('admin.couples.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('temporaryCode.code', $code)
                ->where('temporaryCode.email', 'carla@example.test')
            );

        $this->get(route('admin.couples.index'))
            ->assertInertia(fn (Assert $page) => $page->where('temporaryCode', null));
    }

    public function test_the_couple_logs_in_with_the_code_and_must_then_choose_a_password(): void
    {
        $this->actingAs($this->jessica)->post(route('admin.couples.store'), [
            'partner1_first_name' => 'Carla',
            'email' => 'carla@example.test',
        ]);
        $code = session('temporaryCode')['code'];
        auth()->logout();

        $this->post(route('login'), ['email' => 'carla@example.test', 'password' => $code])
            ->assertRedirect(route('couple.home'));

        $this->assertAuthenticated();
        $this->get(route('couple.home'))->assertRedirect(route('password.first.edit'));
    }

    public function test_an_e_mail_already_used_is_rejected_and_nothing_is_created(): void
    {
        $taken = User::factory()->create(['email' => 'pris@example.test']);

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.store'), [
                'partner1_first_name' => 'Carla',
                'email' => 'PRIS@example.test',
            ])
            ->assertSessionHasErrors(['email' => 'Un compte existe déjà avec cette adresse e-mail.']);

        $this->assertDatabaseCount('couples', 0);
        $this->assertDatabaseCount('weddings', 0);
        $this->assertSame(2, User::query()->whereKey([$taken->id, $this->jessica->id])->count());
        $this->assertDatabaseCount('users', 2);
    }

    public function test_a_first_name_and_a_valid_e_mail_are_required(): void
    {
        $this->actingAs($this->jessica)
            ->post(route('admin.couples.store'), ['partner1_first_name' => '', 'email' => 'pas-un-email'])
            ->assertSessionHasErrors([
                'partner1_first_name' => 'Indiquez au moins un prénom.',
                'email' => 'Cette adresse e-mail n’est pas valide.',
            ]);
    }

    public function test_a_lost_code_can_be_replaced(): void
    {
        $couple = Couple::factory()->create([
            'user_id' => User::factory()->mustChangePassword()->state(['password' => Hash::make('ancien-code')]),
        ]);

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.temporary-code', $couple))
            ->assertRedirect(route('admin.couples.index'));

        $user = $couple->user->fresh();
        $this->assertFalse(Hash::check('ancien-code', $user->password));
        $this->assertTrue(Hash::check(session('temporaryCode')['code'], $user->password));
        $this->assertTrue($user->must_change_password);
    }

    public function test_the_password_chosen_by_a_couple_cannot_be_replaced(): void
    {
        $couple = Couple::factory()->create([
            'user_id' => User::factory()->state(['password' => Hash::make('son-mot-de-passe')]),
        ]);

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.temporary-code', $couple))
            ->assertStatus(422);

        $user = $couple->user->fresh();
        $this->assertTrue(Hash::check('son-mot-de-passe', $user->password));
        $this->assertFalse($user->must_change_password);
    }

    public function test_couples_and_guests_cannot_manage_the_spaces(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($couple->user);
        $this->get(route('admin.couples.index'))->assertForbidden();
        $this->post(route('admin.couples.store'), [])->assertForbidden();
        $this->post(route('admin.couples.temporary-code', $couple))->assertForbidden();

        auth()->logout();

        $this->get(route('admin.couples.index'))->assertRedirect(route('login'));
        $this->post(route('admin.couples.store'), [])->assertRedirect(route('login'));
    }
}
