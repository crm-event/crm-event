<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\CommunityPost;
use App\Models\Couple;
use App\Models\Document;
use App\Models\Expense;
use App\Models\MediaItem;
use App\Models\Message;
use App\Models\Payment;
use App\Models\Proposal;
use App\Models\ProposalComment;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The migrations that replace the "Carla & Martin" demo couple by Jessica's
 * account and the invented couple Séverine & Bruno.
 */
class DemoAccountsMigrationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake();
    }

    public function test_the_carla_and_martin_couple_space_is_deleted_with_everything_tied_to_it(): void
    {
        $carlaAndMartin = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Carla',
            'partner2_first_name' => 'Martin',
        ]);
        $account = $carlaAndMartin->user;
        $wedding = Wedding::factory()->for($carlaAndMartin)->booked()->create();
        Payment::factory()->for(WeddingService::factory()->for($wedding))->create();
        Expense::factory()->for($wedding)->create();
        Appointment::factory()->for($wedding)->create();
        Storage::put('documents/contrat.pdf', 'pdf');
        Document::factory()->for($wedding)->create(['file_path' => 'documents/contrat.pdf']);
        MediaItem::factory()->for($wedding)->create(['uploaded_by' => $account->id]);
        Message::factory()->for($wedding)->create(['sender_id' => $account->id]);
        ProposalComment::factory()->for(Proposal::factory()->for($wedding))->create(['user_id' => $account->id]);
        $post = CommunityPost::factory()->create(['user_id' => $account->id]);
        CommunityPost::factory()->create(['parent_id' => $post->id]);

        $importedFromTheSpreadsheet = Couple::factory()->create([
            'partner1_first_name' => 'Carla',
            'partner2_first_name' => 'Martin',
        ]);
        $importedWedding = Wedding::factory()->for($importedFromTheSpreadsheet)->create();
        $otherWedding = Wedding::factory()->create();
        Message::factory()->for($otherWedding)->create();

        $this->runMigration('2026_11_16_143339_delete_carla_and_martin_couple_space');

        $this->assertModelMissing($account);
        $this->assertModelMissing($carlaAndMartin);
        $this->assertModelMissing($wedding);
        $this->assertSame(0, Payment::query()->count());
        $this->assertSame(0, WeddingService::query()->count());
        $this->assertSame(0, Expense::query()->count());
        $this->assertSame(0, Appointment::query()->count());
        $this->assertSame(0, Document::query()->count());
        $this->assertSame(0, MediaItem::query()->count());
        $this->assertSame(0, Proposal::query()->count());
        $this->assertSame(0, ProposalComment::query()->count());
        $this->assertSame(0, CommunityPost::query()->count());
        Storage::assertMissing('documents/contrat.pdf');

        $this->assertModelExists($importedFromTheSpreadsheet);
        $this->assertModelExists($importedWedding);
        $this->assertSame(1, $otherWedding->messages()->count());
    }

    public function test_jessica_gets_a_back_office_account_with_a_temporary_code(): void
    {
        $migration = $this->migration('2026_11_16_143340_create_jessica_admin_account');

        $temporaryCode = $migration->createAccount();

        $jessica = User::query()->where('email', 'ladernieretouche.event@gmail.com')->sole();
        $this->assertSame(UserRole::Admin, $jessica->role);
        $this->assertTrue($jessica->must_change_password);
        $this->assertNotNull($jessica->email_verified_at);
        $this->assertTrue(Hash::check($temporaryCode, $jessica->password));

        $this->assertNull($migration->createAccount());
        $this->assertSame(1, User::query()->count());
    }

    public function test_severine_and_bruno_get_a_couple_space_ready_for_the_demo(): void
    {
        $this->migration('2026_11_16_143340_create_jessica_admin_account')->createAccount();
        $migration = $this->migration('2026_11_16_143341_create_severine_and_bruno_demo_couple');

        $temporaryCode = $migration->createDemoCouple();

        $account = User::query()->where('email', 'severine.bruno@example.com')->sole();
        $this->assertSame(UserRole::Couple, $account->role);
        $this->assertTrue(Hash::check($temporaryCode, $account->password));

        // Past the forced password change, as after their first login.
        $account->forceFill(['must_change_password' => false])->save();

        $this->actingAs($account)->get(route('couple.home'))->assertInertia(fn (Assert $page) => $page
            ->where('coupleNames', 'Séverine & Bruno')
            ->where('wedding.date', '2027-07-10')
            ->where('wedding.venue.name', 'Domaine de Sulauze')
            ->where('wedding.services', ['Wedding design', 'Coordination'])
            ->where('unreadMessages', 1)
            ->where('documents', ['total' => 4, 'unseen' => 2, 'to_sign' => 1])
        );

        $designBook = Proposal::query()->sole();
        $this->assertNull($designBook->approved_at);
        $this->assertStringStartsWith('%PDF-1.4', Storage::get($designBook->document->file_path));
        $this->assertSame(
            User::query()->where('email', 'ladernieretouche.event@gmail.com')->value('id'),
            $designBook->document->uploaded_by,
        );

        $this->assertNull($migration->createDemoCouple());
        $this->assertSame(1, Couple::query()->count());
    }

    public function test_the_accounts_are_not_created_in_the_test_databases(): void
    {
        $this->runMigration('2026_11_16_143340_create_jessica_admin_account');
        $this->runMigration('2026_11_16_143341_create_severine_and_bruno_demo_couple');

        $this->assertSame(0, User::query()->count());
    }

    private function migration(string $name): Migration
    {
        return require database_path("migrations/{$name}.php");
    }

    private function runMigration(string $name): void
    {
        $this->migration($name)->up();
    }
}
