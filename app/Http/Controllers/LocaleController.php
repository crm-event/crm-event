<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Language chosen with the language switcher (LanguageSwitcher.jsx).
 */
class LocaleController extends Controller
{
    /**
     * Remember the language in a cookie, then reload the page in that language.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(SetLocale::SUPPORTED_LOCALES)],
        ]);

        return back()->withCookie(cookie(SetLocale::COOKIE, $validated['locale'], SetLocale::COOKIE_MINUTES));
    }
}
