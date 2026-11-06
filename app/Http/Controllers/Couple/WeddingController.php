<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Models\Wedding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Notre mariage" tab: the key information about the wedding of the couple.
 */
class WeddingController extends Controller
{
    /**
     * Display the most recent wedding of the logged-in couple.
     */
    public function __invoke(Request $request): Response
    {
        $couple = $request->user()->couple;

        $wedding = $couple?->latestWedding()
            ->with([
                'venue',
                'services' => fn ($query) => $query->orderBy('wedding_services.id'),
            ])
            ->first();

        return Inertia::render('Couple/Wedding', [
            'coupleNames' => $couple?->threadTitle(),
            'wedding' => $wedding === null ? null : $this->toDetails($wedding),
        ]);
    }

    /**
     * Data of the wedding as shown to the couple. Internal fields (lead source,
     * notes, cancellation reason, budget, amounts of the services) are left
     * out.
     *
     * @return array{date: string|null, days_until: int|null, status: string, status_label: string, guest_count: int|null, venue: array{name: string, address: string|null, postal_code: string|null, city: string|null, access_notes: string|null}|null, services: list<string>}
     */
    private function toDetails(Wedding $wedding): array
    {
        return [
            'date' => $wedding->wedding_date?->toDateString(),
            'days_until' => $wedding->wedding_date === null
                ? null
                : (int) today()->diffInDays($wedding->wedding_date),
            'status' => $wedding->status,
            'status_label' => self::statusLabel($wedding->status),
            'guest_count' => $wedding->guest_count,
            'venue' => $wedding->venue === null ? null : $this->toVenue($wedding->venue),
            'services' => $wedding->services->pluck('name')->values()->all(),
        ];
    }

    /**
     * Address and access of the venue. The contact and conditions of the venue
     * are for Jessica only.
     *
     * @return array{name: string, address: string|null, postal_code: string|null, city: string|null, access_notes: string|null}
     */
    private function toVenue(Venue $venue): array
    {
        return $venue->only(['name', 'address', 'postal_code', 'city', 'access_notes']);
    }

    /**
     * Label of a wedding status, worded for the couple (see docs/bdd/README.md,
     * decision D5).
     */
    private static function statusLabel(string $status): string
    {
        return match ($status) {
            'inquiry' => 'Demande en cours',
            'quote_sent' => 'Devis envoyé',
            'booked' => 'Contrat signé',
            'completed' => 'Mariage célébré',
            'closed' => 'Projet clôturé',
            'cancelled' => 'Annulé',
            default => $status,
        };
    }
}
