<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddDemandeNoteRequest;
use App\Http\Requests\StoreDemandeRequest;
use App\Http\Requests\UpdateDemandeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DemandeController extends Controller
{
    public function index(): Response
    {
        $weddings = DB::table('weddings')
            ->join('couples', 'couples.id', '=', 'weddings.couple_id')
            ->leftJoin('venues', 'venues.id', '=', 'weddings.venue_id')
            ->orderByDesc('weddings.id')
            ->get([
                'weddings.*',
                'couples.partner1_first_name',
                'couples.partner1_last_name',
                'couples.partner2_first_name',
                'couples.partner2_last_name',
                'couples.user_id as portal_user_id',
                'couples.email',
                'couples.phone',
                'couples.city as couple_city',
                'couples.notes as couple_notes',
                'venues.name as venue_name',
                'venues.city as venue_city',
            ]);
        $soldServices = DB::table('wedding_services')
            ->join('services', 'services.id', '=', 'wedding_services.service_id')
            ->get(['wedding_services.*', 'services.name as service_name'])
            ->groupBy('wedding_id');
        $proposals = DB::table('proposals')->orderByDesc('version')
            ->get(['id', 'wedding_id', 'title', 'type', 'version'])->groupBy('wedding_id');
        $services = DB::table('services')->orderBy('name')->get(['id', 'name', 'is_active']);

        $demandes = $weddings->map(function (object $wedding) use ($soldServices, $proposals): array {
            $names = array_filter([
                trim($wedding->partner1_first_name.' '.$wedding->partner1_last_name),
                trim($wedding->partner2_first_name.' '.$wedding->partner2_last_name),
            ]);
            $sold = $soldServices->get($wedding->id, collect());
            $firstContact = $wedding->first_contact_at ?? $wedding->created_at;

            return [
                'id' => (string) $wedding->id,
                'nom' => implode(' & ', $names),
                'reference' => 'D-'.$wedding->id,
                'date' => $wedding->wedding_date,
                'lieu' => $wedding->venue_name,
                'region' => $wedding->venue_city ?? $wedding->couple_city,
                'budget' => $wedding->estimated_budget,
                'prestations' => $sold->pluck('service_id')->map(fn ($id): string => (string) $id)->unique()->values(),
                'statut' => $this->stage($wedding),
                'motifPerte' => $wedding->cancellation_reason,
                'email' => $wedding->email,
                'telephone' => $wedding->phone,
                'origine' => $wedding->lead_source,
                'portailActif' => $wedding->portal_user_id !== null,
                'notes' => array_values(array_filter([$wedding->couple_notes, $wedding->notes])),
                'historique' => $firstContact === null ? [] : [[
                    'titre' => $wedding->first_contact_at !== null ? 'Premier contact' : 'Dossier enregistré',
                    'date' => substr($firstContact, 0, 10),
                    'detail' => $wedding->lead_source ?? '',
                ]],
                'devis' => $sold->filter(fn (object $service): bool => $service->quote_number !== null || $service->amount !== null || $service->quote_sent_at !== null)
                    ->map(fn (object $service): array => [
                        'id' => $service->id,
                        'numero' => $service->quote_number,
                        'prestation' => $service->service_name,
                        'montant' => $service->amount,
                        'envoyeLe' => $service->quote_sent_at,
                    ])->values(),
                'propositions' => $proposals->get($wedding->id, collect()),
            ];
        });
        $active = $demandes->reject(fn (array $demande): bool => in_array($demande['statut'], ['signe', 'perdu'], true));

        return Inertia::render('Demandes', [
            'demandes' => $demandes,
            'prestations' => $services->map(fn (object $service): array => [
                'cle' => (string) $service->id,
                'libelle' => $service->name,
                'active' => (bool) $service->is_active,
            ]),
            'lieux' => DB::table('venues')->distinct()->orderBy('name')->pluck('name'),
            'nouvelleDemandeId' => session('created_demande_id'),
            'statistiques' => [
                'actives' => $active->count(),
                'volume_centimes' => $active->sum(fn (array $demande): int => $this->cents($demande['budget'])),
                'taux_signature' => $demandes->isEmpty() ? 0 : (int) round(100 * $demandes->where('statut', 'signe')->count() / $demandes->count()),
            ],
        ]);
    }

    public function store(StoreDemandeRequest $request): RedirectResponse
    {
        $id = DB::transaction(fn (): int => $this->createDemande($request->validated()));

        return to_route('demandes')->with('created_demande_id', (string) $id);
    }

    public function update(UpdateDemandeRequest $request, int $demande): RedirectResponse
    {
        $data = $request->validated();
        DB::transaction(function () use ($demande, $data): void {
            $wedding = DB::table('weddings')->where('id', $demande)->lockForUpdate()->first();
            abort_if($wedding === null, 404);
            $status = $this->weddingStatus($data['statut']);
            if ($data['statut'] === 'signe' && in_array($wedding->status, ['completed', 'closed'], true)) {
                $status = $wedding->status;
            }
            DB::table('weddings')->where('id', $demande)->update([
                'inquiry_stage' => $data['statut'],
                'status' => $status,
                'cancellation_reason' => $data['statut'] === 'perdu' ? $data['motifPerte'] : null,
                'updated_at' => now(),
            ]);
        });

        return to_route('demandes');
    }

    public function addNote(AddDemandeNoteRequest $request, int $demande): RedirectResponse
    {
        DB::transaction(function () use ($request, $demande): void {
            $wedding = DB::table('weddings')->where('id', $demande)->lockForUpdate()->first();
            abort_if($wedding === null, 404);
            $note = now()->format('Y-m-d H:i').' · '.$request->validated('note');
            $notes = trim(($wedding->notes ?? '')."\n\n".$note);
            $this->validateNoteLength($notes);
            DB::table('weddings')->where('id', $demande)->update(['notes' => $notes, 'updated_at' => now()]);
        });

        return to_route('demandes');
    }

    /**
     * @param  array{partner1_first_name: string, partner1_last_name?: ?string, partner2_first_name?: ?string, partner2_last_name?: ?string, email?: ?string, telephone?: ?string, origine?: ?string, date?: ?string, lieu?: ?string, budget?: string|int|float|null, prestations: array<int, int|string>, notes?: ?string}  $data
     */
    private function createDemande(array $data): int
    {
        $notes = $data['notes'] ?? null;
        $this->validateNoteLength($notes ?? '');
        $venueId = null;
        if (! empty($data['lieu'])) {
            $venueId = DB::table('venues')->where('name', $data['lieu'])->value('id');
            $venueId ??= DB::table('venues')->insertGetId(['name' => $data['lieu'], 'created_at' => now(), 'updated_at' => now()]);
        }
        $coupleId = DB::table('couples')->insertGetId([
            'partner1_first_name' => $data['partner1_first_name'],
            'partner1_last_name' => $data['partner1_last_name'] ?? null,
            'partner2_first_name' => $data['partner2_first_name'] ?? null,
            'partner2_last_name' => $data['partner2_last_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['telephone'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $id = DB::table('weddings')->insertGetId([
            'couple_id' => $coupleId,
            'venue_id' => $venueId,
            'status' => $this->weddingStatus('nouveau'),
            'inquiry_stage' => 'nouveau',
            'wedding_date' => $data['date'] ?? null,
            'first_contact_at' => now()->toDateString(),
            'lead_source' => $data['origine'] ?? null,
            'estimated_budget' => $data['budget'] ?? null,
            'cancellation_reason' => null,
            'notes' => $notes,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        foreach ($data['prestations'] as $serviceId) {
            DB::table('wedding_services')->insert([
                'wedding_id' => $id,
                'service_id' => $serviceId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $id;
    }

    private function stage(object $wedding): string
    {
        return match ($wedding->status) {
            'booked', 'completed', 'closed' => 'signe',
            'cancelled' => 'perdu',
            'quote_sent' => ($wedding->inquiry_stage ?? null) === 'relance' ? 'relance' : 'devis',
            default => ($wedding->inquiry_stage ?? null) === 'qualifie' ? 'qualifie' : 'nouveau',
        };
    }

    private function weddingStatus(string $stage): string
    {
        return match ($stage) {
            'devis', 'relance' => 'quote_sent',
            'signe' => 'booked',
            'perdu' => 'cancelled',
            default => 'inquiry',
        };
    }

    private function validateNoteLength(string $notes): void
    {
        if (strlen($notes) > 60000) {
            throw ValidationException::withMessages(['note' => 'Le journal est trop volumineux pour ajouter ces notes.']);
        }
    }

    private function cents(string|int|float|null $value): int
    {
        $text = (string) ($value ?? 0);
        [$whole, $fraction] = array_pad(explode('.', ltrim($text, '+-'), 2), 2, '');
        $cents = (int) $whole * 100 + (int) str_pad(substr($fraction, 0, 2), 2, '0');

        return str_starts_with($text, '-') ? -$cents : $cents;
    }
}
