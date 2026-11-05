<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Couple;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $couple = $request->user()->couple;

        return Inertia::render('Couple/Home', [
            'couple' => $couple?->only([
                'partner1_first_name',
                'partner2_first_name',
            ]),
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
            'starts_at' => $appointment->starts_at->toIso8601String(),
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
