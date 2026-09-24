import { Head, Link } from '@inertiajs/react';
import { anneauFocus, boutonPrincipal, boutonSecondaire } from '@/charte';

/**
 * Page d'erreur du site, dans la charte du projet.
 *
 * Elle est rendue par le gestionnaire d'exceptions (bootstrap/app.php) à la
 * place des pages par défaut de Laravel : un couple ne doit jamais tomber sur
 * un « 404 | Not Found » brut ni sur une trace technique.
 */

const MESSAGES = {
    404: {
        titre: 'Cette page n’existe pas.',
        texte: 'Le lien que vous avez suivi n’est plus valide, ou il a été recopié incomplètement.',
    },
    403: {
        titre: 'Cette page ne vous est pas accessible.',
        texte: 'Votre compte n’a pas accès à cette partie du site. Si cela vous semble anormal, dites-le à Jessica.',
    },
    500: {
        titre: 'Quelque chose s’est mal passé.',
        texte: 'La page n’a pas pu s’afficher. Réessayez dans un instant ; si cela se reproduit, prévenez Jessica.',
    },
    503: {
        titre: 'Le site est en maintenance.',
        texte: 'Il sera de retour dans quelques minutes. Merci de votre patience.',
    },
};

const PAR_DEFAUT = {
    titre: 'Une erreur est survenue.',
    texte: 'La page n’a pas pu s’afficher. Réessayez dans un instant.',
};

export default function Error({ status }) {
    const message = MESSAGES[status] ?? PAR_DEFAUT;

    return (
        <>
            <Head title={`Erreur ${status}`} />

            <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 py-20 text-center font-sans text-ink">
                <Link href="/" className={`${anneauFocus} block`}>
                    <img
                        src="/logo-ldt.png"
                        alt="La Dernière Touche"
                        className="h-16 w-auto"
                        width={285}
                        height={560}
                    />
                </Link>

                <p className="mt-10 text-[11px] uppercase tracking-brand text-sage">
                    Erreur {status}
                </p>

                <h1 className="mt-6 font-display text-2xl leading-snug sm:text-3xl">
                    {message.titre}
                </h1>

                <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
                    {message.texte}
                </p>

                <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <Link href="/" className={boutonPrincipal}>
                        Retour à l’accueil
                    </Link>
                    <Link href={route('login')} className={boutonSecondaire}>
                        Se connecter
                    </Link>
                </div>
            </main>
        </>
    );
}
