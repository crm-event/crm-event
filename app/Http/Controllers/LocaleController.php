<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Language chosen with the language switcher, kept in the session.
 */
class LocaleController extends Controller
{
    /**
     * Remember the language, then reload the page in that language.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(SetLocale::SUPPORTED_LOCALES)],
        ]);

        $request->session()->put('locale', $validated['locale']);

        return back();
    }
}
