<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to the given roles, e.g. `->middleware('role:couple')`.
 *
 * Must be placed after the `auth` middleware. A logged-in user without the
 * right role gets a 403, rendered by the custom error page.
 */
class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $allowedRoles = array_map(UserRole::from(...), $roles);

        abort_unless($request->user()?->hasRole(...$allowedRoles), 403);

        return $next($request);
    }
}
