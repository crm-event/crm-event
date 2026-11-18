<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps a user with a temporary password on the page where they choose their
 * own: until then, they can only open that page or log out.
 */
class EnsurePasswordIsChosen
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->must_change_password && ! $request->routeIs('password.first.*', 'logout')) {
            return to_route('password.first.edit');
        }

        return $next($request);
    }
}
