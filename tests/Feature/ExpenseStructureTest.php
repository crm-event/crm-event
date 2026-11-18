<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExpenseStructureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_expense_page_is_only_accessible_to_the_admin(): void
    {
        $this->get(route('depenses.index'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create())
            ->get(route('depenses.index'))
            ->assertForbidden();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('depenses.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Depenses'));
    }

    public function test_an_expense_belongs_to_a_wedding_and_a_category(): void
    {
        $wedding = Wedding::factory()->create();
        $category = ExpenseCategory::factory()->create();
        $expense = Expense::factory()->for($wedding)->for($category, 'category')->create([
            'amount' => '125.50',
            'quantity' => 2,
        ]);

        $this->assertTrue($expense->wedding->is($wedding));
        $this->assertTrue($expense->category->is($category));
        $this->assertTrue($wedding->expenses->first()->is($expense));
        $this->assertTrue($category->expenses->first()->is($expense));
        $this->assertSame('125.50', $expense->amount);
        $this->assertSame(2, $expense->quantity);
    }
}
