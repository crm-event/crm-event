<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddDemandeNoteRequest;
use App\Http\Requests\ImportDemandesRequest;
use App\Http\Requests\StoreDemandeRequest;
use App\Http\Requests\UpdateDemandeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
            'importedIds' => $weddings->pluck('legacy_inquiry_id')->filter()->values(),
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

    public function import(ImportDemandesRequest $request): RedirectResponse
    {
        $services = DB::table('services')->get(['id', 'name']);
        DB::transaction(function () use ($request, $services): void {
            foreach ($request->validated('demandes') as $index => $legacy) {
                if (DB::table('weddings')->where('legacy_inquiry_id', $legacy['id'])->exists()) {
                    continue;
                }
                $names = preg_split('/\s*(?:&|\bet\b)\s*/iu', $legacy['nom'], 2);
                if (trim($names[0]) === '') {
                    throw ValidationException::withMessages(['demandes.'.$index.'.nom' => 'Le nom du premier partenaire est obligatoire.']);
                }
                $serviceIds = [];
                foreach ($legacy['prestations'] as $key) {
                    $serviceIds[] = $this->legacyServiceId($key, $services, $index);
                }
                $this->createDemande([
                    'partner1_first_name' => trim($names[0]),
                    'partner2_first_name' => isset($names[1]) ? trim($names[1]) : null,
                    'email' => $legacy['email'] ?? null,
                    'telephone' => $legacy['telephone'] ?? null,
                    'origine' => $legacy['origine'] ?? null,
                    'date' => $legacy['date'] ?? null,
                    'lieu' => $legacy['lieu'] ?? null,
                    'budget' => $legacy['budget'] ?? null,
                    'prestations' => array_values(array_unique($serviceIds)),
                    'notes' => implode("\n\n", $legacy['notes']),
                ], $legacy['statut'], $legacy['id'], $legacy['motifPerte'] ?? null);
            }
        });

        return to_route('demandes');
    }

    /**
     * @param array{partner1_first_name: string, partner1_last_name?: ?string, partner2_first_name?: ?string, partner2_last_name?: ?string, email?: ?string, telephone?: ?string, origine?: ?string, date?: ?string, lieu?: ?string, budget?: string|int|float|null, prestations: array<int, int|string>, notes?: ?string} $data
     */
    private function createDemande(array $data, string $stage = 'nouveau', ?string $legacyId = null, ?string $reason = null): int
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
            'status' => $this->weddingStatus($stage),
            'inquiry_stage' => $stage,
            'legacy_inquiry_id' => $legacyId,
            'wedding_date' => $data['date'] ?? null,
            'first_contact_at' => $legacyId === null ? now()->toDateString() : null,
            'lead_source' => $data['origine'] ?? null,
            'estimated_budget' => $data['budget'] ?? null,
            'cancellation_reason' => $stage === 'perdu' ? $reason : null,
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

    /**
     * @param Collection<int, object> $services
     */
    private function legacyServiceId(string $key, Collection $services, int $index): int
    {
        $matches = $services->filter(function (object $service) use ($key): bool {
            if ((string) $service->id === $key) {
                return true;
            }
            $name = Str::lower(Str::ascii($service->name));

            return match ($key) {
                'decoration' => str_contains($name, 'decoration'),
                'coordination' => str_contains($name, 'coordination'),
                'officiante' => str_contains($name, 'officiant') || str_contains($name, 'ceremonie'),
                'organisation' => str_contains($name, 'organisation'),
                default => false,
            };
        });
        if ($matches->count() !== 1) {
            throw ValidationException::withMessages([
                'demandes.'.$index.'.prestations' => 'Impossible de retrouver une prestation unique du catalogue pour « '.$key.' ». Aucun dossier de cet import n’a été ajouté.',
            ]);
        }

        return (int) $matches->first()->id;
    }
}
