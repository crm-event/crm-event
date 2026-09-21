<?php

namespace App\Http\Resources;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation d'un client, utilisée par les deux zones (fiche CRM côté
 * gestion, profil côté portail). Ne jamais y exposer de champ sensible.
 *
 * @mixin Client
 */
class ClientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'company' => $this->company,
            'phone' => $this->phone,
            'is_activated' => $this->isActivated(),
            'activated_at' => $this->activated_at,
            'created_at' => $this->created_at,
        ];
    }
}
