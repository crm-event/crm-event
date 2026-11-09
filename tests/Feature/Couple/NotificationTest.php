<?php

namespace Tests\Feature\Couple;

use App\Models\Appointment;
use App\Models\Couple;
use App\Models\Document;
use App\Models\Message;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_couple_with_nothing_new_has_no_notification(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        Document::factory()->for($wedding)->viewed()->create();
        Message::factory()->for($wedding)->create(['sender_id' => $couple->user_id]);

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_the_notifications_come_from_the_couple_s_data(): void
    {
        $jessica = User::factory()->admin()->create();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        Message::factory()->count(2)->for($wedding)->create(['sender_id' => $jessica->id]);
        Document::factory()->for($wedding)->create();
        Document::factory()->for($wedding)->viewed()->requiringApproval()->create();
        Appointment::factory()->for($wedding)->create(['title' => 'Point design M-6', 'starts_at' => now()->addDays(3)]);
        Appointment::factory()->for($wedding)->create(['starts_at' => now()->addMonths(2)]);
        Document::factory()->count(3)->create();

        $this->actingAs($couple->user)
            ->get(route('couple.home'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('coupleNotifications', 4)
                ->where('coupleNotifications.0.key', 'messages')
                ->where('coupleNotifications.0.title', '2 nouveaux messages de Jessica')
                ->where('coupleNotifications.1.key', 'documents')
                ->where('coupleNotifications.1.title', 'Un nouveau document')
                ->where('coupleNotifications.2.key', 'approvals')
                ->where('coupleNotifications.3.key', 'appointment')
                ->where('coupleNotifications.3.text', 'Point design M-6')
                ->where('coupleNotifications.3.route', 'couple.appointments.index')
            );
    }

    public function test_reading_the_messages_removes_their_notification(): void
    {
        $jessica = User::factory()->admin()->create();
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        Message::factory()->for($wedding)->create(['sender_id' => $jessica->id]);

        $this->actingAs($couple->user)
            ->get(route('couple.messages.index'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }

    public function test_the_administrator_and_guests_get_no_couple_notification(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));

        auth()->logout();

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('coupleNotifications', []));
    }
}
