
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! DB::table('couples')->where('id', 1)->exists()) {
            return;
        }

        // Création du mariage
        $weddingId = DB::table('weddings')->insertGetId([
            'couple_id' => 1,
            'status' => 'booked',
            'wedding_date' => '2027-06-12',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Création des documents associés
        DB::table('documents')->insert([
            [
                'wedding_id' => $weddingId,
                'category' => 'terms',
                'title' => 'CGV 2027',
                'file_path' => 'documents/cgv-2027.pdf',
                'requires_approval' => 1,
                'viewed_at' => null,
                'approved_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'wedding_id' => $weddingId,
                'category' => 'contract',
                'title' => 'Contrat',
                'file_path' => 'documents/contrat.pdf',
                'requires_approval' => 1,
                'viewed_at' => now(),
                'approved_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'wedding_id' => $weddingId,
                'category' => 'misc',
                'title' => 'Plan de salle',
                'file_path' => 'documents/plan.pdf',
                'requires_approval' => 0,
                'viewed_at' => now(),
                'approved_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'wedding_id' => $weddingId,
                'category' => 'misc',
                'title' => 'Moodboard',
                'file_path' => 'documents/moodboard.pdf',
                'requires_approval' => 0,
                'viewed_at' => null,
                'approved_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        // Suppression des documents associés
        DB::table('documents')
            ->where('wedding_id', function ($query) {
                $query->select('id')
                    ->from('weddings')
                    ->where('couple_id', 1)
                    ->where('wedding_date', '2027-06-12')
                    ->where('status', 'booked');
            })
            ->delete();

        // Suppression du mariage
        DB::table('weddings')
            ->where('couple_id', 1)
            ->where('wedding_date', '2027-06-12')
            ->where('status', 'booked')
            ->delete();
    }
};
