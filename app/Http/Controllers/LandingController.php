<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Display the public landing page, the first screen a visitor sees
     * before logging in.
     */
    public function __invoke(): Response
    {
        return Inertia::render('Landing');
    }
}
