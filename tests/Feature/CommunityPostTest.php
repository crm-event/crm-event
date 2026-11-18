<?php

namespace Tests\Feature;

use App\Models\CommunityPost;
use App\Models\Couple;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityPostTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_post_belongs_to_its_author(): void
    {
        $user = User::factory()->create();
        $post = CommunityPost::factory()->for($user, 'author')->create();

        $this->assertTrue($post->author->is($user));
        $this->assertTrue($user->communityPosts->first()->is($post));
    }

    public function test_replies_are_linked_to_their_parent_oldest_first(): void
    {
        $post = CommunityPost::factory()->create();
        $laterReply = CommunityPost::factory()->replyTo($post)->create(['created_at' => now()->addMinutes(5)]);
        $firstReply = CommunityPost::factory()->replyTo($post)->create(['created_at' => now()->addMinute()]);

        $this->assertFalse($post->isReply());
        $this->assertTrue($firstReply->isReply());
        $this->assertTrue($firstReply->parent->is($post));
        $this->assertSame([$firstReply->id, $laterReply->id], $post->replies->pluck('id')->all());
    }

    public function test_the_top_level_scope_excludes_replies(): void
    {
        $post = CommunityPost::factory()->create();
        CommunityPost::factory()->replyTo($post)->create();

        $this->assertSame([$post->id], CommunityPost::topLevel()->pluck('id')->all());
    }

    public function test_deleting_a_post_deletes_its_replies(): void
    {
        $post = CommunityPost::factory()->create();
        $reply = CommunityPost::factory()->replyTo($post)->create();

        $post->delete();

        $this->assertModelMissing($reply);
    }

    public function test_deleting_an_account_keeps_its_posts_without_author(): void
    {
        $post = CommunityPost::factory()->create();

        $post->author->delete();

        $this->assertModelExists($post);
        $this->assertNull($post->fresh()->author);
    }

    public function test_the_couple_first_names_are_joined(): void
    {
        $couple = Couple::factory()->make([
            'partner1_first_name' => 'Marie',
            'partner2_first_name' => 'Paul',
        ]);
        $single = Couple::factory()->make([
            'partner1_first_name' => 'Marie',
            'partner2_first_name' => null,
        ]);

        $this->assertSame('Marie et Paul', $couple->firstNames());
        $this->assertSame('Marie', $single->firstNames());
    }
}
