<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wedding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Annual profitability estimate based on invoices, recorded expenses and time.
 */
class RentabiliteController extends Controller
{
    private const HOURLY_COST = 65;

    private const DOCUMENT_YEARS = [2024, 2025, 2026, 2027, 2028];

    /**
     * Display the annual overview for Jessica.
     */
    public function index(Request $request): InertiaResponse
    {
        $year = $this->selectedYear($request);

        return Inertia::render('Rentabilite', [
            ...$this->overview($year),
            'years' => $this->availableYears($year),
        ]);
    }

    /**
     * Download the same figures shown on the page.
     */
    public function report(Request $request): StreamedResponse
    {
        $year = $this->selectedYear($request);
        $overview = $this->overview($year);

        return response()->streamDownload(function () use ($overview): void {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Mariage', 'Date', 'Lieu', 'CA facturé (€)', 'Temps (h)', 'Coût du temps (€)', 'Dépenses (€)', 'Marge estimée (€)', 'Ratio (%)'], ';', '"', '');

            foreach ($overview['weddings'] as $wedding) {
                fputcsv($output, [
                    $wedding['couple'],
                    $wedding['date'],
                    $wedding['venue'],
                    $wedding['revenue'],
                    $wedding['hours'],
                    $wedding['time_cost'],
                    $wedding['expenses'],
                    $wedding['margin'],
                    $wedding['ratio'] ?? '',
                ], ';', '"', '');
            }

            fclose($output);
        }, "rentabilite-{$year}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function selectedYear(Request $request): int
    {
        $year = $request->query('annee');

        return is_scalar($year) && preg_match('/^\d{4}$/', (string) $year) && (int) $year >= 2000 && (int) $year <= 2100
            ? (int) $year
            : now()->year;
    }

    /**
     * @return list<int>
     */
    private function availableYears(int $selectedYear): array
    {
        $years = DB::table('weddings')
            ->whereNotNull('wedding_date')
            ->pluck('wedding_date')
            ->map(fn (string $date): int => (int) substr($date, 0, 4))
            ->all();

        $years = array_unique([...$years, ...self::DOCUMENT_YEARS, $selectedYear, now()->year]);
        rsort($years);

        return array_values($years);
    }

    /**
     * @return array{year: int, hourlyCost: int, summary: array<string, float|int|null>, weddings: list<array<string, float|int|string|null>>}
     */
    private function overview(int $year): array
    {
        $weddings = Wedding::query()
            ->join('couples', 'weddings.couple_id', '=', 'couples.id')
            ->leftJoin('venues', 'weddings.venue_id', '=', 'venues.id')
            ->whereYear('weddings.wedding_date', $year)
            ->whereIn('weddings.status', ['booked', 'completed', 'closed'])
            ->orderBy('weddings.wedding_date')
            ->get([
                'weddings.id',
                'weddings.wedding_date',
                'couples.partner1_first_name',
                'couples.partner2_first_name',
                'venues.name as venue_name',
            ]);

        $weddingIds = $weddings->pluck('id');
        $payments = DB::table('payments')
            ->join('wedding_services', 'payments.wedding_service_id', '=', 'wedding_services.id')
            ->whereIn('wedding_services.wedding_id', $weddingIds)
            ->select('wedding_services.wedding_id')
            ->selectRaw('SUM(CASE WHEN payments.invoiced_at IS NOT NULL THEN payments.amount ELSE 0 END) as revenue')
            ->selectRaw('SUM(CASE WHEN payments.paid_at IS NOT NULL THEN payments.amount ELSE 0 END) as paid')
            ->groupBy('wedding_services.wedding_id')
            ->get()
            ->keyBy('wedding_id');
        $time = DB::table('time_entries')
            ->whereIn('wedding_id', $weddingIds)
            ->select('wedding_id')
            ->selectRaw('SUM(duration_minutes) as minutes')
            ->groupBy('wedding_id')
            ->get()
            ->keyBy('wedding_id');
        $expenses = DB::table('expenses')
            ->whereIn('wedding_id', $weddingIds)
            ->select('wedding_id')
            ->selectRaw('SUM(quantity * amount - COALESCE(refunded_amount, 0)) as cost')
            ->groupBy('wedding_id')
            ->get()
            ->keyBy('wedding_id');

        $rows = $weddings->map(function (Wedding $wedding) use ($payments, $time, $expenses): array {
            $revenue = (float) ($payments->get($wedding->id)?->revenue ?? 0);
            $paid = (float) ($payments->get($wedding->id)?->paid ?? 0);
            $minutes = (int) ($time->get($wedding->id)?->minutes ?? 0);
            $expense = max(0, (float) ($expenses->get($wedding->id)?->cost ?? 0));
            $hours = $minutes / 60;
            $timeCost = $hours * self::HOURLY_COST;
            $margin = $revenue - $expense - $timeCost;

            return [
                'id' => $wedding->id,
                'couple' => collect([$wedding->partner1_first_name, $wedding->partner2_first_name])->filter()->join(' & '),
                'date' => $wedding->wedding_date->toDateString(),
                'venue' => $wedding->venue_name ?? 'Lieu à préciser',
                'revenue' => round($revenue, 2),
                'paid' => round($paid, 2),
                'hours' => round($hours, 1),
                'time_cost' => round($timeCost, 2),
                'expenses' => round($expense, 2),
                'margin' => round($margin, 2),
                'ratio' => $revenue > 0 ? round($margin / $revenue * 100, 1) : null,
            ];
        })->all();

        $revenue = array_sum(array_column($rows, 'revenue'));
        $paid = array_sum(array_column($rows, 'paid'));
        $hours = array_sum(array_column($rows, 'hours'));
        $expense = array_sum(array_column($rows, 'expenses'));
        $margin = array_sum(array_column($rows, 'margin'));
        $workedHours = collect(array_column($rows, 'hours'))->filter(fn (float $value): bool => $value > 0)->sort()->values();
        $middle = intdiv($workedHours->count(), 2);
        $medianHours = $workedHours->isEmpty()
            ? null
            : ($workedHours->count() % 2 === 0
                ? ($workedHours[$middle - 1] + $workedHours[$middle]) / 2
                : $workedHours[$middle]);

        return [
            'year' => $year,
            'hourlyCost' => self::HOURLY_COST,
            'summary' => [
                'weddingCount' => count($rows),
                'revenue' => round($revenue, 2),
                'paid' => round($paid, 2),
                'margin' => round($margin, 2),
                'marginRatio' => $revenue > 0 ? round($margin / $revenue * 100, 1) : null,
                'averageRevenue' => count($rows) > 0 ? round($revenue / count($rows), 2) : null,
                'hours' => round($hours, 1),
                'medianHours' => $medianHours === null ? null : round($medianHours, 1),
                'hourlyReturn' => $hours > 0 ? round(($revenue - $expense) / $hours, 2) : null,
                'documentedCount' => count(array_filter($rows, fn (array $row): bool => $row['revenue'] > 0 && $row['hours'] > 0)),
            ],
            'weddings' => $rows,
        ];
    }
}
