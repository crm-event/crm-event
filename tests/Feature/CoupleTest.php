<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Couple;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoupleTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_couple_record_exists_without_a_login_account(): void
    {
        $couple = Couple::factory()->create();

        $this->assertNull($couple->user_id);
        $this->assertNull($couple->user);
        $this->assertSame('fr', $couple->preferred_language);
    }

    public function test_opening_the_portal_links_the_record_to_a_couple_account(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->assertNotNull($couple->user);
        $this->assertSame(UserRole::Couple, $couple->user->role);
        $this->assertTrue($couple->user->couple->is($couple));
    }

    public function test_an_account_cannot_be_linked_to_two_couple_records(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $this->expectException(QueryException::class);

        Couple::factory()->create(['user_id' => $couple->user_id]);
    }

    public function test_deleting_the_account_keeps_the_couple_record(): void
    {
        $couple = Couple::factory()->withPortalAccess()->create();

        $couple->user->delete();

        $this->assertModelExists($couple);
        $this->assertNull($couple->fresh()->user_id);
    }
}
