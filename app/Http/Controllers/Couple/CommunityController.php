<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\Couple\StoreCommunityPostRequest;
use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Community space shared by all couples: a feed of messages, each with its
 * replies.
 */
class CommunityController extends Controller
{
    /**
     * Number of top-level messages per page.
     */
    public const POSTS_PER_PAGE = 10;

    /**
     * Display the feed, newest messages first.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();

        $posts = CommunityPost::query()
            ->topLevel()
            ->with(['author.couple', 'replies.author.couple'])
            ->latest()
            ->paginate(self::POSTS_PER_PAGE)
            ->through(fn (CommunityPost $post) => [
                ...$this->present($post, $currentUser),
                'replies' => $post->replies
                    ->map(fn (CommunityPost $reply) => $this->present($reply, $currentUser))
                    ->all(),
            ]);

        return Inertia::render('Couple/Community', [
            'posts' => $posts,
            'maxBodyLength' => StoreCommunityPostRequest::MAX_BODY_LENGTH,
        ]);
    }

    /**
     * Publish a new message, or a reply when `parent_id` is given.
     */
    public function store(StoreCommunityPostRequest $request): RedirectResponse
    {
        $request->user()->communityPosts()->create($request->validated());

        return to_route('couple.community.index');
    }

    /**
     * Delete one of the user's own messages, with its replies.
     */
    public function destroy(CommunityPost $communityPost): RedirectResponse
    {
        Gate::authorize('delete', $communityPost);

        $communityPost->delete();

        return back();
    }

    /**
     * Data of a message as sent to the page. Couples only see each other's
     * first names, never their e-mail address.
     *
     * @return array{id: int, body: string, author: string|null, is_own: bool, created_at: string}
     */
    private function present(CommunityPost $post, User $currentUser): array
    {
        return [
            'id' => $post->id,
            'body' => $post->body,
            'author' => $post->author?->couple?->firstNames() ?? $post->author?->name,
            'is_own' => $post->user_id === $currentUser->id,
            'created_at' => $post->created_at->toIso8601String(),
        ];
    }
}
