<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the home page of the couple space, where a couple lands after
     * logging in.
     */
    public function __invoke(): Response
    {
        return Inertia::render('Couple/Home');
    }
}
