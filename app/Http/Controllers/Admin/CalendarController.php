<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Support\CalendarSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(CalendarSchedule $calendar): Response
    {
        return Inertia::render('Calendrier', [
            'evenementsTous' => $calendar->events(),
            'importedIds' => $calendar->importedIds(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CalendarEvent::query()->create($request->validate($this->eventRules()));

        return to_route('calendrier');
    }

    public function update(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $calendarEvent->update($request->validate($this->eventRules()));

        return to_route('calendrier');
    }

    public function destroy(CalendarEvent $calendarEvent): RedirectResponse
    {
        $calendarEvent->delete();

        return to_route('calendrier');
    }

    public function import(Request $request): RedirectResponse
    {
        $rules = [
            'events' => ['required', 'array', 'max:500'],
            'events.*' => ['array:legacy_id,type,title,event_date,event_time,location,notes'],
            'events.*.legacy_id' => ['required', 'alpha_dash:ascii', 'max:100', 'distinct'],
        ];

        foreach ($this->eventRules() as $field => $fieldRules) {
            $rules['events.*.'.$field] = $fieldRules;
        }

        $events = $request->validate($rules)['events'];

        DB::transaction(function () use ($events): void {
            foreach ($events as $event) {
                CalendarEvent::withTrashed()->firstOrCreate(
                    ['legacy_id' => $event['legacy_id']],
                    Arr::except($event, ['legacy_id']),
                );
            }
        });

        return to_route('calendrier');
    }

    /**
     * @return array<string, list<string>>
     */
    private function eventRules(): array
    {
        return [
            'type' => ['required', 'in:jalon,jour-j,rdv,urgent,repetition,carte'],
            'title' => ['required', 'string', 'max:120'],
            'event_date' => ['required', 'date_format:Y-m-d'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:160'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
