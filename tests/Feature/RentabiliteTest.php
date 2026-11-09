<?php

namespace Tests\Feature;

use App\Models\Couple;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RentabiliteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_only_an_admin_can_view_or_export_profitability(): void
    {
        $this->get(route('rentabilite.index'))->assertRedirect(route('login'));
        $this->get(route('rentabilite.rapport'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create())
            ->get(route('rentabilite.index'))
            ->assertForbidden();
        $this->get(route('rentabilite.rapport'))->assertForbidden();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('rentabilite.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Rentabilite')
                ->has('weddings', 0)
                ->where('summary.weddingCount', 0)
                ->where('years', fn ($years): bool => collect([2024, 2025, 2026, 2027, 2028])
                    ->every(fn (int $year): bool => $years->contains($year)))
                ->etc());
    }

    public function test_the_overview_calculates_the_selected_year_from_recorded_finances(): void
    {
        $wedding = Wedding::factory()->for(Couple::factory())->booked()->create([
            'wedding_date' => '2026-06-20',
        ]);
        Wedding::factory()->for(Couple::factory())->create([
            'wedding_date' => '2026-07-01',
            'status' => 'inquiry',
        ]);
        Wedding::factory()->for(Couple::factory())->booked()->create([
            'wedding_date' => '2025-06-20',
        ]);

        $serviceId = DB::table('services')->insertGetId(['name' => 'Décoration']);
        $weddingServiceId = DB::table('wedding_services')->insertGetId([
            'wedding_id' => $wedding->id,
            'service_id' => $serviceId,
        ]);
        DB::table('payments')->insert([
            ['wedding_service_id' => $weddingServiceId, 'type' => 'deposit', 'amount' => 6000, 'invoiced_at' => '2026-03-01', 'paid_at' => '2026-03-10'],
            ['wedding_service_id' => $weddingServiceId, 'type' => 'balance', 'amount' => 4000, 'invoiced_at' => '2026-05-01', 'paid_at' => null],
        ]);
        $timeCategoryId = DB::table('time_categories')->insertGetId(['name' => 'Atelier']);
        DB::table('time_entries')->insert([
            'wedding_id' => $wedding->id,
            'time_category_id' => $timeCategoryId,
            'worked_on' => '2026-05-01',
            'duration_minutes' => 3600,
        ]);
        $expenseCategoryId = DB::table('expense_categories')->insertGetId(['name' => 'Décoration']);
        DB::table('expenses')->insert([
            'wedding_id' => $wedding->id,
            'expense_category_id' => $expenseCategoryId,
            'spent_on' => '2026-05-02',
            'label' => 'Fleurs',
            'quantity' => 2,
            'amount' => 500,
            'refunded_amount' => 100,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('rentabilite.index', ['annee' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Rentabilite')
                ->where('year', 2026)
                ->has('weddings', 1)
                ->where('summary.revenue', 10000)
                ->where('summary.paid', 6000)
                ->where('summary.margin', 5200)
                ->where('summary.marginRatio', 52)
                ->where('summary.hours', 60)
                ->where('weddings.0.expenses', 900)
                ->etc());

        $report = $this->get(route('rentabilite.rapport', ['annee' => 2026]));
        $report->assertOk()->assertDownload('rentabilite-2026.csv');
        $this->assertStringContainsString('5200', $report->streamedContent());
    }
}
