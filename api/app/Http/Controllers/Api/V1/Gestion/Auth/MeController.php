<?php

namespace App\Http\Controllers\Api\V1\Gestion\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\CoordinatorResource;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Coordinatrice actuellement connectée.
     */
    public function __invoke(Request $request): CoordinatorResource
    {
        return new CoordinatorResource($request->user('coordinator'));
    }
}
