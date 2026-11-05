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
            [
                'category' => 'contract',
                'title' => 'Contrat de prestation',
                'message' => 'Votre contrat, à lire et à approuver.',
                'file_path' => 'documents/contrat.pdf',
                'size_bytes' => 748,
                'requires_approval' => true,
                'viewed_at' => now(),
                'approved_at' => null,
            ],
            [
                'category' => 'terms',
                'title' => 'Conditions générales de vente 2026',
                'message' => 'Les conditions qui encadrent notre collaboration.',
                'file_path' => 'documents/cgv-2026.pdf',
                'size_bytes' => 763,
                'requires_approval' => true,
                'viewed_at' => now(),
            ],
            [
                'category' => 'design',
                'title' => 'Carnet de design — version 1',
                'message' => 'Première proposition complète de scénographie.',
                'file_path' => 'documents/carnet-design-v1.pdf',
                'size_bytes' => 757,
                'requires_approval' => false,
                'viewed_at' => now(),
            ],
            [
                'category' => 'appointment',
                'title' => 'Récapitulatif du point M-6',
                'message' => null,
                'file_path' => 'documents/recapitulatif-m-6.pdf',
                'size_bytes' => 754,
                'requires_approval' => false,
                'viewed_at' => now(),
            ],
        ];

        $wedding->documents()
            ->whereIn('file_path', [
                'documents/cgv-2027.pdf',
                'documents/plan.pdf',
                'documents/moodboard.pdf',
            ])
            ->delete();

        foreach ($documents as $attributes) {
            $document = $wedding->documents()->firstOrNew([
                'file_path' => $attributes['file_path'],
            ]);

            $document->forceFill($attributes)->save();

        }
    }
}
