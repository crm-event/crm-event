<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Invitations sent by Jessica to the couples whose wedding is over, to ask
 * them for a review.
 */
class ReviewController extends Controller
{
    /**
     * Statuses of the weddings whose couple can be invited to leave a review.
     */
    private const INVITABLE_STATUSES = ['booked', 'completed', 'closed'];

    /**
     * Text of the message sent to the couple to invite them.
     */
    private const INVITATION_TEXT = 'Bonjour, nous espérons que votre mariage vous a laissé de beaux souvenirs. '
        .'Si vous le souhaitez, nous serions heureuses de recueillir votre avis, '
        .'depuis l’onglet « Votre avis » de votre espace. Merci !';

    /**
     * List the couples that can now be invited to leave a review, the couples
     * invited who have not answered yet and the reviews received.
     */
    public function index(): Response
    {
        $weddings = $this->awaitingReview()
            ->with('couple')
            ->orderBy('wedding_date')
            ->get();

        $requested = Review::query()
            ->whereNotNull('requested_at')
            ->with('wedding.couple')
            ->get();

        [$received, $pending] = $requested->partition(fn (Review $review) => $review->submitted_at !== null);

        return Inertia::render('Admin/Reviews/Index', [
            'delay_days' => Setting::reviewDelayDays(),
            'weddings' => $weddings->map(fn (Wedding $wedding) => [
                'id' => $wedding->id,
                'title' => $wedding->couple->threadTitle(),
                'wedding_date' => $wedding->wedding_date->toDateString(),
            ])->values(),
            'pending' => $pending->sortBy('requested_at')->map(fn (Review $review) => [
                'id' => $review->id,
                'title' => $review->wedding->couple->threadTitle(),
                'requested_at' => $review->requested_at->toIso8601String(),
            ])->values(),
            'received' => $received->sortByDesc('submitted_at')->map(fn (Review $review) => [
                'id' => $review->id,
                'title' => $review->wedding->couple->threadTitle(),
                'rating' => $review->rating,
                'would_recommend' => $review->would_recommend,
                'body' => $review->body,
                'submitted_at' => $review->submitted_at->toIso8601String(),
            ])->values(),
        ]);
    }

    /**
     * Invite the couple: a message is sent in their thread and the date is
     * recorded, so that the invitation is never sent twice.
     */
    public function store(Wedding $wedding): RedirectResponse
    {
        if (! $this->awaitingReview()->whereKey($wedding->id)->exists()) {
            return to_route('admin.reviews.index')
                ->with('error', 'Ce couple ne peut pas être sollicité (déjà invité, trop tôt ou mariage annulé).');
        }

        $wedding->review()->updateOrCreate([], ['requested_at' => now()]);

        $wedding->messages()->create([
            'sender_id' => auth()->id(),
            'body' => self::INVITATION_TEXT,
        ]);

        return to_route('admin.reviews.index')->with('success', 'Invitation envoyée au couple.');
    }

    /**
     * Booked or finished weddings that took place long enough ago and whose
     * couple has not been invited yet.
     *
     * @return Builder<Wedding>
     */
    private function awaitingReview(): Builder
    {
        return Wedding::query()
            ->whereIn('status', self::INVITABLE_STATUSES)
            ->whereDate('wedding_date', '<=', now()->subDays(Setting::reviewDelayDays()))
            ->whereHas('couple', fn (Builder $couple) => $couple->whereNotNull('user_id'))
            ->whereDoesntHave('review', fn (Builder $review) => $review->whereNotNull('requested_at'));
    }
}
