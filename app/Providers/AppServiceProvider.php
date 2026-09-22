<?php

namespace App\Providers;

use App\Models\Couple;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

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

        // Demandes de réinitialisation : 3 par minute et par IP.
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
     * Le lien reçu par mail doit mener à la page de réinitialisation du bon
     * espace : les deux ont leur propre route, sous des préfixes distincts.
     */
    protected function configureResetPasswordUrls(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $route = $notifiable instanceof Couple
                ? 'portail.password.reset'
                : 'gestion.password.reset';

            return route($route, ['token' => $token]).'?'.http_build_query([
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });
    }
}
