<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Couple;
use App\Models\User;
use App\Models\Wedding;
use App\Notifications\TemporaryAccessCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
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

    private function accessRequest(): Couple
    {
        $couple = Couple::factory()->create([
            'partner1_first_name' => 'Nina',
            'partner2_first_name' => 'Hugo',
            'email' => 'nina.hugo@example.test',
        ]);
        Wedding::factory()->for($couple)->create(['status' => 'inquiry']);

        return $couple;
    }

    public function test_the_page_lists_only_the_pending_requests(): void
    {
        $pending = $this->accessRequest();
        Wedding::factory()->for(Couple::factory())->create(['status' => 'cancelled']);
        Wedding::factory()->for(Couple::factory()->state(['email' => null]))->create(['status' => 'inquiry']);
        Wedding::factory()->for(Couple::factory()->withPortalAccess())->create(['status' => 'inquiry']);

        $this->actingAs($this->jessica)
            ->get(route('admin.couples.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('accessRequests', 1)
                ->where('accessRequests.0.id', $pending->id)
                ->where('accessRequests.0.names', 'Nina & Hugo')
                ->where('accessRequests.0.email', 'nina.hugo@example.test')
            );
    }

    public function test_accepting_a_request_opens_the_space_and_emails_the_code(): void
    {
        Notification::fake();
        $couple = $this->accessRequest();

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.accept', $couple))
            ->assertRedirect(route('admin.couples.index'))
            ->assertSessionHas('temporaryCode.is_email_sent', true);

        $couple->refresh();
        $user = $couple->user;
        $this->assertSame('nina.hugo@example.test', $user->email);
        $this->assertSame(UserRole::Couple, $user->role);
        $this->assertTrue($user->must_change_password);
        $this->assertSame('quote_sent', $couple->latestWedding->status);

        Notification::assertSentTo($user, TemporaryAccessCodeNotification::class, function (TemporaryAccessCodeNotification $notification) use ($user) {
            $mail = $notification->toMail($user);
            $html = (string) $mail->render();

            $this->assertTrue(Hash::check($notification->temporaryCode, $user->password));
            $this->assertStringContainsString($notification->temporaryCode, $html);
            $this->assertStringContainsString('nina.hugo@example.test', $html);
            $this->assertSame('La Dernière Touche', $mail->from[1]);

            return true;
        });
    }

    public function test_when_the_email_fails_the_space_stays_open_and_jessica_sees_the_code(): void
    {
        $couple = $this->accessRequest();
        Notification::shouldReceive('send')->once()->andThrow(new RuntimeException('SMTP indisponible'));

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.accept', $couple))
            ->assertRedirect(route('admin.couples.index'))
            ->assertSessionHas('temporaryCode.is_email_sent', false);

        $this->assertTrue(Hash::check(session('temporaryCode')['code'], $couple->fresh()->user->password));
    }

    public function test_a_request_cannot_be_accepted_when_the_address_has_got_an_account(): void
    {
        Notification::fake();
        $couple = $this->accessRequest();
        User::factory()->create(['email' => 'nina.hugo@example.test']);

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.accept', $couple))
            ->assertSessionHasErrors('access_request');

        $this->assertNull($couple->fresh()->user_id);
        Notification::assertNothingSent();
    }

    public function test_refusing_a_request_keeps_the_record_without_opening_anything(): void
    {
        Notification::fake();
        $couple = $this->accessRequest();

        $this->actingAs($this->jessica)
            ->post(route('admin.couples.refuse', $couple))
            ->assertRedirect(route('admin.couples.index'));

        $couple->refresh();
        $this->assertNull($couple->user_id);
        $this->assertSame('cancelled', $couple->latestWedding->status);
        $this->assertSame('Accès refusé', $couple->latestWedding->cancellation_reason);
        $this->assertSame(0, Couple::query()->awaitingAccess()->count());
        Notification::assertNothingSent();
    }

    public function test_a_request_already_answered_cannot_be_answered_again(): void
    {
        Notification::fake();
        $couple = $this->accessRequest();
        $couple->latestWedding->update(['status' => 'cancelled']);

        $this->actingAs($this->jessica)->post(route('admin.couples.accept', $couple))->assertStatus(422);
        $this->post(route('admin.couples.refuse', $couple))->assertStatus(422);

        $this->assertNull($couple->fresh()->user_id);
    }

    public function test_opening_a_space_or_replacing_a_code_emails_the_code_too(): void
    {
        Notification::fake();

        $this->actingAs($this->jessica)->post(route('admin.couples.store'), [
            'partner1_first_name' => 'Carla',
            'email' => 'carla@example.test',
        ]);
        $user = User::query()->where('email', 'carla@example.test')->firstOrFail();

        $this->post(route('admin.couples.temporary-code', $user->couple));

        Notification::assertSentToTimes($user, TemporaryAccessCodeNotification::class, 2);
    }

    public function test_couples_and_guests_cannot_answer_a_request(): void
    {
        $couple = $this->accessRequest();
        $otherCouple = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($otherCouple->user);
        $this->post(route('admin.couples.accept', $couple))->assertForbidden();
        $this->post(route('admin.couples.refuse', $couple))->assertForbidden();

        auth()->logout();

        $this->post(route('admin.couples.accept', $couple))->assertRedirect(route('login'));
        $this->assertNull($couple->fresh()->user_id);
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
