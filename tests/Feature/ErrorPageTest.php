<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Illuminate\View\View;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Route::middleware('web')->group(function () {
            Route::get('/_test/forbidden', fn () => abort(403));
            Route::get('/_test/server-error', fn () => throw new RuntimeException('Test failure'));
        });
    }

    public function test_an_unknown_page_renders_the_custom_404_page(): void
    {
        $response = $this->get('/this-page-does-not-exist');

        $response->assertNotFound();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
        );
    }

    public function test_a_forbidden_page_renders_the_custom_403_page(): void
    {
        $response = $this->get('/_test/forbidden');

        $response->assertForbidden();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_a_server_error_renders_the_custom_500_page_in_production(): void
    {
        $this->app['env'] = 'production';

        $response = $this->get('/_test/server-error');

        $response->assertInternalServerError();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 500)
        );
    }

    public function test_a_server_error_keeps_the_laravel_page_in_local(): void
    {
        $this->app['env'] = 'local';

        $response = $this->get('/_test/server-error');

        $response->assertInternalServerError();
        $this->assertFalse(
            $response->original instanceof View && $response->original->name() === 'app',
            'The 500 error should not be rendered by the Inertia root view in local.',
        );
    }

    public function test_json_requests_keep_the_json_error_response(): void
    {
        $response = $this->getJson('/this-page-does-not-exist');

        $response->assertNotFound();
        $response->assertJsonStructure(['message']);
    }
}
