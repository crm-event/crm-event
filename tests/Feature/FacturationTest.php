<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FacturationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/facturation')->assertRedirect('/login');
        $this->post('/facturation/paiements', [])->assertRedirect('/login');
        $this->patch('/facturation/paiements/1', [])->assertRedirect('/login');
    }

    public function test_couples_cannot_read_or_change_billing(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/facturation')->assertForbidden();
        $this->post('/facturation/paiements', [])->assertForbidden();
        $this->patch('/facturation/paiements/1', ['paid_at' => null])->assertForbidden();
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_empty_database_displays_no_example_payments(): void
    {
        $this->actingAs($this->admin())->get('/facturation')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Facturation')
                ->has('payments', 0)
                ->has('services', 0));
    }

    public function test_billing_reads_payments_and_services_from_the_database(): void
    {
        $serviceId = $this->soldService();
        DB::table('payments')->insert($this->paymentData($serviceId));

        $this->actingAs($this->admin())->get('/facturation')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Facturation')
                ->has('payments', 1)
                ->where('payments.0.invoice_number', 'FACT-TEST-001')
                ->where('payments.0.partner1_first_name', 'Camille')
                ->where('payments.0.service_name', 'Coordination')
                ->has('services', 1)
                ->where('services.0.id', $serviceId));
    }

    public function test_admin_can_save_an_invoice_and_read_it_after_a_new_request(): void
    {
        $data = $this->paymentData($this->soldService());

        $this->actingAs($this->admin())->post('/facturation/paiements', $data)
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('facturation'));

        $this->assertDatabaseHas('payments', $data);
        $this->get('/facturation')->assertInertia(fn (Assert $page) => $page
            ->has('payments', 1)
            ->where('payments.0.invoice_number', $data['invoice_number']));
    }

    public function test_admin_can_record_and_correct_a_payment_date_without_changing_the_invoice(): void
    {
        $data = $this->paymentData($this->soldService());
        $id = DB::table('payments')->insertGetId($data);
        $date = now()->toDateString();

        $this->actingAs($this->admin())->patch('/facturation/paiements/'.$id, ['paid_at' => $date])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('facturation'));
        $this->assertDatabaseHas('payments', ['id' => $id, 'paid_at' => $date, 'amount' => '1250.45']);

        $this->patch('/facturation/paiements/'.$id, ['paid_at' => null, 'amount' => '1.00'])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('payments', ['id' => $id, 'paid_at' => null, 'amount' => '1250.45', 'invoice_number' => 'FACT-TEST-001']);
    }

    public function test_invalid_amount_unknown_service_and_duplicate_invoice_are_rejected(): void
    {
        $data = $this->paymentData($this->soldService());
        DB::table('payments')->insert($data);

        $this->actingAs($this->admin())->post('/facturation/paiements', [
            ...$data,
            'wedding_service_id' => 999999,
            'amount' => '-1.001',
        ])->assertSessionHasErrors(['wedding_service_id', 'amount', 'invoice_number']);

        $this->assertDatabaseCount('payments', 1);
    }

    public function test_future_payment_dates_and_unsafe_invoice_links_are_rejected(): void
    {
        $data = $this->paymentData($this->soldService());

        $this->actingAs($this->admin())->post('/facturation/paiements', [
            ...$data,
            'paid_at' => now()->addDay()->toDateString(),
            'invoice_url' => 'javascript:alert(1)',
        ])->assertSessionHasErrors(['paid_at', 'invoice_url']);

        $this->assertDatabaseCount('payments', 0);
    }

    public function test_unknown_payment_returns_not_found(): void
    {
        $this->actingAs($this->admin())->patch('/facturation/paiements/999999', ['paid_at' => null])
            ->assertNotFound();
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function soldService(): int
    {
        $coupleId = DB::table('couples')->insertGetId([
            'partner1_first_name' => 'Camille',
            'partner2_first_name' => 'Alex',
        ]);
        $weddingId = DB::table('weddings')->insertGetId(['couple_id' => $coupleId]);
        $serviceId = DB::table('services')->insertGetId(['name' => 'Coordination']);

        return DB::table('wedding_services')->insertGetId([
            'wedding_id' => $weddingId,
            'service_id' => $serviceId,
        ]);
    }

    /**
     * @return array<string, int|string|null>
     */
    private function paymentData(int $serviceId): array
    {
        return [
            'wedding_service_id' => $serviceId,
            'type' => 'deposit',
            'amount' => '1250.45',
            'due_date' => now()->toDateString(),
            'invoice_number' => 'FACT-TEST-001',
            'invoice_url' => null,
            'invoiced_at' => now()->toDateString(),
            'paid_at' => null,
        ];
    }
}
