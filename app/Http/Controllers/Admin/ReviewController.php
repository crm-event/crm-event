<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
     * List the couples that can now be invited to leave a review.
     */
    public function index(): Response
    {
        $weddings = $this->awaitingReview()
            ->with('couple')
            ->orderBy('wedding_date')
            ->get();

        return Inertia::render('Admin/Reviews/Index', [
            'weddings' => $weddings->map(fn (Wedding $wedding) => [
                'id' => $wedding->id,
                'title' => $wedding->couple->threadTitle(),
                'wedding_date' => $wedding->wedding_date->toDateString(),
            ])->values(),
        ]);
    }

    /**
     * Invite the couple: a message is sent in their thread and the date is
     * recorded, so that the invitation is never sent twice.
     */
    public function store(Wedding $wedding): RedirectResponse
    {
        abort_unless(
            $this->awaitingReview()->whereKey($wedding->id)->exists(),
            422,
            'Ce couple ne peut pas être sollicité (déjà invité, trop tôt ou mariage annulé).',
        );

        $wedding->review()->updateOrCreate([], ['requested_at' => now()]);

        $wedding->messages()->create([
            'sender_id' => auth()->id(),
            'body' => 'Bonjour, nous espérons que votre mariage vous a laissé de beaux souvenirs. '
                .'Si vous le souhaitez, nous serions heureuses de recueillir votre avis. Merci !',
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
            ->whereIn('status', ['booked', 'completed', 'closed'])
            ->whereDate('wedding_date', '<=', now()->subDays(Setting::reviewDelayDays()))
            ->whereDoesntHave('review', fn (Builder $review) => $review->whereNotNull('requested_at'));
    }
}
