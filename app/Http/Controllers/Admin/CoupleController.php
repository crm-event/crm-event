<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCoupleAccountRequest;
use App\Models\Couple;
use App\Models\User;
use App\Notifications\TemporaryAccessCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * Client spaces managed by Jessica: she accepts the requests sent from the
 * public site or opens a space herself. The couple receives a temporary code
 * by e-mail, which they replace at their first login.
 */
class CoupleController extends Controller
{
    /**
     * Display the pending requests, the couples who have a space and the form
     * to open a new one.
     *
     * `temporaryCode` is only there right after a code has been generated: it
     * stays in the session for this one display, then only its hash remains,
     * so it cannot be displayed again.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Couples/Index', [
            'accessRequests' => Couple::query()
                ->awaitingAccess()
                ->with('latestWedding')
                ->oldest('id')
                ->get()
                ->map(fn (Couple $couple) => [
                    'id' => $couple->id,
                    'names' => $couple->threadTitle(),
                    'email' => $couple->email,
                    'wedding_date' => $couple->latestWedding->wedding_date?->toDateString(),
                    'requested_at' => $couple->created_at->toIso8601String(),
                ]),
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
            $code = $this->openAccount($couple);

            $couple->weddings()->create([
                'status' => 'quote_sent',
                'wedding_date' => $request->validated('wedding_date'),
            ]);

            return [$couple, $code];
        });

        return $this->redirectWithCode($couple, $code);
    }

    /**
     * Accept a request sent from the public site.
     */
    public function accept(Couple $couple): RedirectResponse
    {
        $this->ensureIsAwaitingAccess($couple);

        // Jessica may have opened a space herself with this address in the meantime.
        if (User::query()->where('email', $couple->email)->exists()) {
            return back()->withErrors(['access_request' => "Un compte existe déjà avec l’adresse {$couple->email}."]);
        }

        $code = DB::transaction(function () use ($couple): string {
            $code = $this->openAccount($couple);
            $couple->latestWedding->update(['status' => 'quote_sent']);

            return $code;
        });

        return $this->redirectWithCode($couple, $code);
    }

    /**
     * Refuse a request. The record is kept, as for every lost inquiry (see
     * docs/bdd/README.md, D2), and the couple is not notified: Jessica chooses
     * how to answer them.
     */
    public function refuse(Couple $couple): RedirectResponse
    {
        $this->ensureIsAwaitingAccess($couple);

        $couple->latestWedding->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Accès refusé',
        ]);

        return to_route('admin.couples.index');
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
     * Create the login account of a couple, link it and return the temporary code.
     */
    private function openAccount(Couple $couple): string
    {
        $user = new User(['name' => $couple->threadTitle(), 'email' => $couple->email]);
        $code = $user->assignTemporaryPassword();

        $couple->user()->associate($user)->save();

        return $code;
    }

    /**
     * Ensure that the couple is still waiting for an answer.
     */
    private function ensureIsAwaitingAccess(Couple $couple): void
    {
        abort_unless(
            Couple::query()->awaitingAccess()->whereKey($couple->id)->exists(),
            422,
            'Cette demande a déjà été traitée.',
        );
    }

    /**
     * Send the code to the couple, then go back to the list, displaying it for
     * this request only. If the e-mail cannot be sent, the account stays open
     * and Jessica sees the code, so that she can give it herself.
     */
    private function redirectWithCode(Couple $couple, string $code): RedirectResponse
    {
        try {
            $couple->user->notify(new TemporaryAccessCodeNotification($code));
            $isEmailSent = true;
        } catch (Throwable $exception) {
            report($exception);
            $isEmailSent = false;
        }

        return to_route('admin.couples.index')->with('temporaryCode', [
            'couple' => $couple->threadTitle(),
            'email' => $couple->user->email,
            'code' => $code,
            'is_email_sent' => $isEmailSent,
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
