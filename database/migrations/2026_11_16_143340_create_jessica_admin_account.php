<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Symfony\Component\Console\Output\ConsoleOutput;

/**
 * Open the back-office account of Jessica, with the e-mail address of
 * La Dernière Touche.
 *
 * No password is written here: the account gets a temporary code, shown
 * once in the output of `php artisan migrate`, which Jessica replaces with her
 * own password at her first login, as couples do.
 *
 * It does nothing in the test suite, whose databases must start empty, nor
 * when the account already exists.
 */
return new class extends Migration
{
    /**
     * Login of the account, the contact address of La Dernière Touche.
     */
    public const EMAIL = 'ladernieretouche.event@gmail.com';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        $temporaryCode = $this->createAccount();

        if ($temporaryCode !== null) {
            (new ConsoleOutput)->writeln(sprintf(
                '  <info>Compte de Jessica (%s), code temporaire à transmettre : %s</info>',
                self::EMAIL,
                $temporaryCode,
            ));
        }
    }

    /**
     * Create the account and return its temporary code, or null when an
     * account already uses the address.
     */
    public function createAccount(): ?string
    {
        if (User::query()->where('email', self::EMAIL)->exists()) {
            return null;
        }

        $jessica = new User(['name' => 'Jessica Salles', 'email' => self::EMAIL]);

        // Not mass assignable: a request must never set them. The back office
        // requires a verified address, which the address of the business is.
        $jessica->forceFill(['role' => UserRole::Admin, 'email_verified_at' => now()]);

        return $jessica->assignTemporaryPassword();
    }

    /**
     * Reverse the migrations: the account is kept, Jessica may already use it.
     */
    public function down(): void
    {
        //
    }
};
