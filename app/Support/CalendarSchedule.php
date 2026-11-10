<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CalendarSchedule
{
    /**
     * @var Collection<int, object>|null
     */
    private ?Collection $records = null;

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function events(): Collection
    {
        return $this->records()->flatMap(function (object $record): array {
            if ($record->source === 'wedding') {
                return $this->weddingEvents($record);
            }

            if ($record->deleted_at !== null) {
                return [];
            }

            $isAppointment = $record->source === 'appointment';
            $startsAt = $isAppointment ? Carbon::parse($record->starts_at) : null;

            return [[
                'id' => ($isAppointment ? 'appointment-' : 'event-').$record->id,
                ...($isAppointment ? [] : ['editableId' => (int) $record->id]),
                'type' => $isAppointment ? 'rdv' : $record->event_type,
                'titre' => $record->title,
                'libelle' => $record->title,
                'couple' => $record->event_type === 'jour-j' ? $record->title : null,
                'date' => $startsAt?->toDateString() ?? $record->event_date,
                'heure' => $startsAt?->format('H:i') ?? ($record->event_time === null ? null : substr($record->event_time, 0, 5)),
                'lieu' => $record->location,
                'notes' => $record->notes,
            ]];
        })->sortBy('date')->values();
    }

    /**
     * @return Collection<int, string>
     */
    public function importedIds(): Collection
    {
        return $this->records()->where('source', 'event')
            ->pluck('legacy_id')->filter()->unique()->values();
    }

    /**
     * Read the schedule and import markers in one database round trip per request.
     *
     * @return Collection<int, object>
     */
    private function records(): Collection
    {
        if ($this->records !== null) {
            return $this->records;
        }

        $events = DB::table('calendar_events')
            ->where(function ($query): void {
                $query->whereNull('deleted_at')->orWhereNotNull('legacy_id');
            })
            ->selectRaw("'event' AS source, id, title, event_date, event_time,
                NULL AS starts_at, location, notes, type AS event_type,
                legacy_id, deleted_at, NULL AS wedding_status, NULL AS guest_count,
                NULL AS partner1, NULL AS partner2");

        $weddings = DB::table('weddings')
            ->join('couples', 'couples.id', '=', 'weddings.couple_id')
            ->leftJoin('venues', 'venues.id', '=', 'weddings.venue_id')
            ->whereNotNull('weddings.wedding_date')
            ->where('weddings.status', '!=', 'cancelled')
            ->selectRaw("'wedding' AS source, weddings.id, NULL AS title,
                weddings.wedding_date AS event_date, NULL AS event_time,
                NULL AS starts_at, venues.name AS location, NULL AS notes,
                NULL AS event_type, NULL AS legacy_id, NULL AS deleted_at,
                weddings.status AS wedding_status, weddings.guest_count,
                couples.partner1_first_name AS partner1, couples.partner2_first_name AS partner2");

        $appointments = DB::table('appointments')
            ->selectRaw("'appointment' AS source, id, title, NULL AS event_date,
                NULL AS event_time, starts_at, location, notes, NULL AS event_type,
                NULL AS legacy_id, NULL AS deleted_at, NULL AS wedding_status,
                NULL AS guest_count, NULL AS partner1, NULL AS partner2");

        return $this->records = $events->unionAll($weddings)->unionAll($appointments)->get();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function weddingEvents(object $record): array
    {
        $confirmed = in_array($record->wedding_status, ['booked', 'completed', 'closed'], true);
        $couple = implode(' et ', array_filter([$record->partner1, $record->partner2]));
        $weddingEvent = [
            'id' => 'wedding-'.$record->id,
            'type' => $confirmed ? 'jour-j' : 'carte',
            'statut' => $confirmed ? null : 'en-attente',
            'categorie' => $confirmed ? 'Mariage confirmé' : 'Date souhaitée',
            'titre' => $couple,
            'couple' => $couple,
            'date' => $record->event_date,
            'lieu' => $record->location,
            'invites' => $record->guest_count === null ? null : (int) $record->guest_count,
        ];

        if (! $confirmed) {
            return [$weddingEvent];
        }

        $date = Carbon::parse($record->event_date);
        $milestones = [];
        foreach ([6 => 'Point de préparation', 3 => 'Rendez-vous de préparation', 1 => 'Validation finale'] as $months => $label) {
            $milestones[] = [
                'id' => 'wedding-'.$record->id.'-m'.$months,
                'type' => 'jalon',
                'titre' => 'M-'.$months.' · '.$label,
                'couple' => $couple,
                'date' => $date->copy()->subMonthsNoOverflow($months)->toDateString(),
                'lieu' => $record->location,
            ];
        }

        return [$weddingEvent, ...$milestones];
    }
}
