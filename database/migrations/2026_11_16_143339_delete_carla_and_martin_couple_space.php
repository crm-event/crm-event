<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Remove the "Carla & Martin" couple space, built for the demo from the
 * documents of real clients of Jessica: the presentation uses an invented
 * couple instead (Séverine & Bruno).
 *
 * Only the record that has a login account goes, with its account and
 * everything tied to them: weddings, quotes and payments, appointments,
 * documents, design, messages, community posts and the stored files. The
 * record imported from Jessica's spreadsheet, which has no account, stays.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $couples = DB::table('couples')
            ->where('partner1_first_name', 'Carla')
            ->where('partner2_first_name', 'Martin')
            ->whereNotNull('user_id')
            ->get(['id', 'user_id']);

        foreach ($couples as $couple) {
            $this->deleteFiles(DB::transaction(fn (): Collection => $this->deleteCoupleSpace($couple->id, $couple->user_id)));
        }
    }

    /**
     * Delete the couple, its login account and everything tied to them, and
     * return the paths of the stored files to remove once the rows are gone.
     *
     * The rows are deleted child first, without relying on the cascades of the
     * foreign keys: several of them restrict the deletion (quotes, payments,
     * time and expenses).
     *
     * @return Collection<int, string>
     */
    private function deleteCoupleSpace(int $coupleId, int $userId): Collection
    {
        $weddingIds = DB::table('weddings')->where('couple_id', $coupleId)->pluck('id');
        $weddingServiceIds = DB::table('wedding_services')->whereIn('wedding_id', $weddingIds)->pluck('id');
        $proposalIds = DB::table('proposals')->whereIn('wedding_id', $weddingIds)->pluck('id');

        $files = collect()
            ->merge(DB::table('documents')->whereIn('wedding_id', $weddingIds)->pluck('file_path'))
            ->merge(DB::table('media_items')->whereIn('wedding_id', $weddingIds)->pluck('file_path'))
            ->merge(DB::table('messages')->whereIn('wedding_id', $weddingIds)->whereNotNull('voice_note_path')->pluck('voice_note_path'));

        DB::table('payments')->whereIn('wedding_service_id', $weddingServiceIds)->delete();
        DB::table('quote_amendments')->whereIn('wedding_service_id', $weddingServiceIds)->delete();
        DB::table('wedding_services')->whereIn('id', $weddingServiceIds)->delete();
        DB::table('time_entries')->whereIn('wedding_id', $weddingIds)->delete();
        DB::table('expenses')->whereIn('wedding_id', $weddingIds)->delete();

        DB::table('proposal_comments')
            ->where(fn ($query) => $query->whereIn('proposal_id', $proposalIds)->orWhere('user_id', $userId))
            ->delete();

        foreach (['proposals', 'documents', 'media_items', 'messages', 'design_briefs', 'reviews', 'appointments', 'tasks', 'timeline_items', 'wedding_vendor'] as $table) {
            DB::table($table)->whereIn('wedding_id', $weddingIds)->delete();
        }

        // Column added on the shared database by a migration of another branch.
        if (Schema::hasColumn('messages', 'couple_id')) {
            DB::table('messages')->where('couple_id', $coupleId)->delete();
        }

        DB::table('weddings')->whereIn('id', $weddingIds)->delete();

        // The replies of other couples go with the posts they answer.
        $postIds = DB::table('community_posts')->where('user_id', $userId)->pluck('id');
        DB::table('community_posts')->whereIn('parent_id', $postIds)->delete();
        DB::table('community_posts')->whereIn('id', $postIds)->delete();

        $email = DB::table('users')->where('id', $userId)->value('email');

        DB::table('sessions')->where('user_id', $userId)->delete();
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        DB::table('couples')->where('id', $coupleId)->delete();
        DB::table('users')->where('id', $userId)->delete();

        return $files->filter()->unique()->values();
    }

    /**
     * Remove the stored files. Run on the server, so that the files kept there
     * go too: a file that is not on this machine is skipped.
     *
     * @param  Collection<int, string>  $paths
     */
    private function deleteFiles(Collection $paths): void
    {
        Storage::delete($paths->all());
    }

    /**
     * Reverse the migrations: the deleted data cannot be brought back.
     */
    public function down(): void
    {
        //
    }
};
