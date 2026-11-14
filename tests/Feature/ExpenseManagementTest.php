<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExpenseManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_the_page_displays_saved_expenses_and_active_categories(): void
    {
        Storage::fake('local');
        $wedding = Wedding::factory()->create();
        $category = ExpenseCategory::factory()->create(['name' => 'Décoration', 'is_active' => true]);
        $inactive = ExpenseCategory::factory()->create(['is_active' => false]);
        $expense = Expense::factory()->for($wedding)->for($inactive, 'category')->create([
            'label' => 'Fleurs de test', 'amount' => '125.50', 'spent_on' => '2026-04-15', 'receipt_path' => null,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('depenses.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Depenses')
                ->has('depenses', 1)
                ->where('depenses.0.id', $expense->id)
                ->where('depenses.0.date', '2026-04-15')
                ->where('depenses.0.montant', '125.50')
                ->where('depenses.0.categorie', $inactive->name)
                ->where('depenses.0.justificatif', false)
                ->has('categories', 1)
                ->where('categories.0.id', $category->id)
                ->where('mariages.0.id', $wedding->id)
            );
    }

    public function test_an_admin_can_save_an_expense_and_download_its_receipt(): void
    {
        Storage::fake('local');
        $wedding = Wedding::factory()->create();
        $category = ExpenseCategory::factory()->create(['is_active' => true]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('depenses.store'), [
            'wedding_id' => $wedding->id,
            'expense_category_id' => $category->id,
            'spent_on' => '2026-04-15',
            'label' => 'Location de test',
            'amount' => '125.50',
            'receipt' => UploadedFile::fake()->create('recu.pdf', 10, 'application/pdf'),
        ])->assertRedirect(route('depenses.index'))->assertSessionHasNoErrors();

        $expense = Expense::query()->sole();
        $this->assertSame('125.50', $expense->amount);
        $this->assertSame($wedding->id, $expense->wedding_id);
        $this->assertSame($category->id, $expense->expense_category_id);
        Storage::disk('local')->assertExists($expense->receipt_path);
        $this->get(route('depenses.receipt', $expense))->assertOk();
        $this->get(route('depenses.index'))->assertInertia(fn (Assert $page) => $page->where('depenses.0.justificatif', true));
    }

    public function test_an_expense_can_be_saved_without_a_receipt(): void
    {
        $wedding = Wedding::factory()->create();
        $category = ExpenseCategory::factory()->create(['is_active' => true]);

        $this->actingAs(User::factory()->admin()->create())->post(route('depenses.store'), [
            'wedding_id' => $wedding->id, 'expense_category_id' => $category->id,
            'spent_on' => '2026-04-15', 'label' => 'Dépense de test', 'amount' => '20',
        ])->assertRedirect(route('depenses.index'))->assertSessionHasNoErrors();

        $this->assertNull(Expense::query()->sole()->receipt_path);
    }

    public function test_invalid_expenses_are_not_saved(): void
    {
        Storage::fake('local');
        $inactive = ExpenseCategory::factory()->create(['is_active' => false]);

        $this->actingAs(User::factory()->admin()->create())->post(route('depenses.store'), [
            'wedding_id' => 999999,
            'expense_category_id' => $inactive->id,
            'spent_on' => 'not-a-date',
            'label' => '',
            'amount' => '0.001',
            'receipt' => UploadedFile::fake()->create('recu.txt', 1, 'text/plain'),
        ])->assertSessionHasErrors(['wedding_id', 'expense_category_id', 'spent_on', 'label', 'amount', 'receipt']);

        $this->assertDatabaseCount('expenses', 0);
        Storage::disk('local')->assertDirectoryEmpty('expense-receipts');
    }

    public function test_a_couple_and_a_guest_cannot_create_expenses_or_download_receipts(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('expense-receipts/test.pdf', 'test');
        $expense = Expense::factory()->create(['receipt_path' => 'expense-receipts/test.pdf']);

        $this->post(route('depenses.store'))->assertRedirect(route('login'));
        $this->get(route('depenses.receipt', $expense))->assertRedirect(route('login'));
        $this->post(route('depenses.receipt.store', $expense))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create());
        $this->post(route('depenses.store'))->assertForbidden();
        $this->get(route('depenses.receipt', $expense))->assertForbidden();
        $this->post(route('depenses.receipt.store', $expense))->assertForbidden();
        $this->assertDatabaseCount('expenses', 1);
    }

    public function test_an_admin_can_add_a_missing_receipt_without_overwriting_an_existing_one(): void
    {
        Storage::fake('local');
        $expense = Expense::factory()->create(['receipt_path' => null]);
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('depenses.receipt.store', $expense), [
            'receipt' => UploadedFile::fake()->create('recu.pdf', 10, 'application/pdf'),
        ])->assertRedirect(route('depenses.index'))->assertSessionHasNoErrors();

        $path = $expense->fresh()->receipt_path;
        Storage::disk('local')->assertExists($path);

        $this->post(route('depenses.receipt.store', $expense), [
            'receipt' => UploadedFile::fake()->create('autre.pdf', 10, 'application/pdf'),
        ])->assertStatus(409);

        $this->assertSame($path, $expense->fresh()->receipt_path);
        Storage::disk('local')->assertCount('expense-receipts', 1);
    }

    public function test_adding_a_receipt_rejects_an_invalid_file(): void
    {
        Storage::fake('local');
        $expense = Expense::factory()->create(['receipt_path' => null]);

        $this->actingAs(User::factory()->admin()->create())
            ->post(route('depenses.receipt.store', $expense), [
                'receipt' => UploadedFile::fake()->create('recu.txt', 1, 'text/plain'),
            ])->assertSessionHasErrors('receipt');

        $this->assertNull($expense->fresh()->receipt_path);
        Storage::disk('local')->assertDirectoryEmpty('expense-receipts');
    }

    public function test_a_missing_receipt_returns_not_found(): void
    {
        Storage::fake('local');
        $expense = Expense::factory()->create(['receipt_path' => null]);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('depenses.receipt', $expense))
            ->assertNotFound();
    }
}
