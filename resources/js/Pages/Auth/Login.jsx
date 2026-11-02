import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    anneauFocus,
    boutonPrincipal,
    champSaisie,
    libelleChamp,
    lienTexte,
} from '@/charte';

/**
 * Page de connexion, dans la charte du projet.
 *
 * C'est l'unique page de connexion de l'application : les couples comme
 * Jessica passent par elle. Il n'y a volontairement aucun lien d'inscription,
 * les comptes sont créés à la main par la coordinatrice ; un visiteur sans
 * compte est renvoyé vers la section « Votre accès » de la page d'accueil.
 *
 * Le formulaire et sa soumission sont ceux de Breeze
 * (AuthenticatedSessionController), seule la présentation change.
 */
export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [motDePasseVisible, setMotDePasseVisible] = useState(false);

    const soumettre = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Connexion" />

            <div className="grid min-h-screen bg-ivory font-sans text-ink lg:grid-cols-[5fr_7fr]">
                <PanneauMarque />

                <main className="flex flex-col px-6 py-8 sm:px-10">
                    <Link
                        href={route('accueil')}
                        className={`${anneauFocus} self-start text-[11px] uppercase tracking-[0.18em] text-sage transition-colors hover:text-ink`}
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

                        <form onSubmit={soumettre} className="mt-10">
                            <div>
                                <label htmlFor="email" className={libelleChamp}>
                                    Adresse e-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`${champSaisie} mt-2`}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'erreur-email' : undefined}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <MessageErreur id="erreur-email" message={errors.email} />
                            </div>

                            <div className="mt-8">
                                <div className="flex items-baseline justify-between gap-4">
                                    <label htmlFor="password" className={libelleChamp}>
                                        Mot de passe
                                    </label>
                                    <button
                                        type="button"
                                        className={`${anneauFocus} text-[10px] uppercase tracking-[0.18em] text-sage transition-colors hover:text-ink`}
                                        aria-controls="password"
                                        aria-pressed={motDePasseVisible}
                                        onClick={() => setMotDePasseVisible((visible) => !visible)}
                                    >
                                        {motDePasseVisible ? 'Masquer' : 'Afficher'}
                                    </button>
                                </div>
                                <input
                                    id="password"
                                    type={motDePasseVisible ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className={`${champSaisie} mt-2`}
                                    autoComplete="current-password"
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? 'erreur-password' : undefined}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <MessageErreur id="erreur-password" message={errors.password} />
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
                                    <Link href={route('password.request')} className={`${lienTexte} text-ink/70`}>
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                className={`${boutonPrincipal} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
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
                                <a href={`${route('accueil')}#acces`} className={`${lienTexte} text-ink`}>
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
 * Colonne de gauche sur grand écran : le logo et la devise de la cliente.
 * Elle disparaît sur mobile, où le logo passe au-dessus du formulaire.
 */
function PanneauMarque() {
    return (
        <aside className="hidden flex-col justify-between bg-blush px-14 py-12 lg:flex">
            <Link href={route('accueil')} className={`${anneauFocus} block self-start`}>
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
 * Message d'erreur renvoyé par le serveur sous un champ. Il reste dans la
 * charte (pas de rouge) : le soulignement du champ passe au noir et le
 * message est annoncé aux lecteurs d'écran.
 */
function MessageErreur({ id, message }) {
    if (!message) {
        return null;
    }

    return (
        <p id={id} role="alert" className="mt-3 text-sm leading-relaxed text-ink">
            {message}
        </p>
    );
}
