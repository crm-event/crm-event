<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply the language of the visitor, so that every text, whether built by
 * the server (statuses, error messages) or by React (shared `locale` prop),
 * follows the language switcher.
 */
class SetLocale
{
    /**
     * The languages of the site, the first one being the default.
     *
     * @var list<string>
     */
    public const SUPPORTED_LOCALES = ['fr', 'en'];

    /**
     * Cookie keeping the language chosen with the switcher. It outlives the
     * session, so that the choice survives a logout.
     */
    public const COOKIE = 'locale';

    /**
     * How long the choice is kept: one year, in minutes.
     */
    public const COOKIE_MINUTES = 60 * 24 * 365;

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        App::setLocale(self::resolve($request));

        return $next($request);
    }

    /**
     * Language of the request: the back office always speaks French, as
     * Jessica does; anyone else gets the language chosen with the switcher,
     * otherwise the one a couple gave when asking for their space, otherwise
     * French.
     */
    public static function resolve(Request $request): string
    {
        $user = $request->user();

        if ($user?->hasRole(UserRole::Admin)) {
            return self::SUPPORTED_LOCALES[0];
        }

        $chosen = $request->cookie(self::COOKIE);

        if (self::isSupported($chosen)) {
            return $chosen;
        }

        $preferred = $user?->couple?->preferred_language;

        return self::isSupported($preferred) ? $preferred : self::SUPPORTED_LOCALES[0];
    }

    /**
     * Determine whether the given value is one of the languages of the site.
     */
    public static function isSupported(mixed $locale): bool
    {
        return in_array($locale, self::SUPPORTED_LOCALES, true);
    }
}
