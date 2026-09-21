<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Simule une requête émise par la SPA gestion (domaine stateful Sanctum),
     * ce qui active la session + CSRF comme dans le navigateur.
     */
    protected function fromGestion(): static
    {
        return $this->withHeader('Referer', config('frontend.gestion_url'));
    }

    /**
     * Simule une requête émise par la SPA portail client.
     */
    protected function fromClientPortal(): static
    {
        return $this->withHeader('Referer', config('frontend.client_url'));
    }
}
