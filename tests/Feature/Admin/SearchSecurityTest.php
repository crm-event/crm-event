<?php

namespace Tests\Feature\Admin;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Appointment;
use App\Models\CalendarEvent;
use App\Models\Couple;
use App\Models\Document;
use App\Models\Message;
use App\Models\User;
use App\Models\Venue;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class SearchSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    #[DataProvider('attackStrings')]
    public function test_attack_strings_do_not_execute_commands_disclose_records_or_change_data(string $input): void
    {
        $records = $this->searchRecords();
        $before = $this->databaseSnapshot();

        $this->actingAs($records['admin'])
            ->getJson(route('recherche', ['q' => $input]))
            ->assertOk()
            ->assertExactJson(['results' => []]);

        $this->assertSame($before, $this->databaseSnapshot());
    }

    /**
     * @return array<string, array{string}>
     */
    public static function attackStrings(): array
    {
        return [
            'boolean single quote' => ["' OR 1=1 --"],
            'boolean double quote' => ['" OR "1"="1" --'],
            'parenthesis' => ["') OR ('1'='1"],
            'mysql comment' => ["' OR 1=1#"],
            'inline comments' => ["'/**/OR/**/1=1--"],
            'union columns' => ["' UNION SELECT 1,2,3,4,5,6--"],
            'union passwords' => ["' UNION SELECT password FROM users--"],
            'privilege update' => ["'; UPDATE users SET role='admin';--"],
            'message deletion' => ["'; DELETE FROM messages;--"],
            'table deletion' => ["'; DROP TABLE couples;--"],
            'existence subquery' => ["' OR EXISTS(SELECT 1 FROM users)--"],
            'mysql delay' => ["' OR SLEEP(1)--"],
            'postgres delay' => ["'; SELECT pg_sleep(1);--"],
            'mssql delay' => ["'; WAITFOR DELAY '00:00:01';--"],
            'sqlite concatenation' => ["' || (SELECT sqlite_version()) || '"],
            'backslash quote' => ["\\' OR 1=1--"],
            'encoded quote' => ['%27%20OR%201%3D1--'],
            'double encoded quote' => ['%2527%2520OR%25201%253D1--'],
            'percent wildcard' => ['%%'],
            'underscore wildcard' => ['__'],
            'combined wildcards' => ['%_!'],
            'escape character' => ['!!%_'],
            'shell chaining' => ['; whoami'],
            'command substitution' => ['$(whoami)'],
            'shell backticks' => [chr(96).'whoami'.chr(96)],
            'powershell pipeline' => ['Get-Process | Select-Object Name'],
            'path traversal' => ['../../.env'],
            'template expression' => ['{{7*7}}'],
            'javascript scheme' => ["javascript:alert('test')"],
            'script element' => ['<script>alert(1)</script>'],
            'html event handler' => ['<img src=x onerror=alert(1)>'],
        ];
    }

    #[TestWith(["' OR 1=1 --"])]
    #[TestWith(['<script>alert(1)</script>'])]
    #[TestWith(["O'Connor"])]
    #[TestWith(['%_!'])]
    public function test_special_characters_stored_in_the_database_remain_literal_json_text(string $title): void
    {
        $admin = User::factory()->admin()->create();
        $event = CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => $title, 'event_date' => '2027-06-19',
        ]);
        CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Autre evenement prive', 'event_date' => '2027-06-20',
        ]);
        $before = $this->databaseSnapshot();

        $this->actingAs($admin)->getJson(route('recherche', ['q' => $title]))
            ->assertOk()->assertHeader('Content-Type', 'application/json')
            ->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.id', 'event-'.$event->id)
            ->assertJsonPath('results.0.label', $title);

        $this->assertSame($before, $this->databaseSnapshot());
    }

    #[DataProvider('invalidInputs')]
    public function test_invalid_query_types_and_sizes_are_rejected_with_422(mixed $input): void
    {
        $admin = User::factory()->admin()->create();
        $before = $this->databaseSnapshot();

        $this->actingAs($admin)->json('GET', route('recherche'), ['q' => $input])
            ->assertUnprocessable()->assertJsonValidationErrors('q');

        $this->assertSame($before, $this->databaseSnapshot());
    }

    /**
     * @return array<string, array{mixed}>
     */
    public static function invalidInputs(): array
    {
        return [
            'list' => [['confidentiel']],
            'nested list' => [[['confidentiel']]],
            'operator object' => [['$ne' => null]],
            'boolean' => [true],
            'integer' => [123],
            'float' => [1.5],
            '101 characters' => [str_repeat('a', 101)],
            '101 unicode characters' => [str_repeat('é', 101)],
            'large input' => [str_repeat('a', 10000)],
            'embedded null' => ["Couple\0Secret"],
            'embedded newline' => ["Couple\nSecret"],
            'control character' => ["Couple\x1BSecret"],
        ];
    }

    public function test_invalid_utf8_in_a_query_is_rejected_with_422(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche').'?q=%FF%FE')
            ->assertUnprocessable()->assertJsonValidationErrors('q');
    }

    public function test_a_trimmed_leading_null_does_not_broaden_search_results(): void
    {
        $records = $this->searchRecords();
        $otherCouple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'AutreDossier', 'partner2_first_name' => 'AutrePartenaire',
        ]);
        Wedding::factory()->for($otherCouple)->create();

        $response = $this->actingAs($records['admin'])
            ->getJson(route('recherche', ['q' => "\0CoupleSecret"]))
            ->assertOk()->assertJsonCount(4, 'results');

        $this->assertNotContains('conversation-'.$otherCouple->id, array_column($response->json('results'), 'id'));
    }

    #[DataProvider('validBoundaryInputs')]
    public function test_valid_boundary_inputs_are_accepted(?string $input): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->json('GET', route('recherche'), ['q' => $input])
            ->assertOk()->assertExactJson(['results' => []]);
    }

    /**
     * @return array<string, array{string|null}>
     */
    public static function validBoundaryInputs(): array
    {
        return ['100 characters' => [str_repeat('a', 100)], 'null' => [null]];
    }

    #[DataProvider('adminPages')]
    public function test_couples_cannot_open_admin_pages_even_with_direct_or_inertia_requests(string $name, string $mode): void
    {
        $this->searchRecords();
        $attacker = Couple::factory()->withPortalAccess()->create();
        $headers = match ($mode) {
            'json' => ['Accept' => 'application/json'],
            'inertia' => ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'],
            default => [],
        };
        if ($mode === 'inertia') {
            $version = app(HandleInertiaRequests::class)->version(Request::create('/'));
            if ($version !== null) {
                $headers['X-Inertia-Version'] = $version;
            }
        }
        $parameters = $name === 'recherche' ? ['q' => 'CoupleSecret'] : [];

        $this->actingAs($attacker->user)->get(route($name, $parameters), $headers)
            ->assertForbidden()->assertDontSee('Contrat confidentiel audit');
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function adminPages(): array
    {
        $cases = [];
        foreach ([
            'dashboard', 'demandes', 'wedding', 'calendrier', 'admin.couples.index',
            'admin.documents.index', 'admin.messages.index', 'admin.reviews.index',
            'rentabilite.index', 'rentabilite.rapport', 'recherche',
        ] as $name) {
            foreach (['html', 'json', 'inertia'] as $mode) {
                $cases[$name.' '.$mode] = [$name, $mode];
            }
        }

        return $cases;
    }

    public function test_search_results_and_downloads_remain_forbidden_after_switching_from_admin_to_couple(): void
    {
        $records = $this->searchRecords();
        $results = $this->actingAs($records['admin'])
            ->getJson(route('recherche', ['q' => 'CoupleSecret']))
            ->assertOk()->json('results');
        $this->assertNotEmpty($results);
        $before = $this->databaseSnapshot();

        $this->actingAs($records['couple']->user)
            ->getJson(route('recherche', ['q' => 'CoupleSecret']))
            ->assertForbidden()->assertDontSee('CoupleSecret');
        foreach ($results as $result) {
            $this->getJson($result['url'])->assertForbidden();
        }
        $this->getJson(route('admin.documents.download', $records['document']))->assertForbidden();
        $this->getJson(route('admin.messages.voice', $records['message']))->assertForbidden();

        $this->assertSame($before, $this->databaseSnapshot());
    }

    public function test_forged_roles_user_ids_and_headers_cannot_grant_admin_search_access(): void
    {
        $records = $this->searchRecords();
        $before = $this->databaseSnapshot();

        $this->actingAs($records['couple']->user)
            ->getJson(route('recherche', [
                'q' => 'CoupleSecret', 'role' => 'admin', 'is_admin' => true,
                'user_id' => $records['admin']->id, 'couple_id' => $records['couple']->id,
            ]), ['X-Role' => 'admin', 'X-User-Id' => (string) $records['admin']->id])
            ->assertForbidden()->assertDontSee('CoupleSecret');

        $this->assertSame($before, $this->databaseSnapshot());
    }

    #[TestWith(['couple.home'])]
    #[TestWith(['couple.messages.index'])]
    #[TestWith(['couple.documents.index'])]
    #[TestWith(['couple.appointments.index'])]
    public function test_couple_pages_ignore_foreign_ids_and_do_not_expose_internal_admin_fields(string $name): void
    {
        $records = $this->searchRecords();
        $attacker = Couple::factory()->withPortalAccess()->create();
        Wedding::factory()->for($attacker)->create([
            'notes' => 'PRIVATE_ADMIN_NOTES', 'lead_source' => 'PRIVATE_ADMIN_SOURCE',
        ]);

        $response = $this->actingAs($attacker->user)->get(route($name, [
            'couple_id' => $records['couple']->id,
            'wedding_id' => $records['wedding']->id,
            'user_id' => $records['admin']->id,
            'role' => 'admin',
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.id', $attacker->user_id)
            ->where('auth.user.role', 'couple')
            ->missing('auth.user.couple')
            ->missing('auth.user.password')
            ->missing('auth.user.remember_token'));

        $props = json_encode($response->viewData('page')['props'], JSON_THROW_ON_ERROR);
        foreach ([
            'CoupleSecret', 'Contrat confidentiel audit', 'Contenu confidentiel',
            'Rendez-vous confidentiel audit', 'PRIVATE_ADMIN_NOTES', 'PRIVATE_ADMIN_SOURCE',
        ] as $secret) {
            $this->assertStringNotContainsString($secret, $props);
        }
    }

    public function test_a_couple_cannot_download_another_couples_voice_note(): void
    {
        Storage::fake();
        $records = $this->searchRecords();
        $records['message']->update(['voice_note_path' => 'voice-notes/private.webm']);
        Storage::put('voice-notes/private.webm', 'private audio');
        $attacker = Couple::factory()->withPortalAccess()->create();

        $this->actingAs($attacker->user)
            ->get(route('couple.messages.voice', $records['message']))
            ->assertForbidden();

        Storage::assertExists('voice-notes/private.webm');
        $this->assertNull($records['message']->fresh()->read_at);
    }

    public function test_guests_cannot_retrieve_results_in_browser_or_json_mode(): void
    {
        $this->searchRecords();

        $this->get(route('recherche', ['q' => 'CoupleSecret']))
            ->assertRedirect(route('login'))->assertDontSee('CoupleSecret');
        $this->getJson(route('recherche', ['q' => 'CoupleSecret']))
            ->assertUnauthorized()->assertDontSee('CoupleSecret');
    }

    #[TestWith(['POST'])]
    #[TestWith(['PUT'])]
    #[TestWith(['PATCH'])]
    #[TestWith(['DELETE'])]
    public function test_search_does_not_accept_write_methods(string $method): void
    {
        $records = $this->searchRecords();
        $before = $this->databaseSnapshot();

        $this->actingAs($records['admin'])
            ->json($method, route('recherche'), ['q' => "'; DELETE FROM users;--", 'role' => 'admin'])
            ->assertMethodNotAllowed();

        $this->assertSame($before, $this->databaseSnapshot());
    }

    public function test_search_rate_limiting_is_enforced_per_account(): void
    {
        $this->freezeTime();
        $this->actingAs(User::factory()->admin()->create());
        for ($index = 0; $index < 60; $index++) {
            $this->getJson(route('recherche', ['q' => 'zz']))->assertOk();
        }

        $this->getJson(route('recherche', ['q' => 'zz']))->assertTooManyRequests();
        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'zz']))->assertOk();
    }

    public function test_admin_search_exposes_only_result_fields_and_never_credentials_or_storage_paths(): void
    {
        $records = $this->searchRecords();
        $response = $this->actingAs($records['admin'])
            ->getJson(route('recherche', ['q' => 'CoupleSecret']))->assertOk();

        foreach ($response->json('results') as $result) {
            $this->assertSame(['id', 'label', 'description', 'type', 'icon', 'url'], array_keys($result));
        }
        $response->assertDontSee($records['admin']->password, false)
            ->assertDontSee($records['document']->file_path, false);
    }

    /**
     * @return array{admin: User, couple: Couple, wedding: Wedding, document: Document, message: Message}
     */
    private function searchRecords(): array
    {
        $admin = User::factory()->admin()->create();
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'CoupleSecret',
            'partner2_first_name' => 'AlexAudit',
            'email' => 'couple.audit@example.test',
        ]);
        $venue = Venue::factory()->create(['name' => 'Domaine audit']);
        $wedding = Wedding::factory()->for($couple)->for($venue)->create();
        $document = Document::factory()->for($wedding)->create(['title' => 'Contrat confidentiel audit']);
        $message = Message::factory()->for($wedding)->create([
            'body' => 'Contenu confidentiel de la conversation.', 'sender_id' => $couple->user_id,
        ]);
        Appointment::factory()->for($wedding)->create(['title' => 'Rendez-vous confidentiel audit']);
        CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Evenement confidentiel audit', 'event_date' => '2027-06-19',
        ]);

        return compact('admin', 'couple', 'wedding', 'document', 'message');
    }

    /**
     * @return array<string, string>
     */
    private function databaseSnapshot(): array
    {
        $snapshot = [];
        foreach (['users', 'couples', 'weddings', 'venues', 'documents', 'messages', 'appointments', 'calendar_events'] as $table) {
            $snapshot[$table] = DB::table($table)->orderBy('id')->get()->toJson();
        }

        return $snapshot;
    }
}
