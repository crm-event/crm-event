<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Design documents sent from the Documents page before the Design tab of the
 * wedding file existed become design book proposals, numbered by wedding in
 * the order they were sent. Their approval now lives on the proposal, so the
 * document no longer asks for one.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $documents = DB::table('documents')
            ->where('category', 'design')
            ->whereNotIn('id', DB::table('proposals')->whereNotNull('document_id')->select('document_id'))
            ->orderBy('wedding_id')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        if ($documents->isEmpty()) {
            return;
        }

        $lastVersions = DB::table('proposals')
            ->where('type', 'design_book')
            ->whereIn('wedding_id', $documents->pluck('wedding_id')->unique())
            ->groupBy('wedding_id')
            ->pluck(DB::raw('max(version)'), 'wedding_id');

        DB::transaction(function () use ($documents, $lastVersions): void {
            $versions = $lastVersions->map(fn ($version): int => (int) $version)->all();

            foreach ($documents as $document) {
                $versions[$document->wedding_id] = ($versions[$document->wedding_id] ?? 0) + 1;

                DB::table('proposals')->insert([
                    'wedding_id' => $document->wedding_id,
                    'document_id' => $document->id,
                    'type' => 'design_book',
                    'title' => $document->title,
                    'version' => $versions[$document->wedding_id],
                    'description' => $document->message,
                    'approved_at' => $document->approved_at,
                    'created_at' => $document->created_at,
                    'updated_at' => now(),
                ]);
            }

            DB::table('documents')->whereIn('id', $documents->pluck('id'))->update(['requires_approval' => false]);
        });
    }

    /**
     * Reverse the migrations: nothing is undone, the proposals may already
     * have comments that would be lost.
     */
    public function down(): void
    {
        //
    }
};
