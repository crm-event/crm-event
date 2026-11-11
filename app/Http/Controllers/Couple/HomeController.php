<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Couple;
use App\Models\Venue;
use App\Models\Wedding;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Notre mariage" tab, the page a couple lands on after logging in: the key
 * information about their wedding, then what comes next (appointment,
 * messages, documents).
 */
class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $couple = $request->user()->couple;

        $wedding = $couple?->latestWedding()
            ->with([
                'venue',
                'services' => fn ($query) => $query->orderBy('wedding_services.id'),
            ])
            ->first();

        return Inertia::render('Couple/Home', [
            'coupleNames' => $couple?->threadTitle(),
            'wedding' => $wedding === null ? null : $this->toDetails($wedding),
            'nextAppointment' => $this->nextAppointment($couple),
            'unreadMessages' => $couple?->messages()->unreadFor($request->user())->count() ?? 0,
            'documents' => [
                'total' => $couple?->documents()->count() ?? 0,
                'unseen' => $couple?->documents()->unseen()->count() ?? 0,
                'to_sign' => $couple?->documents()->pendingApproval()->count() ?? 0,
            ],
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
        $english = app()->getLocale() === 'en';

        return match ($status) {
            'inquiry' => $english ? 'Inquiry in progress' : 'Demande en cours',
            'quote_sent' => $english ? 'Quote sent' : 'Devis envoyé',
            'booked' => $english ? 'Contract signed' : 'Contrat signé',
            'completed' => $english ? 'Wedding celebrated' : 'Mariage célébré',
            'closed' => $english ? 'Project closed' : 'Projet clôturé',
            'cancelled' => $english ? 'Cancelled' : 'Annulé',
            default => $status,
        };
    }

    /**
     * The first appointment to come among all the weddings of the couple.
     *
     * @return array{title: string, starts_at: string, mode: string|null, location: string|null, starts_in: array{unit: string, value: int}}|null
     */
    private function nextAppointment(?Couple $couple): ?array
    {
        $appointment = $couple?->appointments()
            ->where('appointments.starts_at', '>', now())
            ->oldest('appointments.starts_at')
            ->first();

        if (! $appointment instanceof Appointment) {
            return null;
        }

        return [
            'title' => $appointment->title,
            // Wall-clock time, without time zone, as on the Appointments page:
            // the browser must not shift the hour Jessica has set.
            'starts_at' => $appointment->starts_at->format('Y-m-d\TH:i:s'),
            'mode' => $appointment->mode?->value,
            'location' => $appointment->location,
            'starts_in' => $this->timeUntil($appointment->starts_at),
        ];
    }

    /**
     * Time left before the given moment, in whole days, or in whole hours when
     * less than a day remains (`less_than_an_hour` under one hour).
     *
     * @return array{unit: 'days'|'hours'|'less_than_an_hour', value: int}
     */
    private function timeUntil(Carbon $moment): array
    {
        $days = (int) now()->diffInDays($moment);

        if ($days >= 1) {
            return ['unit' => 'days', 'value' => $days];
        }

        $hours = (int) now()->diffInHours($moment);

        if ($hours >= 1) {
            return ['unit' => 'hours', 'value' => $hours];
        }

        return ['unit' => 'less_than_an_hour', 'value' => 0];
    }
}
