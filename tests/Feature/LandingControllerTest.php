<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guests_see_the_landing_page(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Landing')
            ->where('auth.user', null)
        );
    }

    public function test_the_home_route_is_the_site_root(): void
    {
        $this->assertSame(url('/'), route('home'));
    }
}
