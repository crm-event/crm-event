import { Head, Link } from '@inertiajs/react';
import { focusRing, primaryButton, secondaryButton } from '@/brand';

/**
 * Error page, following the project's brand guidelines.
 *
 * It is rendered by the exception handler (bootstrap/app.php) instead of
 * Laravel's default pages: a couple must never land on a raw
 * "404 | Not Found" or on a stack trace.
 */

const MESSAGES = {
    404: {
        title: 'Cette page n’existe pas.',
        text: 'Le lien que vous avez suivi n’est plus valide, ou il a été recopié incomplètement.',
    },
    403: {
        title: 'Cette page ne vous est pas accessible.',
        text: 'Votre compte n’a pas accès à cette partie du site. Si cela vous semble anormal, dites-le à Jessica.',
    },
    405: {
        title: 'Cette page n’existe pas.',
        text: 'Le lien que vous avez suivi ne mène à aucune page.',
    },
    419: {
        title: 'Votre session a expiré.',
        text: 'Pour protéger votre compte, la page s’est fermée après un moment d’inactivité. Rechargez-la, puis recommencez.',
    },
    500: {
        title: 'Quelque chose s’est mal passé.',
        text: 'La page n’a pas pu s’afficher. Réessayez dans un instant ; si cela se reproduit, prévenez Jessica.',
    },
    503: {
        title: 'Le site est en maintenance.',
        text: 'Il sera de retour dans quelques minutes. Merci de votre patience.',
    },
};

const DEFAULT_MESSAGE = {
    title: 'Une erreur est survenue.',
    text: 'La page n’a pas pu s’afficher. Réessayez dans un instant.',
};

export default function Error({ status }) {
    const message = MESSAGES[status] ?? DEFAULT_MESSAGE;

    return (
        <>
            <Head title={`Erreur ${status}`} />

            <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 py-20 text-center font-sans text-ink">
                <Link href={route('home')} className={`${focusRing} block`}>
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
                    {message.title}
                </h1>

                <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
                    {message.text}
                </p>

                <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <Link href={route('home')} className={primaryButton}>
                        Retour à l’accueil
                    </Link>
                    <Link href={route('login')} className={secondaryButton}>
                        Se connecter
                    </Link>
                </div>
            </main>
        </>
    );
}
