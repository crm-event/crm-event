<?php

namespace Tests\Feature\Couple;

use App\Http\Controllers\Couple\CommunityController;
use App\Models\CommunityPost;
use App\Models\Couple;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CommunityControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_a_couple_sees_the_feed_with_first_names_and_replies(): void
    {
        $author = Couple::factory()->withPortalAccess()->create([
            'partner1_first_name' => 'Marie',
            'partner2_first_name' => 'Paul',
        ]);
        $post = CommunityPost::factory()->for($author->user, 'author')->create(['body' => 'Bonjour à tous']);
        CommunityPost::factory()->replyTo($post)->create(['body' => 'Bienvenue !']);

        $reader = User::factory()->create();

        $response = $this->actingAs($reader)->get(route('couple.community.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Couple/Community')
            ->has('posts.data', 1)
            ->where('posts.data.0.body', 'Bonjour à tous')
            ->where('posts.data.0.author', 'Marie et Paul')
            ->where('posts.data.0.is_own', false)
            ->has('posts.data.0.replies', 1)
            ->where('posts.data.0.replies.0.body', 'Bienvenue !')
            ->missing('posts.data.0.email')
        );
    }

    public function test_the_feed_shows_the_newest_messages_first_and_is_paginated(): void
    {
        $oldest = CommunityPost::factory()->create(['created_at' => now()->subDays(2)]);
        // One full page with the newest message, the oldest one alone on page 2.
        CommunityPost::factory()
            ->count(CommunityController::POSTS_PER_PAGE - 1)
            ->create(['created_at' => now()->subDay()]);
        $newest = CommunityPost::factory()->create();

        $response = $this->actingAs(User::factory()->create())->get(route('couple.community.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', CommunityController::POSTS_PER_PAGE)
            ->where('posts.data.0.id', $newest->id)
            ->where('posts.last_page', 2)
        );

        $secondPage = $this->get(route('couple.community.index', ['page' => 2]));

        $secondPage->assertInertia(fn (Assert $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $oldest->id)
        );
    }

    public function test_a_couple_can_publish_a_message(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('couple.community.store'), [
            'body' => '  Quelqu’un connaît un bon DJ ?  ',
        ]);

        $response->assertRedirect(route('couple.community.index'));
        $this->assertDatabaseHas('community_posts', [
            'user_id' => $user->id,
            'parent_id' => null,
            'body' => 'Quelqu’un connaît un bon DJ ?',
        ]);
    }

    public function test_a_couple_can_reply_to_a_message(): void
    {
        $post = CommunityPost::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('couple.community.store'), [
            'body' => 'Oui, je vous envoie son contact.',
            'parent_id' => $post->id,
        ]);

        $this->assertDatabaseHas('community_posts', [
            'user_id' => $user->id,
            'parent_id' => $post->id,
        ]);
    }

    public function test_a_reply_cannot_target_another_reply(): void
    {
        $post = CommunityPost::factory()->create();
        $reply = CommunityPost::factory()->replyTo($post)->create();

        $response = $this->actingAs(User::factory()->create())->post(route('couple.community.store'), [
            'body' => 'Réponse à une réponse',
            'parent_id' => $reply->id,
        ]);

        $response->assertSessionHasErrors('parent_id');
        $this->assertDatabaseCount('community_posts', 2);
    }

    public function test_an_empty_or_too_long_message_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('couple.community.store'), ['body' => '    '])
            ->assertSessionHasErrors(['body' => 'Votre message est vide.']);

        $this->actingAs($user)
            ->post(route('couple.community.store'), ['body' => str_repeat('a', 2001)])
            ->assertSessionHasErrors('body');

        $this->assertDatabaseCount('community_posts', 0);
    }

    public function test_a_couple_can_delete_its_own_message(): void
    {
        $post = CommunityPost::factory()->create();

        $response = $this->actingAs($post->author)->delete(route('couple.community.destroy', $post));

        $response->assertRedirect();
        $this->assertModelMissing($post);
    }

    public function test_a_couple_cannot_delete_someone_else_s_message(): void
    {
        $post = CommunityPost::factory()->create();

        $response = $this->actingAs(User::factory()->create())->delete(route('couple.community.destroy', $post));

        $response->assertForbidden();
        $this->assertModelExists($post);
    }

    public function test_the_admin_and_guests_cannot_open_the_community(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('couple.community.index'))
            ->assertForbidden();

        auth()->logout();

        $this->get(route('couple.community.index'))->assertRedirect(route('login'));
    }
}
