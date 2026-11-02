<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the home page of the couple space, where a couple lands after
     * logging in.
     */
    public function __invoke(Request $request): Response
    {
        $couple = $request->user()->couple;

        return Inertia::render('Couple/Home', [
            'couple' => $couple?->only([
                'partner1_first_name',
                'partner2_first_name',
            ]),
        ]);
    }
}
