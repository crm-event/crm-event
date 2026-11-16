<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\QuoteAmendment;
use App\Models\Setting;
use App\Models\User;
use App\Models\WeddingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BillingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_an_admin_sees_real_payments_and_sold_services(): void
    {
        $sold = WeddingService::factory()->create();
        Setting::query()->create(['key' => 'vat_threshold', 'value' => '37500', 'valid_from' => '2026-01-01']);
        $payment = Payment::factory()->for($sold, 'weddingService')->create([
            'amount' => '125.50', 'type' => 'deposit', 'due_date' => '2026-03-10',
            'paid_at' => '2026-03-05', 'invoice_number' => 'FACT-TEST-1',
            'invoice_url' => 'https://example.com/invoice/test',
        ]);

        $this->actingAs(User::factory()->admin()->create())->get(route('facturation.index'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Facturation')->has('payments', 1)->has('services', 1)
            ->where('payments.0.id', $payment->id)
            ->where('payments.0.amount', fn ($amount) => (float) $amount === 125.50)
            ->where('payments.0.paid_at', fn ($date) => str_starts_with($date, '2026-03-05'))
            ->where('payments.0.invoice_number', 'FACT-TEST-1')
            ->where('payments.0.invoice_url', 'https://example.com/invoice/test')
            ->where('seuils.0.cle', 'vat_threshold')
            ->where('seuils.0.valeur', '37500')
            ->where('services.0.id', $sold->id));
    }

    public function test_an_admin_can_create_and_update_a_payment_and_external_invoice_reference(): void
    {
        $sold = WeddingService::factory()->create();
        $this->actingAs(User::factory()->admin()->create());
        $data = [
            'wedding_service_id' => $sold->id, 'type' => 'deposit', 'amount' => '100.50',
            'due_date' => '2026-04-15', 'invoice_number' => 'FACT-TEST-1',
            'invoice_url' => 'https://example.com/invoice/test', 'invoiced_at' => '2026-04-01', 'paid_at' => null,
        ];

        $this->post(route('facturation.payments.store'), $data)->assertRedirect(route('facturation.index'))->assertSessionHasNoErrors();
        $payment = Payment::query()->sole();
        $this->assertSame('100.50', $payment->amount);
        $this->assertNull($payment->paid_at);

        $this->patch(route('facturation.payments.update', $payment), ['paid_at' => '2026-04-12'])
            ->assertRedirect(route('facturation.index'))->assertSessionHasNoErrors();
        $this->assertSame('2026-04-12', $payment->fresh()->paid_at->toDateString());
        $this->assertDatabaseCount('payments', 1);
    }

    public function test_an_unsafe_existing_invoice_url_is_not_exposed_as_a_clickable_link(): void
    {
        Payment::factory()->create(['invoice_url' => 'javascript:alert(1)']);

        $this->actingAs(User::factory()->admin()->create())->get(route('facturation.index'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('payments.0.invoice_url', null));
    }

    public function test_invalid_payment_data_and_duplicate_invoice_numbers_are_rejected(): void
    {
        $sold = WeddingService::factory()->create();
        Payment::factory()->create(['invoice_number' => 'FACT-TEST-1']);
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('facturation.payments.store'), [
            'wedding_service_id' => 999999, 'type' => 'unknown', 'amount' => '-1',
            'due_date' => 'invalid', 'invoice_number' => 'FACT-TEST-1',
            'invoice_url' => 'javascript:alert(1)', 'paid_at' => '2999-01-01',
        ])->assertSessionHasErrors(['wedding_service_id', 'type', 'amount', 'due_date', 'invoice_number', 'invoice_url', 'paid_at']);
        $this->assertDatabaseCount('payments', 1);

        $payment = Payment::factory()->for($sold, 'weddingService')->create();
        $other = WeddingService::factory()->create();
        $this->patch(route('facturation.payments.update', $payment), [
            'wedding_service_id' => $other->id, 'type' => 'balance', 'amount' => '10.00', 'paid_at' => null,
        ])->assertSessionHasNoErrors();
        $this->assertSame($sold->id, $payment->fresh()->wedding_service_id);
    }

    public function test_an_invoice_can_be_added_to_an_amendment_payment_without_overwriting_it(): void
    {
        $payment = Payment::factory()->create(['type' => 'amendment', 'amount' => '80.00', 'invoice_number' => null]);
        $this->actingAs(User::factory()->admin()->create());
        $data = ['invoice_number' => 'FACT-AVENANT-TEST', 'invoiced_at' => '2026-04-01', 'invoice_url' => 'https://example.com/test'];

        $this->patch(route('facturation.payments.invoice', $payment), $data)
            ->assertRedirect(route('facturation.index'))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'amount' => 80, 'type' => 'amendment', 'invoice_number' => 'FACT-AVENANT-TEST']);

        $this->patch(route('facturation.payments.invoice', $payment), [...$data, 'invoice_number' => 'AUTRE-FACTURE'])
            ->assertSessionHasErrors('invoice_number');
        $this->assertSame('FACT-AVENANT-TEST', $payment->fresh()->invoice_number);
    }

    public function test_an_invoice_reference_rejects_invalid_or_duplicate_values(): void
    {
        Payment::factory()->create(['invoice_number' => 'FACT-EXISTANTE']);
        $payment = Payment::factory()->create(['invoice_number' => null]);

        $this->actingAs(User::factory()->admin()->create())
            ->patch(route('facturation.payments.invoice', $payment), [
                'invoice_number' => 'FACT-EXISTANTE', 'invoiced_at' => 'invalid', 'invoice_url' => 'javascript:alert(1)',
            ])->assertSessionHasErrors(['invoice_number', 'invoiced_at', 'invoice_url']);

        $this->assertNull($payment->fresh()->invoice_number);
    }

    public function test_attaching_an_invoice_keeps_an_existing_link_when_no_new_link_is_sent(): void
    {
        $payment = Payment::factory()->create(['invoice_number' => null, 'invoice_url' => 'https://example.com/existing']);

        $this->actingAs(User::factory()->admin()->create())
            ->patch(route('facturation.payments.invoice', $payment), [
                'invoice_number' => 'FACT-TEST-LINK', 'invoiced_at' => '2026-04-01', 'invoice_url' => null,
            ])->assertRedirect(route('facturation.index'))->assertSessionHasNoErrors();

        $this->assertSame('https://example.com/existing', $payment->fresh()->invoice_url);
    }

    public function test_the_prestations_page_shows_only_the_selected_wedding_and_its_amendments(): void
    {
        $sold = WeddingService::factory()->create(['amount' => '1000.00', 'quote_number' => 'DEV-TEST-1']);
        QuoteAmendment::factory()->for($sold, 'weddingService')->create(['description' => 'Fleurs de test', 'amount' => '80.00']);
        $other = WeddingService::factory()->create();
        Payment::factory()->for($sold, 'weddingService')->create(['type' => 'balance', 'amount' => '700.00']);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('mariages.prestations', ['wedding_id' => $sold->wedding_id]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Mariage/PrestationsDevis')
            ->where('mariage.id', $sold->wedding_id)->has('mariages', 2)->has('prestations', 1)
            ->where('prestations.0.id', $sold->id)->where('prestations.0.devis_numero', 'DEV-TEST-1')
            ->where('prestations.0.avenants.0.description', 'Fleurs de test')
            ->where('prestations.0.paiements.0.montant', '700.00'));

        $this->assertNotSame($sold->wedding_id, $other->wedding_id);
    }

    public function test_a_draft_amendment_is_saved_without_creating_a_payment(): void
    {
        $sold = WeddingService::factory()->create();
        $this->actingAs(User::factory()->admin()->create())
            ->post(route('mariages.amendments.store'), [
                'wedding_service_id' => $sold->id, 'description' => 'Ajout fictif', 'amount' => '80.00',
            ])->assertRedirect(route('mariages.prestations', ['wedding_id' => $sold->wedding_id]))->assertSessionHasNoErrors();

        $this->assertNull(QuoteAmendment::query()->sole()->signed_at);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_recording_a_signature_creates_one_payment_and_cannot_be_repeated(): void
    {
        $sold = WeddingService::factory()->create();
        $amendment = QuoteAmendment::factory()->for($sold, 'weddingService')->create(['amount' => '80.00', 'signed_at' => null]);
        $this->actingAs(User::factory()->admin()->create());
        $data = ['signed_at' => '2026-04-01', 'due_date' => '2026-04-30'];

        $this->post(route('mariages.amendments.signature', $amendment), $data)
            ->assertRedirect(route('mariages.prestations', ['wedding_id' => $sold->wedding_id]))->assertSessionHasNoErrors();
        $this->assertSame('2026-04-01', $amendment->fresh()->signed_at->toDateString());
        $payment = Payment::query()->sole();
        $this->assertSame('amendment', $payment->type);
        $this->assertSame('80.00', $payment->amount);
        $this->assertSame($sold->id, $payment->wedding_service_id);
        $this->assertSame('2026-04-30', $payment->due_date->toDateString());

        $this->post(route('mariages.amendments.signature', $amendment), $data)->assertStatus(409);
        $this->assertDatabaseCount('payments', 1);
    }

    public function test_invalid_amendments_and_signatures_are_rejected(): void
    {
        $sold = WeddingService::factory()->create();
        $amendment = QuoteAmendment::factory()->for($sold, 'weddingService')->create(['signed_at' => null]);
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('mariages.amendments.store'), [
            'wedding_service_id' => 999999, 'description' => '', 'amount' => '-1',
        ])->assertSessionHasErrors(['wedding_service_id', 'description', 'amount']);
        $this->post(route('mariages.amendments.signature', $amendment), [
            'signed_at' => '2999-01-01', 'due_date' => 'invalid',
        ])->assertSessionHasErrors(['signed_at', 'due_date']);
        $this->assertNull($amendment->fresh()->signed_at);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_a_non_positive_existing_amendment_cannot_create_a_payment(): void
    {
        $amendment = QuoteAmendment::factory()->create(['amount' => '-10.00', 'signed_at' => null]);

        $this->actingAs(User::factory()->admin()->create())
            ->post(route('mariages.amendments.signature', $amendment), ['signed_at' => '2026-04-01'])
            ->assertSessionHasErrors('signed_at');

        $this->assertNull($amendment->fresh()->signed_at);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_clients_and_guests_cannot_manage_payments_or_amendments(): void
    {
        $payment = Payment::factory()->create();
        $amendment = QuoteAmendment::factory()->create();
        $this->post(route('facturation.payments.store'))->assertRedirect(route('login'));
        $this->patch(route('facturation.payments.invoice', $payment))->assertRedirect(route('login'));
        $this->post(route('mariages.amendments.store'))->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create());
        $this->post(route('facturation.payments.store'))->assertForbidden();
        $this->patch(route('facturation.payments.update', $payment))->assertForbidden();
        $this->patch(route('facturation.payments.invoice', $payment))->assertForbidden();
        $this->post(route('mariages.amendments.store'))->assertForbidden();
        $this->post(route('mariages.amendments.signature', $amendment))->assertForbidden();
    }

    public function test_an_accepted_quote_amount_cannot_be_changed_or_removed_from_the_wedding(): void
    {
        $sold = WeddingService::factory()->create([
            'amount' => '1000.00', 'quote_accepted_at' => '2026-03-01', 'contract_signed_at' => null,
        ]);
        $wedding = $sold->wedding;
        $data = [
            'email' => $wedding->couple->email, 'wedding_date' => '2026-12-15', 'venue_id' => null,
            'guest_count' => 42, 'service_ids' => [$sold->service_id], 'service_amounts' => [$sold->service_id => '1500.00'],
        ];
        $this->actingAs(User::factory()->admin()->create());

        $this->put(route('admin.wedding.update', $wedding->id), $data)
            ->assertSessionHasErrors('service_amounts.'.$sold->service_id);
        $this->assertSame('1000.00', $sold->fresh()->amount);

        $this->put(route('admin.wedding.update', $wedding->id), [...$data, 'service_ids' => [], 'service_amounts' => []])
            ->assertSessionHasErrors('service_ids');
        $this->assertDatabaseHas('wedding_services', ['id' => $sold->id]);

        $this->put(route('admin.wedding.update', $wedding->id), [...$data, 'service_amounts' => [$sold->service_id => '1000.00']])
            ->assertRedirect(route('admin.wedding.show', $wedding->id))->assertSessionHasNoErrors();
        $this->assertSame(42, $wedding->fresh()->guest_count);
    }

    public function test_an_unsigned_quote_amount_can_still_be_updated(): void
    {
        $sold = WeddingService::factory()->create([
            'amount' => '1000.00', 'quote_accepted_at' => null, 'contract_signed_at' => null,
        ]);
        $wedding = $sold->wedding;

        $this->actingAs(User::factory()->admin()->create())->put(route('admin.wedding.update', $wedding->id), [
            'email' => $wedding->couple->email, 'wedding_date' => '2026-12-15', 'venue_id' => null,
            'guest_count' => 42, 'service_ids' => [$sold->service_id], 'service_amounts' => [$sold->service_id => '1500.00'],
        ])->assertRedirect(route('admin.wedding.show', $wedding->id))->assertSessionHasNoErrors();

        $this->assertSame('1500.00', $sold->fresh()->amount);
    }

    public function test_an_accepted_quote_with_no_amount_can_remain_unchanged_when_editing_a_wedding(): void
    {
        $sold = WeddingService::factory()->create([
            'amount' => null, 'quote_accepted_at' => '2026-03-01', 'contract_signed_at' => null,
        ]);
        $wedding = $sold->wedding;
        $this->actingAs(User::factory()->admin()->create());

        $this->get(route('admin.wedding.edit', $wedding->id))
            ->assertInertia(fn (Assert $page) => $page->where('selectedServices.0.locked', true));
        $this->put(route('admin.wedding.update', $wedding->id), [
            'email' => $wedding->couple->email, 'wedding_date' => '2026-12-15', 'venue_id' => null,
            'guest_count' => 42, 'service_ids' => [$sold->service_id], 'service_amounts' => [$sold->service_id => null],
        ])->assertRedirect(route('admin.wedding.show', $wedding->id))->assertSessionHasNoErrors();

        $this->assertNull($sold->fresh()->amount);
        $this->assertSame(42, $wedding->fresh()->guest_count);
    }

    public function test_an_unsigned_service_requires_an_amount_when_editing_a_wedding(): void
    {
        $sold = WeddingService::factory()->create(['quote_accepted_at' => null, 'contract_signed_at' => null]);
        $wedding = $sold->wedding;

        $this->actingAs(User::factory()->admin()->create())->put(route('admin.wedding.update', $wedding->id), [
            'email' => $wedding->couple->email, 'wedding_date' => '2026-12-15', 'venue_id' => null,
            'guest_count' => 42, 'service_ids' => [$sold->service_id], 'service_amounts' => [$sold->service_id => null],
        ])->assertSessionHasErrors('service_amounts.'.$sold->service_id);
    }
}
