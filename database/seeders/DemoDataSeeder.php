<?php

namespace Database\Seeders;

use App\Models\Couple;
use App\Models\Wedding;
use Illuminate\Database\Seeder;

/**
 * Demo data for the couple space: a booked wedding with four documents.
 *
 * It replaces the former migration 2026_11_03_132804_insert_wedding_and_documents:
 * test data must not live in a migration, which would run in every
 * environment, production included, and broke the test suite (no couple #1 in
 * an empty database).
 *
 * It is never run automatically. Run it on purpose, after agreeing with the
 * team since the database is shared:
 *     php artisan db:seed --class=DemoDataSeeder
 *
 * It is idempotent: running it twice does not duplicate anything.
 */
class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $couple = Couple::query()->oldest('id')->first();

        if ($couple === null) {
            $this->command?->warn('No couple record found: create one before seeding the demo data.');

            return;
        }

        $wedding = Wedding::query()
            ->where('couple_id', $couple->id)
            ->whereDate('wedding_date', '2027-06-12')
            ->first()
            ?? Wedding::query()->create([
                'couple_id' => $couple->id,
                'wedding_date' => '2027-06-12',
                'status' => 'booked',
            ]);

        $documents = [
            ['category' => 'terms', 'title' => 'CGV 2027', 'file_path' => 'documents/cgv-2027.pdf', 'requires_approval' => true, 'viewed_at' => null],
            ['category' => 'contract', 'title' => 'Contrat', 'file_path' => 'documents/contrat.pdf', 'requires_approval' => true, 'viewed_at' => now()],
            ['category' => 'misc', 'title' => 'Plan de salle', 'file_path' => 'documents/plan.pdf', 'requires_approval' => false, 'viewed_at' => now()],
            ['category' => 'misc', 'title' => 'Moodboard', 'file_path' => 'documents/moodboard.pdf', 'requires_approval' => false, 'viewed_at' => null],
        ];

        foreach ($documents as $attributes) {
            $document = $wedding->documents()->firstOrNew(['title' => $attributes['title']]);

            if (! $document->exists) {
                $document->forceFill($attributes)->save();
            }
        }
    }
}
