<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccessRequest;
use App\Models\Couple;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

/**
 * Request for a client space, sent by a couple from the public site.
 */
class AccessRequestController extends Controller
{
    /**
     * Record the request as a client record without account and an inquiry
     * (see docs/bdd/README.md, D2 and D3), which Jessica accepts or refuses.
     *
     * The answer is always the same, so that the form does not tell whether an
     * e-mail address already has an account. Robots filling the hidden
     * `website` field get that answer too.
     */
    public function __invoke(StoreAccessRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        if (! $request->filled('website') && ! $this->isAlreadyKnown($request->validated('email'))) {
            DB::transaction(function () use ($request): void {
                $couple = Couple::query()->create([
                    ...$request->safe()->only(['partner1_first_name', 'partner2_first_name', 'email']),
                    // The language the visitor reads the site in (see SetLocale).
                    'preferred_language' => app()->getLocale(),
                ]);

                $couple->weddings()->create([
                    'status' => 'inquiry',
                    'wedding_date' => $request->validated('wedding_date'),
                    'first_contact_at' => today(),
                    'lead_source' => 'Site',
                ]);
            });
        }

        return to_route('access-request.create');
    }

    /**
     * Determine whether this address already has an account or a pending request.
     */
    private function isAlreadyKnown(string $email): bool
    {
        return User::query()->where('email', $email)->exists()
            || Couple::query()->awaitingAccess()->where('email', $email)->exists();
    }
}
