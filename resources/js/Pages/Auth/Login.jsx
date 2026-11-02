import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    fieldLabel,
    focusRing,
    primaryButton,
    textField,
    textLink,
} from '@/brand';

/**
 * Login page, following the project's brand guidelines.
 *
 * This is the only login page of the application: couples and Jessica both
 * use it. There is deliberately no sign-up link, accounts are created by hand
 * by the coordinator; a visitor without an account is sent to the "Votre
 * accès" section of the landing page.
 *
 * The form and its submission are Breeze's (AuthenticatedSessionController),
 * only the presentation changes.
 */
export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Connexion" />

            <div className="grid min-h-screen bg-ivory font-sans text-ink lg:grid-cols-[5fr_7fr]">
                <BrandPanel />

                <main className="flex flex-col px-6 py-8 sm:px-10">
                    <Link
                        href={route('home')}
                        className={`${focusRing} self-start text-[11px] uppercase tracking-[0.18em] text-sage transition-colors hover:text-ink`}
                    >
                        ← Accueil
                    </Link>

                    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
                        <img
                            src="/logo-ldt.png"
                            alt="La Dernière Touche"
                            className="mx-auto mb-12 h-16 w-auto lg:hidden"
                            width={285}
                            height={560}
                        />

                        <p className="text-[11px] uppercase tracking-brand text-sage">
                            Connexion
                        </p>

                        <h1 className="mt-6 font-display text-3xl leading-snug">
                            Heureux de vous revoir.
                        </h1>

                        <p className="mt-5 text-sm leading-relaxed text-ink/70">
                            Connectez-vous avec l’adresse e-mail et le mot de passe
                            de votre compte.
                        </p>

                        {status && (
                            <p
                                role="status"
                                className="mt-8 border-l-2 border-sage bg-blush px-4 py-3 text-sm leading-relaxed"
                            >
                                {status}
                            </p>
                        )}

                        <form onSubmit={submit} className="mt-10">
                            <div>
                                <label htmlFor="email" className={fieldLabel}>
                                    Adresse e-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`${textField} mt-2`}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <ErrorMessage id="email-error" message={errors.email} />
                            </div>

                            <div className="mt-8">
                                <div className="flex items-baseline justify-between gap-4">
                                    <label htmlFor="password" className={fieldLabel}>
                                        Mot de passe
                                    </label>
                                    <button
                                        type="button"
                                        className={`${focusRing} text-[10px] uppercase tracking-[0.18em] text-sage transition-colors hover:text-ink`}
                                        aria-controls="password"
                                        aria-pressed={isPasswordVisible}
                                        onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                                    >
                                        {isPasswordVisible ? 'Masquer' : 'Afficher'}
                                    </button>
                                </div>
                                <input
                                    id="password"
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className={`${textField} mt-2`}
                                    autoComplete="current-password"
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <ErrorMessage id="password-error" message={errors.password} />
                            </div>

                            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        className="size-4 rounded-none border-ink/30 text-ink focus:ring-sage"
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="text-ink/70">Rester connecté</span>
                                </label>

                                {canResetPassword && (
                                    <Link href={route('password.request')} className={`${textLink} text-ink/70`}>
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                className={`${primaryButton} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
                                disabled={processing}
                            >
                                {processing ? 'Connexion…' : 'Se connecter'}
                            </button>
                        </form>

                        <div className="mt-14 border-t border-ink/10 pt-8">
                            <p className="font-display text-lg leading-snug">
                                Pas encore d’accès ?
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">
                                Il n’y a pas d’inscription libre : chaque espace est
                                ouvert par Jessica, pour un couple et un mariage.{' '}
                                <a href={`${route('home')}#access`} className={`${textLink} text-ink`}>
                                    Demander le vôtre
                                </a>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

/**
 * Left column on large screens: the client's logo and motto.
 * It is hidden on mobile, where the logo moves above the form.
 */
function BrandPanel() {
    return (
        <aside className="hidden flex-col justify-between bg-blush px-14 py-12 lg:flex">
            <Link href={route('home')} className={`${focusRing} block self-start`}>
                <span className="block font-display text-base tracking-[0.18em]">
                    LA DERNIÈRE TOUCHE
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                    Maison de mariage
                </span>
            </Link>

            <div>
                <img
                    src="/logo-ldt.png"
                    alt=""
                    className="h-36 w-auto"
                    width={285}
                    height={560}
                />
                <p className="mt-12 max-w-xs font-display text-2xl italic leading-snug text-ink/80">
                    « Faire de votre mariage, votre endroit préféré au monde. »
                </p>
            </div>

            <p className="text-[11px] uppercase tracking-[0.18em] text-sage">
                Wedding design · Coordination · Officiante
            </p>
        </aside>
    );
}

/**
 * Server-side error message displayed under a field. It stays within the
 * brand palette (no red): the field underline turns black and the message is
 * announced to screen readers.
 */
function ErrorMessage({ id, message }) {
    if (!message) {
        return null;
    }

    return (
        <p id={id} role="alert" className="mt-3 text-sm leading-relaxed text-ink">
            {message}
        </p>
    );
}
