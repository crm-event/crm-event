<?php

namespace App\Support;

use App\Models\MediaItem;
use App\Models\Proposal;
use App\Models\ProposalComment;
use App\Models\Setting;
use App\Models\Wedding;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * The design of a wedding as shown in the Design tab of the wedding file
 * (Jessica) and on the Design page of the couple space: what the couple
 * shared, and the proposals sent by Jessica with their conversation.
 */
class WeddingDesign
{
    /** The couple has shared nothing yet. */
    public const WAITING_FOR_COUPLE = 'waiting_for_couple';

    /** The couple has shared their ideas and waits for a first proposal. */
    public const WAITING_FOR_PROPOSAL = 'waiting_for_proposal';

    /** The couple answered a proposal with remarks. */
    public const CHANGES_REQUESTED = 'changes_requested';

    /** A proposal waits for the answer of the couple. */
    public const AWAITING_COUPLE = 'awaiting_couple';

    /** Every current proposal is approved. */
    public const APPROVED = 'approved';

    /**
     * Everything Jessica needs in the Design tab.
     *
     * @return array<string, mixed>
     */
    public static function forAdmin(Wedding $wedding): array
    {
        $mediaItems = $wedding->mediaItems()->latest()->latest('id')->get();
        $moodboard = $mediaItems->firstWhere('collection', MediaItem::MOODBOARDS);
        $proposals = self::proposalsOf($wedding);
        $brief = $wedding->designBrief;
        $designBook = self::current($proposals)->firstWhere('type', Proposal::DESIGN_BOOK);

        return [
            'status' => self::status($wedding, $proposals),
            'brief' => $brief === null ? null : [
                'title' => $brief->title,
                'description' => $brief->description,
                'palette' => array_values($brief->palette ?? []),
                'avoid' => $brief->avoid,
                'updated_at' => $brief->updated_at?->toIso8601String(),
            ],
            'moodboard' => $moodboard === null ? null : self::image($moodboard, 'admin.wedding.design.media.show'),
            'inspirations' => $mediaItems
                ->where('collection', MediaItem::INSPIRATIONS)
                ->reverse()
                ->map(fn (MediaItem $item) => self::image($item, 'admin.wedding.design.media.show'))
                ->values()
                ->all(),
            'proposals' => self::present($proposals, forAdmin: true),
            'types' => collect(Proposal::TYPES)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'revisions' => [
                // The first design book is included, each later version is a revision.
                'used' => $designBook === null ? 0 : $designBook->version - 1,
                'max' => Setting::maxDesignRevisions(),
            ],
        ];
    }

    /**
     * The proposals as shown on the Design page of the couple, latest first.
     *
     * @return list<array<string, mixed>>
     */
    public static function proposalsForCouple(Wedding $wedding): array
    {
        return self::present(self::proposalsOf($wedding), forAdmin: false);
    }

    /**
     * Where the design of the wedding stands, from Jessica's point of view.
     *
     * @param  Collection<int, Proposal>  $proposals
     */
    public static function status(Wedding $wedding, Collection $proposals): string
    {
        if ($proposals->isEmpty()) {
            $hasShared = $wedding->designBrief()->exists() || $wedding->mediaItems()->exists();

            return $hasShared ? self::WAITING_FOR_PROPOSAL : self::WAITING_FOR_COUPLE;
        }

        $statuses = self::current($proposals)->map(fn (Proposal $proposal) => $proposal->status());

        return match (true) {
            $statuses->contains(Proposal::CHANGES_REQUESTED) => self::CHANGES_REQUESTED,
            $statuses->contains(Proposal::AWAITING) => self::AWAITING_COUPLE,
            default => self::APPROVED,
        };
    }

    /**
     * The proposals of a wedding with their file and conversation, latest
     * first.
     *
     * @return Collection<int, Proposal>
     */
    public static function proposalsOf(Wedding $wedding): Collection
    {
        return $wedding->proposals()
            ->with(['document', 'comments.author'])
            ->latest()
            ->latest('id')
            ->get();
    }

    /**
     * The latest version of each type: the ones the couple still has to
     * answer, older ones being replaced.
     *
     * @param  Collection<int, Proposal>  $proposals
     * @return Collection<int, Proposal>
     */
    public static function current(Collection $proposals): Collection
    {
        return $proposals->sortByDesc('version')->unique('type')->values();
    }

    /**
     * @param  Collection<int, Proposal>  $proposals
     * @return list<array<string, mixed>>
     */
    private static function present(Collection $proposals, bool $forAdmin): array
    {
        $currentIds = self::current($proposals)->pluck('id');
        $fileRoute = $forAdmin ? 'admin.wedding.design.proposals.file' : 'couple.design.proposals.file';
        $downloadRoute = $forAdmin ? 'admin.documents.download' : 'couple.documents.download';

        return $proposals->map(function (Proposal $proposal) use ($currentIds, $fileRoute, $downloadRoute): array {
            $document = $proposal->document;
            $hasFile = $document !== null && Storage::exists($document->file_path);

            return [
                'id' => $proposal->id,
                'type' => $proposal->type,
                'type_label' => Proposal::TYPES[$proposal->type] ?? $proposal->type,
                'title' => $proposal->title,
                'version' => $proposal->version,
                'description' => $proposal->description,
                'created_at' => $proposal->created_at->toIso8601String(),
                'approved_at' => $proposal->approved_at?->toIso8601String(),
                'status' => $proposal->status(),
                'is_current' => $currentIds->contains($proposal->id),
                'file' => $hasFile ? [
                    'url' => route($fileRoute, $proposal),
                    'download_url' => route($downloadRoute, $document),
                    'is_image' => str_starts_with((string) $document->mime_type, 'image/'),
                ] : null,
                'comments' => $proposal->comments
                    ->map(fn (ProposalComment $comment): array => [
                        'id' => $comment->id,
                        'body' => $comment->body,
                        'from_couple' => $comment->isFromCouple(),
                        'created_at' => $comment->created_at->toIso8601String(),
                    ])
                    ->values()
                    ->all(),
            ];
        })->values()->all();
    }

    /**
     * An image shared by the couple. `url` is null when the file is missing
     * from this computer's storage (shared database in development).
     *
     * @return array{id: int, url: string|null, alt: string, created_at: string}
     */
    private static function image(MediaItem $item, string $route): array
    {
        return [
            'id' => $item->id,
            'url' => Storage::exists($item->file_path) ? route($route, $item) : null,
            'alt' => $item->alt_text ?? $item->title,
            'created_at' => $item->created_at->toIso8601String(),
        ];
    }
}
