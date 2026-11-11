<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply the language chosen with the language switcher (French by default),
 * so that the texts built by the server follow it.
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
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale');

        App::setLocale(in_array($locale, self::SUPPORTED_LOCALES, true) ? $locale : self::SUPPORTED_LOCALES[0]);

        return $next($request);
    }
}
