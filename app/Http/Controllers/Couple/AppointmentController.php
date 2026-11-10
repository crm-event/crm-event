<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * List the appointments of the logged-in couple, split into upcoming and
     * past ones. Read-only: appointments are created by Jessica only.
     */
    public function index(Request $request): Response
    {
        $couple = $request->user()->couple;

        $appointments = $couple === null
            ? collect()
            : Appointment::query()
                ->whereHas('wedding', fn ($query) => $query->where('couple_id', $couple->id))
                ->orderBy('starts_at')
                ->get();

        [$upcoming, $past] = $appointments->partition(
            fn (Appointment $appointment) => $appointment->starts_at->isFuture()
        );

        return Inertia::render('Couple/Appointments/Index', [
            'upcoming' => $upcoming->map($this->present(...))->values(),
            'past' => $past->reverse()->map($this->present(...))->values(),
        ]);
    }

    /**
     * Shape an appointment for the front end.
     *
     * The date is sent without time zone so the browser shows the same time
     * Jessica entered.
     *
     * @return array<string, mixed>
     */
    private function present(Appointment $appointment): array
    {
        $title = $appointment->title;

        if (app()->getLocale() === 'en') {
            $title = match ($title) {
                'Visite technique du lieu' => 'Venue technical visit',
                'Point design M-6' => 'Design review M-6',
                'Point design M-3' => 'Design review M-3',
                'Point design M-1' => 'Design review M-1',
                default => $title,
            };
        }

        return [
            'id' => $appointment->id,
            'title' => $title,
            'starts_at' => $appointment->starts_at->format('Y-m-d\TH:i:s'),
            'mode' => $appointment->mode?->value,
            'location' => $appointment->location,
            'notes' => $appointment->notes,
        ];
    }
}
