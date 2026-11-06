<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCoupleAccountRequest;
use App\Models\Couple;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Client spaces opened by Jessica: she creates the account of a couple and
 * gives them a temporary code, which they replace at their first login.
 */
class CoupleController extends Controller
{
    /**
     * Display the couples who have a space and the form to open a new one.
     *
     * `temporaryCode` is only there right after a code has been generated: it
     * stays in the session for this one display, then only its hash remains,
     * so it cannot be displayed again.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Couples/Index', [
            'couples' => Couple::query()
                ->has('user')
                ->with(['user', 'latestWedding'])
                ->latest('id')
                ->get()
                ->map(fn (Couple $couple) => $this->toItem($couple)),
            'temporaryCode' => session('temporaryCode'),
        ]);
    }

    /**
     * Create the client record, the login account and the wedding of a couple.
     *
     * The wedding is needed for the space to be usable: documents and messages
     * are attached to it. A space is opened after the proposal has been sent,
     * hence the `quote_sent` status (see docs/bdd/README.md, D2 and D5).
     */
    public function store(StoreCoupleAccountRequest $request): RedirectResponse
    {
        [$couple, $code] = DB::transaction(function () use ($request): array {
            $couple = new Couple($request->safe()->except('wedding_date'));

            $user = new User(['name' => $couple->threadTitle(), 'email' => $couple->email]);
            $code = $user->assignTemporaryPassword();

            $couple->user()->associate($user)->save();
            $couple->weddings()->create([
                'status' => 'quote_sent',
                'wedding_date' => $request->validated('wedding_date'),
            ]);

            return [$couple, $code];
        });

        return $this->redirectWithCode($couple, $code);
    }

    /**
     * Replace a temporary code that has been lost. Once the couple has chosen
     * their password, only they can change it.
     */
    public function issueTemporaryCode(Couple $couple): RedirectResponse
    {
        abort_unless($couple->user?->must_change_password, 422, 'Ce couple a déjà choisi son mot de passe.');

        return $this->redirectWithCode($couple, $couple->user->assignTemporaryPassword());
    }

    /**
     * Go back to the list, displaying the code for this request only.
     */
    private function redirectWithCode(Couple $couple, string $code): RedirectResponse
    {
        return to_route('admin.couples.index')->with('temporaryCode', [
            'couple' => $couple->threadTitle(),
            'email' => $couple->user->email,
            'code' => $code,
        ]);
    }

    /**
     * Transform a couple for the list.
     *
     * @return array{id: int, names: string, email: string, wedding_date: string|null, is_waiting_first_login: bool}
     */
    private function toItem(Couple $couple): array
    {
        return [
            'id' => $couple->id,
            'names' => $couple->threadTitle(),
            'email' => $couple->user->email,
            'wedding_date' => $couple->latestWedding?->wedding_date?->toDateString(),
            'is_waiting_first_login' => $couple->user->must_change_password,
        ];
    }
}
