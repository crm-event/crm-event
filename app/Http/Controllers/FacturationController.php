<?php

namespace App\Http\Controllers;

use App\Http\Requests\FacturationRequest;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FacturationController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->getRawOriginal('role') === 'admin', 403);

        $payments = $this->serviceQuery()
            ->join('payments', 'payments.wedding_service_id', '=', 'wedding_services.id')
            ->orderByDesc('payments.id')
            ->get([
                'payments.id',
                'payments.type',
                'payments.amount',
                'payments.due_date',
                'payments.invoice_number',
                'payments.invoice_url',
                'payments.invoiced_at',
                'payments.paid_at',
                'payments.created_at',
                'weddings.id as wedding_id',
                'couples.partner1_first_name',
                'couples.partner2_first_name',
                'services.name as service_name',
                'venues.name as venue_name',
            ]);

        $services = $this->serviceQuery()
            ->orderBy('couples.partner1_first_name')
            ->get([
                'wedding_services.id',
                'weddings.id as wedding_id',
                'couples.partner1_first_name',
                'couples.partner2_first_name',
                'services.name as service_name',
            ]);

        return Inertia::render('Facturation', [
            'payments' => $payments,
            'services' => $services,
            'today' => now()->toDateString(),
        ]);
    }

    public function store(FacturationRequest $request): RedirectResponse
    {
        DB::table('payments')->insert([
            ...$request->validated(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return to_route('facturation');
    }

    public function update(FacturationRequest $request, int $payment): RedirectResponse
    {
        abort_unless(DB::table('payments')->where('id', $payment)->exists(), 404);

        DB::table('payments')->where('id', $payment)->update([
            ...$request->validated(),
            'updated_at' => now(),
        ]);

        return to_route('facturation');
    }

    private function serviceQuery(): Builder
    {
        return DB::table('wedding_services')
            ->join('weddings', 'weddings.id', '=', 'wedding_services.wedding_id')
            ->join('couples', 'couples.id', '=', 'weddings.couple_id')
            ->join('services', 'services.id', '=', 'wedding_services.service_id')
            ->leftJoin('venues', 'venues.id', '=', 'weddings.venue_id');
    }
}
