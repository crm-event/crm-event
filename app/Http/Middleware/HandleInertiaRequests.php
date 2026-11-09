<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'homeUrl' => $request->user()?->homeUrl(),
            ],
            'coupleNotifications' => fn (): array => $this->coupleNotifications($request->user()),
        ];
    }

    /**
     * What is waiting for a couple, shown in the bell of the couple space:
     * unread messages, new documents, documents to approve and an appointment
     * coming within two weeks. Each one disappears once dealt with.
     *
     * @return list<array{key: string, icon: string, title: string, text: string, date: string|null, date_label: string, route: string}>
     */
    private function coupleNotifications(?User $user): array
    {
        $couple = $user?->hasRole(UserRole::Couple) ? $user->couple : null;

        if ($couple === null) {
            return [];
        }

        $notifications = [];

        $unreadMessages = $couple->messages()->unreadFor($user)->reorder();
        $unreadCount = (clone $unreadMessages)->count();

        if ($unreadCount > 0) {
            $notifications[] = [
                'key' => 'messages',
                'icon' => 'chat_bubble',
                'title' => $unreadCount === 1 ? 'Nouveau message de Jessica' : "{$unreadCount} nouveaux messages de Jessica",
                'text' => 'Ouvrez vos messages pour les lire.',
                'date' => self::toIso($unreadMessages->max('messages.created_at')),
                'date_label' => 'Reçu le',
                'route' => 'couple.messages.index',
            ];
        }

        $unseenDocuments = $couple->documents()->unseen();
        $unseenCount = (clone $unseenDocuments)->count();

        if ($unseenCount > 0) {
            $notifications[] = [
                'key' => 'documents',
                'icon' => 'description',
                'title' => $unseenCount === 1 ? 'Un nouveau document' : "{$unseenCount} nouveaux documents",
                'text' => 'Jessica a partagé un document que vous n’avez pas encore ouvert.',
                'date' => self::toIso($unseenDocuments->max('documents.created_at')),
                'date_label' => 'Partagé le',
                'route' => 'couple.documents.index',
            ];
        }

        $toApproveCount = $couple->documents()->pendingApproval()->count();

        if ($toApproveCount > 0) {
            $notifications[] = [
                'key' => 'approvals',
                'icon' => 'task_alt',
                'title' => $toApproveCount === 1 ? 'Un document à approuver' : "{$toApproveCount} documents à approuver",
                'text' => 'Lisez-le, puis validez-le avec « Lu et approuvé ».',
                'date' => null,
                'date_label' => '',
                'route' => 'couple.documents.index',
            ];
        }

        $nextAppointment = $couple->appointments()
            ->whereBetween('appointments.starts_at', [now(), now()->addWeeks(2)])
            ->oldest('appointments.starts_at')
            ->first();

        if ($nextAppointment !== null) {
            $notifications[] = [
                'key' => 'appointment',
                'icon' => 'event',
                'title' => 'Rendez-vous à venir',
                'text' => $nextAppointment->title,
                // Wall-clock time, without time zone, as on the Appointments page.
                'date' => $nextAppointment->starts_at->format('Y-m-d\TH:i:s'),
                'date_label' => 'Prévu le',
                'route' => 'couple.appointments.index',
            ];
        }

        return $notifications;
    }

    /**
     * Convert a date read from an aggregate (a string) to ISO 8601.
     */
    private static function toIso(?string $date): ?string
    {
        return $date === null ? null : Carbon::parse($date)->toIso8601String();
    }
}
