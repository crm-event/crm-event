<?php

namespace Tests\Feature;

use App\Models\Couple;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_adds_a_booked_wedding_with_four_documents_to_the_first_couple(): void
    {
        $couple = Couple::factory()->create();

        $this->seed(DemoDataSeeder::class);

        $wedding = $couple->weddings()->sole();
        $this->assertSame('booked', $wedding->status);
        $this->assertSame(4, $wedding->documents()->count());
    }

    public function test_running_it_twice_does_not_duplicate_anything(): void
    {
        Couple::factory()->create();

        $this->seed(DemoDataSeeder::class);
        $this->seed(DemoDataSeeder::class);

        $this->assertDatabaseCount('weddings', 1);
        $this->assertDatabaseCount('documents', 4);
    }

    public function test_it_does_nothing_without_a_couple(): void
    {
        $this->seed(DemoDataSeeder::class);

        $this->assertDatabaseCount('weddings', 0);
    }
}
