<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $couple = $request->user()->couple;

        return Inertia::render('Couple/Home', [
            'couple' => $couple?->only([
                'partner1_first_name',
                'partner2_first_name',
            ]),
            'documents' => [
                'total' => $couple?->documents()->count() ?? 0,
                'unseen' => $couple?->documents()->unseen()->count() ?? 0,
                'to_sign' => $couple?->documents()->pendingApproval()->count() ?? 0,
            ],
        ]);
    }
}
