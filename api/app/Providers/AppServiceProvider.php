<?php

namespace App\Providers;

use App\Models\Client;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configurePasswords();
        $this->configureResetPasswordUrls();
    }

    protected function configureRateLimiting(): void
    {
        // 5 tentatives de connexion par minute et par couple email + IP.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(
                Str::lower((string) $request->input('email')).'|'.$request->ip(),
            );
        });

        // Demandes de reset : 3 par minute et par IP.
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });
    }

    protected function configurePasswords(): void
    {
        Password::defaults(function () {
            $rule = Password::min(8);

            return $this->app->isProduction()
                ? $rule->min(12)->letters()->numbers()->uncompromised()
                : $rule;
        });
    }

    /**
     * Le lien de reset envoyé par mail doit pointer vers le bon front.
     */
    protected function configureResetPasswordUrls(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = $notifiable instanceof Client
                ? config('frontend.client_url')
                : config('frontend.gestion_url');

            return $frontend.'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });
    }
}
