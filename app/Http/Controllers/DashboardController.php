<?php

namespace App\Http\Controllers;

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

    public function __invoke(Request $request): Response
    {
        $data = $request->validate(['mois' => ['nullable', 'date_format:Y-m']]);
        $today = now()->toImmutable()->startOfDay();
        $month = isset($data['mois'])
            ? CarbonImmutable::createFromFormat('!Y-m', $data['mois'], $today->getTimezone())
            : $today->startOfMonth();

        return Inertia::render('Dashboard', [
            'aujourdhui' => $today->toDateString(),
            'annee' => $today->year,
            'finances' => fn (): array => $this->finances($today),
            'suivi' => fn (): array => $this->followUp($today),
            'planning' => fn (): array => $this->planning($month),
            'activites' => fn (): Collection => $this->activity($today),
        ]);
    }

    /** @return array{encaisse: int, reste: int, moyenne: ?int, seuil: ?int, seuilMajore: ?int, mois: list<array{encaisse: int, signe: int, previsionnel: int}>} */
    private function finances(CarbonImmutable $today): array
    {
        $start = $today->startOfYear()->toDateString();
        $end = $today->endOfYear()->toDateString();

        $paid = $this->payments()->whereBetween('paid_at', [$start, $today->toDateString()])
            ->get(['payments.amount', 'paid_at', 'weddings.id as wedding_id']);
        $pending = $this->payments()->whereNull('paid_at')
            ->whereIn('weddings.status', self::CONFIRMED)
            ->whereBetween('due_date', [$start, $end])->get(['payments.amount', 'due_date']);
        $estimates = DB::table('weddings')->whereIn('status', ['inquiry', 'quote_sent'])
            ->whereBetween('wedding_date', [$start, $end])
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
    private function followUp(CarbonImmutable $today): array
    {
        $date = $today->toDateString();
        $end = $today->addDays(7)->toDateString();
        $tasks = $this->tasks()->where('due_date', '<=', $end)->orderBy('due_date')->orderBy('tasks.id')->limit(4)
            ->get(['tasks.id', 'title', 'due_date'])
            ->map(fn (object $row): array => $this->event('tache', $row->id, 'jalon', $row->due_date, $row->title));
        $appointments = $this->appointments()->where('starts_at', '>=', $date)
            ->where('starts_at', '<', $today->addDays(8)->toDateString())
            ->orderBy('starts_at')->orderBy('appointments.id')->limit(4)
            ->get(['appointments.id', 'title', 'starts_at', 'location'])
            ->map(fn (object $row): array => $this->event('rdv', $row->id, 'rdv', substr($row->starts_at, 0, 10), $row->title, $row->location));
        $payments = $this->payments()->whereNull('paid_at')->where('weddings.status', '!=', 'cancelled')
            ->where('due_date', '<=', $end)->orderBy('due_date')->orderBy('payments.id')->limit(4)
            ->get(['payments.id', 'due_date', 'invoice_number', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $row): array => $this->event(
                'paiement', $row->id, 'paiement', $row->due_date,
                $row->invoice_number ? 'Facture '.$row->invoice_number : 'Paiement à recevoir', $this->couple($row),
            ));
        $nextTask = $this->tasks()->where('due_date', '>=', $date)->orderBy('due_date')->orderBy('tasks.id')
            ->first(['tasks.id', 'title', 'due_date']);
        $nextManual = $this->calendarEvents()?->where('type', 'jalon')->where('event_date', '>=', $date)
            ->orderBy('event_date')->orderBy('id')->first(['id', 'title', 'event_date', 'location']);
        $milestones = collect();
        if ($nextTask !== null) {
            $milestones->push($this->event('tache', $nextTask->id, 'jalon', $nextTask->due_date, $nextTask->title));
        }
        if ($nextManual !== null) {
            $milestones->push($this->event('calendrier', $nextManual->id, 'jalon', $nextManual->event_date, $nextManual->title, $nextManual->location));
        }

        return [
            'mariages' => DB::table('weddings')->where('status', 'booked')->count(),
            'demandes' => DB::table('weddings')->whereIn('status', ['inquiry', 'quote_sent'])->count(),
            'prochainJalon' => $milestones->sortBy('date')->first(),
            'rappels' => $tasks->concat($appointments)->concat($payments)->sortBy('date')->take(4)->values(),
        ];
    }

    private function activity(CarbonImmutable $today): Collection
    {
        $contacts = $this->weddings()->where('first_contact_at', '<=', $today->toDateString())
            ->orderByDesc('first_contact_at')->orderByDesc('weddings.id')->limit(4)
            ->get(['weddings.id', 'first_contact_at', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $row): array => $this->event('contact', $row->id, 'person_add', $row->first_contact_at, 'Premier contact', $this->couple($row)));
        $receipts = $this->payments()->where('paid_at', '<=', $today->toDateString())
            ->orderByDesc('paid_at')->orderByDesc('payments.id')->limit(4)
            ->get(['payments.id', 'paid_at', 'payments.amount', 'couples.partner1_first_name', 'couples.partner2_first_name'])
            ->map(fn (object $row): array => [
                ...$this->event('encaissement', $row->id, 'euro', $row->paid_at, 'Paiement encaissé', $this->couple($row)),
                'montant' => $this->cents($row->amount),
            ]);
        $proposals = DB::table('proposals')->where('approved_at', '<', $today->addDay()->toDateString())
            ->orderByDesc('approved_at')->orderByDesc('id')->limit(4)->get(['id', 'approved_at', 'title'])
            ->map(fn (object $row): array => $this->event('proposition', $row->id, 'palette', substr($row->approved_at, 0, 10), 'Proposition validée', $row->title));

        return $contacts->concat($receipts)->concat($proposals)->sortByDesc('date')->take(4)->values();
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
        return ['id' => $source.'-'.$id, 'type' => $type, 'date' => $date, 'libelle' => $label, 'lieu' => $place];
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
