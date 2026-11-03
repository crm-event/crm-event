<?php

namespace App\Policies;

use App\Models\CommunityPost;
use App\Models\User;

/**
 * Who can act on a message of the community space.
 *
 * Reading and posting are open to every couple (the route already requires
 * the couple role); only deletion needs a rule.
 */
class CommunityPostPolicy
{
    /**
     * Determine whether the user can delete the message: only its author.
     */
    public function delete(User $user, CommunityPost $communityPost): bool
    {
        return $communityPost->user_id === $user->id;
    }
}
