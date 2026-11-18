<?php

namespace App\Enums;

/**
 * Role of a user account, stored in the `users.role` column.
 *
 * There is a single login system for the whole application: the role decides
 * which space the user lands on (see docs/bdd/README.md, decision D1).
 */
enum UserRole: string
{
    /** Jessica, who manages the back office. */
    case Admin = 'admin';

    /** A couple, who uses the client space. */
    case Couple = 'couple';

    /**
     * Name of the route where a user with this role lands after logging in.
     */
    public function homeRouteName(): string
    {
        return match ($this) {
            self::Admin => 'dashboard',
            self::Couple => 'couple.home',
        };
    }
}
