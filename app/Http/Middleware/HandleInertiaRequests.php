<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Couple;
use App\Models\Proposal;
use App\Models\User;
use App\Support\StandardText;
use App\Support\WeddingDesign;
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
            'locale' => app()->getLocale(),
            'auth' => [
                'user' => $request->user(),
                'homeUrl' => $request->user()?->homeUrl(),
            ],
            'coupleNotifications' => fn (): array => $this->coupleNotifications($request->user()),
        ];
    }

    /**
     * What is waiting for a couple, shown in the bell of the couple space:
     * unread messages, new documents, documents to approve, an appointment
     * coming within two weeks and the design (ideas to share, proposals to
     * answer, Jessica's replies). Each one disappears once dealt with. The
     * texts follow the language of the visitor (lang/{fr,en}/couple.php).
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
                'title' => trans_choice('couple.notifications.messages_title', $unreadCount),
                'text' => __('couple.notifications.messages_text'),
                'date' => self::toIso($unreadMessages->max('messages.created_at')),
                'date_label' => __('couple.notifications.messages_date'),
                'route' => 'couple.messages.index',
            ];
        }

        // Design versions have their own notification below.
        $unseenDocuments = $couple->documents()->unseen()->where('documents.category', '!=', 'design');
        $unseenCount = (clone $unseenDocuments)->count();

        if ($unseenCount > 0) {
            $notifications[] = [
                'key' => 'documents',
                'icon' => 'description',
                'title' => trans_choice('couple.notifications.documents_title', $unseenCount),
                'text' => __('couple.notifications.documents_text'),
                'date' => self::toIso($unseenDocuments->max('documents.created_at')),
                'date_label' => __('couple.notifications.documents_date'),
                'route' => 'couple.documents.index',
            ];
        }

        $toApproveCount = $couple->documents()->pendingApproval()->count();

        if ($toApproveCount > 0) {
            $notifications[] = [
                'key' => 'approvals',
                'icon' => 'task_alt',
                'title' => trans_choice('couple.notifications.approvals_title', $toApproveCount),
                'text' => __('couple.notifications.approvals_text'),
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
                'title' => __('couple.notifications.appointment_title'),
                'text' => StandardText::translate($nextAppointment->title),
                // Wall-clock time, without time zone, as on the Appointments page.
                'date' => $nextAppointment->starts_at->format('Y-m-d\TH:i:s'),
                'date_label' => __('couple.notifications.appointment_date'),
                'route' => 'couple.appointments.index',
            ];
        }

        return [...$notifications, ...$this->designNotifications($couple)];
    }

    /**
     * What the design of the couple's wedding expects from them: sharing their
     * ideas while nothing exists yet, answering the new proposals, and reading
     * Jessica's replies to their remarks.
     *
     * @return list<array{key: string, icon: string, title: string, text: string, date: string|null, date_label: string, route: string}>
     */
    private function designNotifications(Couple $couple): array
    {
        $wedding = $couple->latestWedding;

        if ($wedding === null) {
            return [];
        }

        $proposals = WeddingDesign::proposalsOf($wedding);

        if ($proposals->isEmpty()) {
            $hasShared = $wedding->designBrief()->exists() || $wedding->mediaItems()->exists();

            return $hasShared ? [] : [[
                'key' => 'design_start',
                'icon' => 'palette',
                'title' => __('couple.notifications.design_start_title'),
                'text' => __('couple.notifications.design_start_text'),
                'date' => null,
                'date_label' => '',
                'route' => 'couple.design.index',
            ]];
        }

        $waiting = WeddingDesign::current($proposals)->filter(fn (Proposal $proposal) => $proposal->approved_at === null);
        $newProposals = $waiting->filter(fn (Proposal $proposal) => $proposal->comments->isEmpty());
        $replied = $waiting->filter(fn (Proposal $proposal) => $proposal->comments->isNotEmpty() && ! $proposal->comments->last()->isFromCouple());

        $notifications = [];

        if ($newProposals->isNotEmpty()) {
            $notifications[] = [
                'key' => 'design_proposals',
                'icon' => 'auto_awesome',
                'title' => trans_choice('couple.notifications.design_proposals_title', $newProposals->count()),
                'text' => __('couple.notifications.design_proposals_text'),
                'date' => $newProposals->max('created_at')->toIso8601String(),
                'date_label' => __('couple.notifications.design_proposals_date'),
                'route' => 'couple.design.index',
            ];
        }

        if ($replied->isNotEmpty()) {
            $notifications[] = [
                'key' => 'design_replies',
                'icon' => 'forum',
                'title' => __('couple.notifications.design_replies_title'),
                'text' => __('couple.notifications.design_replies_text'),
                'date' => $replied->map(fn (Proposal $proposal) => $proposal->comments->last()->created_at)->max()->toIso8601String(),
                'date_label' => __('couple.notifications.design_replies_date'),
                'route' => 'couple.design.index',
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
