<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchRequest;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function __invoke(SearchRequest $request): JsonResponse
    {
        $search = trim($request->validated('q') ?? '');
        $terms = preg_split('/(?:\s+et\s+|[\s&]+)/iu', $search, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (mb_strlen($search) < 2 || $terms === []) {
            return response()->json(['results' => []])->header('Cache-Control', 'private, no-store');
        }

        $names = [
            'couples.partner1_first_name', 'couples.partner1_last_name',
            'couples.partner2_first_name', 'couples.partner2_last_name', 'couples.email',
        ];

        $weddings = $this->matching(
            DB::table('weddings')
                ->join('couples', 'couples.id', '=', 'weddings.couple_id')
                ->leftJoin('venues', 'venues.id', '=', 'weddings.venue_id'),
            [...$names, 'weddings.wedding_date', 'venues.name', 'venues.city'],
            $terms,
        )->orderByDesc('weddings.id')->limit(5)
            ->get(['weddings.id', 'weddings.wedding_date', 'couples.partner1_first_name', 'couples.partner2_first_name', 'venues.name as venue'])
            ->map(fn (object $wedding): array => [
                'id' => 'wedding-'.$wedding->id,
                'label' => $this->coupleName($wedding),
                'description' => implode(' · ', array_filter(['D-'.$wedding->id, $wedding->wedding_date, $wedding->venue])),
                'type' => 'Dossier',
                'icon' => 'favorite',
                'url' => route('demandes', ['demande' => $wedding->id]),
            ]);

        $documents = $this->matching(
            DB::table('documents')
                ->join('weddings', 'weddings.id', '=', 'documents.wedding_id')
                ->join('couples', 'couples.id', '=', 'weddings.couple_id')
                ->whereNotNull('couples.user_id'),
            ['documents.title', ...$names],
            $terms,
        )->orderByDesc('documents.id')->limit(5)
            ->get(['documents.id', 'documents.title', 'couples.id as couple_id', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $document): array => [
                'id' => 'document-'.$document->id,
                'label' => $document->title,
                'description' => $this->coupleName($document),
                'type' => 'Document',
                'icon' => 'description',
                'url' => route('admin.documents.index', ['couple_id' => $document->couple_id]).'#document-'.$document->id,
            ]);

        $events = $this->matching(
            DB::table('calendar_events')->whereNull('deleted_at'),
            ['title', 'event_date', 'location'],
            $terms,
        )->orderBy('event_date')->orderBy('id')->limit(5)
            ->get(['id', 'title', 'event_date', 'location'])
            ->map(fn (object $event): array => [
                'id' => 'event-'.$event->id,
                'label' => $event->title,
                'description' => implode(' · ', array_filter([$event->event_date, $event->location])),
                'type' => 'Calendrier',
                'icon' => 'calendar_today',
                'url' => route('calendrier', ['date' => substr($event->event_date, 0, 10), 'event' => 'event-'.$event->id]),
            ]);

        $appointments = $this->matching(
            DB::table('appointments')
                ->join('weddings', 'weddings.id', '=', 'appointments.wedding_id')
                ->join('couples', 'couples.id', '=', 'weddings.couple_id'),
            ['appointments.title', 'appointments.starts_at', 'appointments.location', ...$names],
            $terms,
        )->orderBy('appointments.starts_at')->orderBy('appointments.id')->limit(5)
            ->get(['appointments.id', 'appointments.title', 'appointments.starts_at', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $appointment): array => [
                'id' => 'appointment-'.$appointment->id,
                'label' => $appointment->title,
                'description' => $this->coupleName($appointment).' · '.$appointment->starts_at,
                'type' => 'Rendez-vous',
                'icon' => 'event',
                'url' => route('calendrier', ['date' => substr($appointment->starts_at, 0, 10), 'event' => 'appointment-'.$appointment->id]),
            ]);

        $conversationQuery = DB::table('couples')->whereNotNull('user_id');

        foreach ($terms as $term) {
            $conversationQuery->where(function (Builder $matches) use ($names, $term): void {
                $this->matching($matches, $names, [$term]);

                $matches->orWhereExists(function (Builder $messages) use ($term): void {
                    $messages->selectRaw('1')
                        ->from('messages')
                        ->join('weddings', 'weddings.id', '=', 'messages.wedding_id')
                        ->whereColumn('weddings.couple_id', 'couples.id');

                    $this->matching($messages, ['messages.body'], [$term]);
                });
            });
        }

        $conversations = $conversationQuery->orderByDesc('id')->limit(5)
            ->get(['id', 'partner1_first_name', 'partner2_first_name', 'email'])
            ->map(fn (object $couple): array => [
                'id' => 'conversation-'.$couple->id,
                'label' => $this->coupleName($couple),
                'description' => $couple->email ?? '',
                'type' => 'Conversation',
                'icon' => 'chat',
                'url' => route('admin.messages.show', $couple->id),
            ]);

        return response()->json([
            'results' => $weddings->concat($documents)->concat($events)->concat($appointments)->concat($conversations)->values(),
        ])->header('Cache-Control', 'private, no-store');
    }

    /**
     * @param  list<string>  $columns
     * @param  list<string>  $terms
     */
    private function matching(Builder $query, array $columns, array $terms): Builder
    {
        foreach ($terms as $term) {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($term)).'%';

            $query->where(function (Builder $matches) use ($columns, $pattern): void {
                foreach ($columns as $column) {
                    $matches->orWhereRaw("LOWER({$column}) LIKE ? ESCAPE '!'", [$pattern]);
                }
            });
        }

        return $query;
    }

    private function coupleName(object $record): string
    {
        return implode(' & ', array_filter([$record->partner1_first_name, $record->partner2_first_name]));
    }
}
