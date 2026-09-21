<?php

namespace App\Http\Controllers\Api\V1\Client\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Client actuellement connecté.
     */
    public function __invoke(Request $request): ClientResource
    {
        return new ClientResource($request->user('client'));
    }
}
