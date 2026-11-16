<?php

namespace Tests\Feature\Admin;

use App\Models\Appointment;
use App\Models\CalendarEvent;
use App\Models\Couple;
use App\Models\Document;
use App\Models\Message;
use App\Models\User;
use App\Models\Venue;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class SearchControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_and_couples_cannot_search_admin_data(): void
    {
        $this->getJson(route('recherche', ['q' => 'Camille']))->assertUnauthorized();

        $this->actingAs(User::factory()->create())
            ->getJson(route('recherche', ['q' => 'Camille']))
            ->assertForbidden();
    }

    public function test_the_search_returns_real_records_with_links_to_the_matching_pages(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Camille', 'partner2_first_name' => 'Alex',
        ]);
        $wedding = Wedding::factory()->for($couple)->create(['wedding_date' => '2027-06-19']);
        $document = Document::factory()->for($wedding)->create(['title' => 'Contrat Camille']);
        $event = CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Validation Camille', 'event_date' => '2027-05-19',
        ]);
        $appointment = Appointment::factory()->for($wedding)->create([
            'title' => 'Premier rendez-vous', 'starts_at' => '2027-04-19 10:00:00',
        ]);

        $response = $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'Camille']))
            ->assertOk()
            ->assertJsonCount(5, 'results')
            ->assertJsonFragment([
                'id' => 'wedding-'.$wedding->id,
                'label' => 'Camille & Alex',
                'url' => route('demandes', ['demande' => $wedding->id]),
            ])
            ->assertJsonFragment([
                'id' => 'document-'.$document->id,
                'url' => route('admin.documents.index', ['couple_id' => $couple->id]).'#document-'.$document->id,
            ])
            ->assertJsonFragment([
                'id' => 'event-'.$event->id,
                'url' => route('calendrier', ['date' => '2027-05-19', 'event' => 'event-'.$event->id]),
            ])
            ->assertJsonFragment([
                'id' => 'appointment-'.$appointment->id,
                'url' => route('calendrier', ['date' => '2027-04-19', 'event' => 'appointment-'.$appointment->id]),
            ])
            ->assertJsonFragment([
                'id' => 'conversation-'.$couple->id,
                'url' => route('admin.messages.show', $couple->id),
            ]);

        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->withoutVite();
        $this->get(route('demandes', ['demande' => $wedding->id]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Demandes')->has('demandes', 1));
        $this->get(route('admin.documents.index', ['couple_id' => $couple->id]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('selectedCouple.id', $couple->id)->has('documents', 1));
        $this->get(route('calendrier', ['event' => 'event-'.$event->id]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Calendrier'));
    }

    public function test_new_messages_are_searchable_immediately_without_marking_them_read(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'GuirlandesTerrasse']))
            ->assertOk()->assertExactJson(['results' => []]);

        $message = Message::factory()->for($wedding)->create(['body' => 'Installer les GuirlandesTerrasse.']);

        $this->getJson(route('recherche', ['q' => 'guirlandesterrasse']))
            ->assertOk()->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.id', 'conversation-'.$couple->id)
            ->assertJsonPath('results.0.url', route('admin.messages.show', $couple->id));

        $this->assertNull($message->fresh()->read_at);
    }

    public function test_a_conversation_can_match_names_and_messages_across_weddings_without_duplicates(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Camille', 'partner2_first_name' => 'Alex',
        ]);
        $oldWedding = Wedding::factory()->for($couple)->create();
        $newWedding = Wedding::factory()->for($couple)->create();
        Message::factory()->for($oldWedding)->count(2)->create(['body' => 'Installer les guirlandes.']);
        Message::factory()->for($newWedding)->create(['body' => 'La terrasse est disponible.']);
        $otherCouple = Couple::factory()->withPortalAccess()->create(['partner1_first_name' => 'Camille']);
        Message::factory()->for(Wedding::factory()->for($otherCouple))->create(['body' => 'Installer les guirlandes.']);

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'Camille guirlandes terrasse']))
            ->assertOk()->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.id', 'conversation-'.$couple->id);
    }

    public function test_message_matches_do_not_include_closed_access_or_deleted_messages(): void
    {
        Message::factory()->create(['body' => 'MotIntrouvableConversation']);
        $couple = Couple::factory()->withPortalAccess()->create();
        $deleted = Message::factory()->for(Wedding::factory()->for($couple))->create([
            'body' => 'MotIntrouvableConversation',
        ]);
        $deleted->delete();

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'MotIntrouvableConversation']))
            ->assertOk()->assertExactJson(['results' => []]);
    }

    public function test_message_search_treats_wildcards_as_literal_characters(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();
        $wedding = Wedding::factory()->for($couple)->create();
        Message::factory()->for($wedding)->create(['body' => 'Remise 10%_test']);
        $otherCouple = Couple::factory()->withPortalAccess()->create();
        Message::factory()->for(Wedding::factory()->for($otherCouple))->create(['body' => 'Remise 100Xtest']);

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => '10%_']))
            ->assertOk()->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.id', 'conversation-'.$couple->id);
    }

    public function test_names_can_match_multiple_fields_case_insensitively(): void
    {
        $couple = Couple::factory()->create([
            'partner1_first_name' => 'Camille', 'partner1_last_name' => 'Durand',
            'partner2_first_name' => 'Alex', 'partner2_last_name' => 'Martin',
        ]);
        $wedding = Wedding::factory()->for($couple)->create();
        $this->actingAs(User::factory()->admin()->create());

        foreach (['  CAMILLE & martin  ', 'Camille et Alex'] as $search) {
            $this->getJson(route('recherche', ['q' => $search]))
                ->assertOk()->assertJsonCount(1, 'results')
                ->assertJsonPath('results.0.id', 'wedding-'.$wedding->id);
        }

        $this->getJson(route('recherche', ['q' => 'Camille Inconnu']))
            ->assertExactJson(['results' => []]);
    }

    public function test_wedding_dates_and_venues_are_searchable(): void
    {
        $venue = Venue::factory()->create(['name' => 'Domaine des Oliviers']);
        $wedding = Wedding::factory()->for($venue)->create(['wedding_date' => '2029-08-23']);
        $this->actingAs(User::factory()->admin()->create());

        foreach (['2029-08-23', 'Oliviers'] as $search) {
            $this->getJson(route('recherche', ['q' => $search]))
                ->assertOk()->assertJsonPath('results.0.id', 'wedding-'.$wedding->id);
        }
    }

    #[TestWith([''])]
    #[TestWith([' '])]
    #[TestWith(['a'])]
    #[TestWith(['&&'])]
    #[TestWith(['AucunResultatPossible789'])]
    public function test_empty_short_and_unknown_queries_return_no_data(string $search): void
    {
        Wedding::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => $search]))
            ->assertOk()->assertExactJson(['results' => []]);
    }

    public function test_deleted_events_and_documents_without_an_accessible_space_are_excluded(): void
    {
        $event = CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'InvisibleRecherche', 'event_date' => '2027-05-19',
        ]);
        $event->delete();
        Document::factory()->create(['title' => 'InvisibleRecherche']);

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'InvisibleRecherche']))
            ->assertOk()->assertExactJson(['results' => []]);
    }

    public function test_each_category_is_limited_to_five_results(): void
    {
        $couple = Couple::factory()->create(['partner1_first_name' => 'LimiteRecherche']);
        Wedding::factory()->for($couple)->count(8)->create();
        for ($index = 0; $index < 8; $index++) {
            CalendarEvent::query()->create([
                'type' => 'jalon', 'title' => 'LimiteRecherche '.$index, 'event_date' => '2027-05-19',
            ]);
        }

        $response = $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => 'LimiteRecherche']))
            ->assertOk()->assertJsonCount(10, 'results');

        $results = collect($response->json('results'));
        $this->assertCount(5, $results->where('type', 'Dossier'));
        $this->assertCount(5, $results->where('type', 'Calendrier'));
    }

    public function test_sql_wildcards_and_injection_are_not_interpreted_as_sql(): void
    {
        CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Remise 10%_test', 'event_date' => '2027-05-19',
        ]);
        CalendarEvent::query()->create([
            'type' => 'jalon', 'title' => 'Remise 100Xtest', 'event_date' => '2027-05-19',
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => '10%_']))
            ->assertOk()->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.label', 'Remise 10%_test');

        $this->getJson(route('recherche', ['q' => "' OR 1=1 --"]))
            ->assertOk()->assertExactJson(['results' => []]);
    }

    #[TestWith([['bad', 'query']])]
    #[TestWith([101])]
    public function test_malformed_queries_return_a_validation_error(array|int $query): void
    {
        $search = is_int($query) ? str_repeat('a', $query) : $query;

        $this->actingAs(User::factory()->admin()->create())
            ->getJson(route('recherche', ['q' => $search]))
            ->assertUnprocessable()->assertJsonValidationErrors('q');
    }
}
