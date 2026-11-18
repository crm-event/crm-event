<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\QuoteAmendment;
use App\Models\Service;
use App\Models\Wedding;
use App\Models\WeddingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_sold_service_keeps_its_wedding_payments_and_amendments(): void
    {
        $wedding = Wedding::factory()->create();
        $service = Service::factory()->create();
        $weddingService = WeddingService::factory()->for($wedding)->for($service)->create([
            'amount' => '1200.00',
            'vat_rate' => '0.00',
        ]);
        $payment = Payment::factory()->for($weddingService)->create(['amount' => '360.00']);
        $amendment = QuoteAmendment::factory()->for($weddingService)->create(['amount' => '200.00']);

        $this->assertTrue($weddingService->wedding->is($wedding));
        $this->assertTrue($weddingService->service->is($service));
        $this->assertTrue($wedding->weddingServices->first()->is($weddingService));
        $this->assertTrue($weddingService->payments->first()->is($payment));
        $this->assertTrue($weddingService->amendments->first()->is($amendment));
        $this->assertSame('1200.00', $weddingService->amount);
        $this->assertSame('360.00', $payment->amount);
        $this->assertSame('200.00', $amendment->amount);
    }
}
