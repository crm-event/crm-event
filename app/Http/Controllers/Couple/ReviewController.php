<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\Couple\StoreReviewRequest;
use App\Models\Couple;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Votre avis" tab: once Jessica has invited the couple (Admin\ReviewController),
 * they rate their experience. A review is given once and cannot be changed.
 */
class ReviewController extends Controller
{
    /**
     * Show the review form, or the review already given.
     */
    public function show(Request $request): Response
    {
        $review = $this->reviewOf($request->user()->couple);

        return Inertia::render('Couple/Review', [
            'review' => $review === null ? null : [
                'requested_at' => $review->requested_at->toIso8601String(),
                'submitted_at' => $review->submitted_at?->toIso8601String(),
                'rating' => $review->rating,
                'would_recommend' => $review->would_recommend,
                'body' => $review->body,
            ],
            'maxBodyLength' => StoreReviewRequest::MAX_BODY_LENGTH,
        ]);
    }

    /**
     * Save the review of the couple, only once and only after an invitation.
     */
    public function store(StoreReviewRequest $request): RedirectResponse
    {
        $review = $this->reviewOf($request->user()->couple);

        abort_unless($review?->isAwaitingAnswer() ?? false, 422, __('couple.review_not_open'));

        $review->update([
            ...$request->validated(),
            'submitted_at' => now(),
        ]);

        return to_route('couple.review.show');
    }

    /**
     * The review Jessica asked the couple for, about their latest wedding.
     */
    private function reviewOf(?Couple $couple): ?Review
    {
        return $couple?->latestWedding?->review()->whereNotNull('requested_at')->first();
    }
}
