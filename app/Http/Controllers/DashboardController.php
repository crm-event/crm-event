<?php

namespace App\Http\Controllers;

use App\Support\CalendarSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const CONFIRMED = ['booked', 'completed', 'closed'];

    public function __invoke(Request $request, CalendarSchedule $calendar): Response
    {
        $data = $request->validate(['mois' => ['nullable', 'date_format:Y-m']]);
        $now = now()->toImmutable();
        $today = $now->startOfDay();
        $month = isset($data['mois'])
            ? CarbonImmutable::createFromFormat('!Y-m', $data['mois'], $today->getTimezone())
            : $today->startOfMonth();

        return Inertia::render('Dashboard', [
            'aujourdhui' => $today->toDateString(),
            'annee' => $today->year,
            'finances' => fn (): array => $this->finances($today),
            'suivi' => fn (): array => $this->followUp($now, $calendar),
            'planning' => fn (): array => $this->planning($month),
            'evenementsTous' => fn (): Collection => $calendar->events(),
            'activites' => fn (): Collection => $this->activity($now),
        ]);
    }

    /** @return array{encaisse: int, reste: int, moyenne: ?int, seuil: ?int, seuilMajore: ?int, mois: list<array{encaisse: int, signe: int, previsionnel: int}>} */
    private function finances(CarbonImmutable $today): array
    {
        $start = $today->startOfYear()->toDateString();
        $end = $today->startOfYear()->addYear()->toDateString();

        $paid = $this->payments()->where('paid_at', '>=', $start)->where('paid_at', '<', $today->addDay()->toDateString())
            ->get(['payments.amount', 'paid_at', 'weddings.id as wedding_id']);
        $pending = $this->payments()->whereNull('paid_at')
            ->whereIn('weddings.status', self::CONFIRMED)
            ->where('due_date', '>=', $start)->where('due_date', '<', $end)->get(['payments.amount', 'due_date']);
        $estimates = DB::table('weddings')->whereIn('status', ['inquiry', 'quote_sent'])
            ->where('wedding_date', '>=', $start)->where('wedding_date', '<', $end)
            ->whereNotNull('estimated_budget')
            ->whereNotExists(function (Builder $query): void {
                $query->select('payments.id')->from('payments')
                    ->join('wedding_services', 'wedding_services.id', '=', 'payments.wedding_service_id')
                    ->whereColumn('wedding_services.wedding_id', 'weddings.id');
            })->get(['estimated_budget', 'wedding_date']);

        $months = array_fill(1, 12, ['encaisse' => 0, 'signe' => 0, 'previsionnel' => 0]);
        foreach ($paid as $payment) {
            $months[(int) substr($payment->paid_at, 5, 2)]['encaisse'] += $this->cents($payment->amount);
        }
        foreach ($pending as $payment) {
            $months[(int) substr($payment->due_date, 5, 2)]['signe'] += $this->cents($payment->amount);
        }
        foreach ($estimates as $wedding) {
            $months[(int) substr($wedding->wedding_date, 5, 2)]['previsionnel'] += $this->cents($wedding->estimated_budget);
        }

        $settings = DB::table('settings')->whereIn('key', ['vat_threshold', 'vat_threshold_immediate'])
            ->where('valid_from', '<=', $today->toDateString())
            ->orderByDesc('valid_from')->get(['key', 'value'])->unique('key')->pluck('value', 'key');
        $total = array_sum(array_column($months, 'encaisse'));
        $paidWeddings = $paid->pluck('wedding_id')->unique()->count();

        return [
            'encaisse' => $total,
            'reste' => array_sum(array_column($months, 'signe')),
            'moyenne' => $paidWeddings === 0 ? null : (int) round($total / $paidWeddings),
            'seuil' => $this->threshold($settings->get('vat_threshold')),
            'seuilMajore' => $this->threshold($settings->get('vat_threshold_immediate')),
            'mois' => array_values($months),
        ];
    }

    /** @return array{mois: string, precedent: string, suivant: string, evenements: Collection<int, array<string, mixed>>} */
    private function planning(CarbonImmutable $month): array
    {
        $start = $month->toDateString();
        $next = $month->addMonth();
        $end = $month->endOfMonth()->toDateString();

        $weddings = $this->weddings()->whereIn('weddings.status', self::CONFIRMED)
            ->whereBetween('wedding_date', [$start, $end])
            ->get(['weddings.id', 'wedding_date', 'couples.partner1_first_name', 'couples.partner2_first_name', 'venues.name as lieu'])
            ->map(fn (object $row): array => [
                'id' => 'mariage-'.$row->id,
                'type' => 'mariage',
                'date' => $row->wedding_date,
                'libelle' => $this->couple($row),
                'lieu' => $row->lieu,
            ]);
        $tasks = $this->tasks()->whereBetween('due_date', [$start, $end])->get(['tasks.id', 'title', 'due_date'])
            ->map(fn (object $row): array => $this->event('tache', $row->id, 'jalon', $row->due_date, $row->title));
        $appointments = $this->appointments()->where('starts_at', '>=', $start)->where('starts_at', '<', $next->toDateString())
            ->get(['appointments.id', 'title', 'starts_at', 'location'])
            ->map(fn (object $row): array => $this->event('rdv', $row->id, 'rdv', substr($row->starts_at, 0, 10), $row->title, $row->location));
        $manual = $this->calendarEvents()?->whereBetween('event_date', [$start, $end])
            ->get(['id', 'type', 'title', 'event_date', 'location'])
            ->map(fn (object $row): array => $this->event(
                'calendrier', $row->id, match ($row->type) {
                    'jour-j' => 'mariage',
                    'rdv' => 'rdv',
                    default => 'jalon',
                }, $row->event_date, $row->title, $row->location,
            )) ?? collect();

        return [
            'mois' => $month->format('Y-m'),
            'precedent' => $month->subMonth()->format('Y-m'),
            'suivant' => $next->format('Y-m'),
            'evenements' => $weddings->concat($tasks)->concat($appointments)->concat($manual)->sortBy('date')->values(),
        ];
    }

    /** @return array{mariages: int, demandes: int, prochainJalon: ?array<string, mixed>, rappels: Collection<int, array<string, mixed>>} */
    private function followUp(CarbonImmutable $now, CalendarSchedule $calendar): array
    {
        $today = $now->startOfDay();
        $date = $today->toDateString();
        $end = $today->addDays(7)->toDateString();
        $tasks = $this->tasks()->where('due_date', '<=', $end)->orderBy('due_date')->orderBy('tasks.id')->limit(4)
            ->get(['tasks.id', 'tasks.wedding_id', 'title', 'due_date'])
            ->map(fn (object $row): array => [
                ...$this->event('tache', $row->id, 'jalon', $row->due_date, $row->title),
                'url' => route('admin.wedding.show', $row->wedding_id),
            ]);
        $scheduled = $calendar->events()->filter(function (array $event) use ($date, $now): bool {
            if (! in_array($event['type'], ['jalon', 'rdv', 'jour-j'], true)) {
                return false;
            }
            if ($event['date'] < $date) {
                return $event['type'] === 'jalon' && isset($event['editableId']);
            }

            return $event['type'] !== 'rdv' || $event['date'] > $date
                || empty($event['heure']) || $event['heure'] >= $now->format('H:i');
        })->map(fn (array $event): array => [
            'id' => $event['id'],
            'type' => $event['type'],
            'date' => $event['date'],
            'heure' => $event['heure'] ?? null,
            'libelle' => $event['titre'],
            'lieu' => $event['couple'] ?? $event['lieu'] ?? null,
            'url' => route('calendrier', ['date' => $event['date'], 'event' => $event['id']]),
        ]);
        $payments = $this->payments()->whereNull('paid_at')->where('weddings.status', '!=', 'cancelled')
            ->where('due_date', '<=', $end)->orderBy('due_date')->orderBy('payments.id')->limit(4)
            ->get(['payments.id', 'due_date', 'invoice_number', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $row): array => [
                ...$this->event(
                    'paiement', $row->id, 'paiement', $row->due_date,
                    $row->invoice_number ? 'Facture '.$row->invoice_number : 'Paiement à recevoir', $this->couple($row),
                ),
                'url' => route('facturation.index'),
            ]);
        $nextTask = $this->tasks()->where('due_date', '>=', $date)->orderBy('due_date')->orderBy('tasks.id')
            ->first(['tasks.id', 'tasks.wedding_id', 'title', 'due_date']);
        $milestones = $scheduled->where('type', 'jalon')->where('date', '>=', $date)->values();
        if ($nextTask !== null) {
            $milestones->push([
                ...$this->event('tache', $nextTask->id, 'jalon', $nextTask->due_date, $nextTask->title),
                'url' => route('admin.wedding.show', $nextTask->wedding_id),
            ]);
        }

        return [
            'mariages' => DB::table('weddings')->where('status', 'booked')->count(),
            'demandes' => DB::table('weddings')->whereIn('status', ['inquiry', 'quote_sent'])->count(),
            'prochainJalon' => $milestones->sortBy('date')->first(),
            'rappels' => $tasks->concat($scheduled->where('date', '<=', $end))->concat($payments)
                ->sortBy(fn (array $event): string => $event['date'].' '.($event['heure'] ?? '00:00'))
                ->take(4)->values(),
        ];
    }

    private function activity(CarbonImmutable $now): Collection
    {
        $timestamp = $now->toDateTimeString();
        $contacts = $this->weddings()->whereRaw('COALESCE(weddings.created_at, weddings.first_contact_at) <= ?', [$timestamp])
            ->orderByRaw('COALESCE(weddings.created_at, weddings.first_contact_at) DESC')->orderByDesc('weddings.id')->limit(4)
            ->get(['weddings.id', 'weddings.status', 'couples.partner1_first_name', 'couples.partner2_first_name',
                DB::raw('COALESCE(weddings.created_at, weddings.first_contact_at) as occurred_at')])
            ->map(fn (object $row): array => $this->activityEvent(
                'contact', $row->id, 'person_add', $row->occurred_at,
                $row->status === 'inquiry' ? 'Nouvelle demande' : 'Nouveau dossier', $this->couple($row),
                route('admin.wedding.show', $row->id),
            ));
        $receipts = $this->payments()->where('paid_at', '<', $now->addDay()->startOfDay()->toDateString())
            ->orderByDesc('paid_at')->orderByDesc('payments.id')->limit(4)
            ->get(['payments.id', 'paid_at', 'payments.amount', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $row): array => [
                ...$this->activityEvent('encaissement', $row->id, 'euro', substr($row->paid_at, 0, 10), 'Paiement encaissé', $this->couple($row), route('facturation.index')),
                'montant' => $this->cents($row->amount),
            ]);
        $proposals = DB::table('proposals')->where('approved_at', '<=', $timestamp)
            ->orderByDesc('approved_at')->orderByDesc('id')->limit(4)->get(['id', 'wedding_id', 'approved_at', 'title'])
            ->map(fn (object $row): array => $this->activityEvent('proposition', $row->id, 'palette', $row->approved_at, 'Proposition validée', $row->title, route('admin.wedding.show', $row->wedding_id)));
        $messages = $this->weddings()->join('messages', 'messages.wedding_id', '=', 'weddings.id')
            ->leftJoin('users as senders', 'senders.id', '=', 'messages.sender_id')
            ->where('messages.created_at', '<=', $timestamp)
            ->orderByDesc('messages.created_at')->orderByDesc('messages.id')->limit(4)
            ->get(['messages.id', 'messages.created_at', 'senders.role', 'couples.id as couple_id', 'couples.user_id', 'weddings.id as wedding_id', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $row): array => $this->activityEvent(
                'message', $row->id, 'chat', $row->created_at,
                $row->role === 'admin' ? 'Message envoyé' : 'Message reçu', $this->couple($row),
                $row->user_id === null ? route('admin.wedding.show', $row->wedding_id) : route('admin.messages.show', $row->couple_id),
            ));
        $documents = $this->weddings()->join('documents', 'documents.wedding_id', '=', 'weddings.id')
            ->where('documents.created_at', '<=', $timestamp)
            ->orderByDesc('documents.created_at')->orderByDesc('documents.id')->limit(4)
            ->get(['documents.id', 'documents.created_at', 'documents.title', 'couples.id as couple_id', 'couples.user_id', 'weddings.id as wedding_id'])
            ->map(fn (object $row): array => $this->activityEvent(
                'document', $row->id, 'description', $row->created_at, 'Document ajouté', $row->title,
                $row->user_id === null ? route('admin.wedding.show', $row->wedding_id) : route('admin.documents.index', ['couple_id' => $row->couple_id]),
            ));
        $events = $this->calendarEvents()?->where('created_at', '<=', $timestamp)
            ->orderByDesc('created_at')->orderByDesc('id')->limit(4)->get(['id', 'created_at', 'title', 'event_date'])
            ->map(fn (object $row): array => $this->activityEvent(
                'calendrier', $row->id, 'calendar_today', $row->created_at, 'Événement ajouté', $row->title,
                route('calendrier', ['date' => substr($row->event_date, 0, 10), 'event' => 'event-'.$row->id]),
            )) ?? collect();

        return $contacts->concat($receipts)->concat($proposals)->concat($messages)->concat($documents)->concat($events)
            ->sortByDesc('dateHeure')->take(4)->values();
    }

    /** @return array<string, mixed> */
    private function activityEvent(string $source, int $id, string $type, string $date, string $label, ?string $place, string $url): array
    {
        return [
            ...$this->event($source, $id, $type, substr($date, 0, 10), $label, $place),
            'dateHeure' => strlen($date) === 10 ? $date.' 00:00:00' : $date,
            'heure' => strlen($date) > 10 ? substr($date, 11, 5) : null,
            'url' => $url,
        ];
    }

    private function weddings(): Builder
    {
        return DB::table('weddings')->join('couples', 'couples.id', '=', 'weddings.couple_id')
            ->leftJoin('venues', 'venues.id', '=', 'weddings.venue_id');
    }

    private function payments(): Builder
    {
        return $this->weddings()->join('wedding_services', 'wedding_services.wedding_id', '=', 'weddings.id')
            ->join('payments', 'payments.wedding_service_id', '=', 'wedding_services.id');
    }

    private function tasks(): Builder
    {
        return DB::table('tasks')->join('weddings', 'weddings.id', '=', 'tasks.wedding_id')
            ->where('weddings.status', '!=', 'cancelled')
            ->whereNull('tasks.deleted_at')->whereNull('completed_at')
            ->whereNotIn('tasks.status', ['done', 'completed', 'cancelled']);
    }

    private function appointments(): Builder
    {
        return DB::table('appointments')->join('weddings', 'weddings.id', '=', 'appointments.wedding_id')
            ->where('weddings.status', '!=', 'cancelled');
    }

    private function calendarEvents(): ?Builder
    {
        return Schema::hasTable('calendar_events')
            ? DB::table('calendar_events')->whereNull('deleted_at')
            : null;
    }

    /** @return array{id: string, type: string, date: string, libelle: string, lieu: ?string} */
    private function event(string $source, int $id, string $type, string $date, string $label, ?string $place = null): array
    {
        return ['id' => $source.'-'.$id, 'type' => $type, 'date' => substr($date, 0, 10), 'libelle' => $label, 'lieu' => $place];
    }

    private function couple(object $row): string
    {
        return implode(' & ', array_filter([$row->partner1_first_name, $row->partner2_first_name]));
    }

    private function threshold(?string $value): ?int
    {
        return is_numeric($value) && (float) $value > 0 ? $this->cents($value) : null;
    }

    private function cents(string|int|float $amount): int
    {
        return (int) round((float) $amount * 100);
    }
}
