<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseReceiptRequest;
use App\Http\Requests\StoreExpenseRequest;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Wedding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class DepenseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Depenses', [
            'depenses' => Expense::query()
                ->with(['category', 'wedding.couple'])
                ->orderByDesc('spent_on')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Expense $expense): array => [
                    'id' => $expense->id,
                    'date' => $expense->spent_on->toDateString(),
                    'intitule' => $expense->label,
                    'categorie' => $expense->category->name,
                    'mariage' => $expense->wedding->couple->threadTitle(),
                    'montant' => $expense->amount,
                    'justificatif' => $expense->receipt_path !== null && Storage::disk('local')->exists($expense->receipt_path),
                ]),
            'categories' => ExpenseCategory::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'mariages' => Wedding::query()->with('couple')->orderByDesc('wedding_date')->get()->map(fn (Wedding $wedding): array => [
                'id' => $wedding->id,
                'titre' => $wedding->couple->threadTitle(),
                'date' => $wedding->wedding_date?->toDateString(),
            ]),
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('receipt');
        $path = null;

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('expense-receipts', 'local');
            abort_if($path === false, 500, 'Impossible de sauvegarder le justificatif.');
            $data['receipt_path'] = $path;
        }

        try {
            Expense::query()->create($data);
        } catch (Throwable $exception) {
            if ($path !== null) {
                Storage::disk('local')->delete($path);
            }

            throw $exception;
        }

        return to_route('depenses.index');
    }

    public function receipt(Expense $expense): StreamedResponse
    {
        abort_unless($expense->receipt_path !== null && Storage::disk('local')->exists($expense->receipt_path), 404);

        return Storage::disk('local')->download($expense->receipt_path);
    }

    public function storeReceipt(StoreExpenseReceiptRequest $request, Expense $expense): RedirectResponse
    {
        abort_if($expense->receipt_path !== null && Storage::disk('local')->exists($expense->receipt_path), 409);

        $path = $request->file('receipt')->store('expense-receipts', 'local');
        abort_if($path === false, 500, 'Impossible de sauvegarder le justificatif.');

        try {
            $updated = Expense::query()->whereKey($expense->id)
                ->where('receipt_path', $expense->receipt_path)
                ->update(['receipt_path' => $path]);
            abort_if($updated === 0, 409);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        return to_route('depenses.index');
    }
}
