import type { ReactNode } from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { primaryButton, secondaryButton } from '@/ui/styles';

/**
 * Page « introuvable » du portail client.
 *
 * Deux usages, un seul écran :
 *  - <NotFoundPage /> est branchée sur la route attrape-tout `*` du routeur ;
 *  - <RouteErrorBoundary /> est l'`errorElement` du routeur : elle affiche le
 *    même écran pour un 404 renvoyé par une route, et un message générique
 *    pour toute autre erreur, au lieu de l'écran de debug de React Router.
 */

export function NotFoundPage() {
    return (
        <MessageLayout
            eyebrow="Erreur 404"
            title="Cette page n’existe pas."
            text="Le lien que vous avez suivi n’est plus valide, ou il a été recopié incomplètement."
        />
    );
}

export function RouteErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error) && error.status === 404) {
        return <NotFoundPage />;
    }

    return (
        <MessageLayout
            eyebrow="Erreur"
            title="Quelque chose s’est mal passé."
            text="La page n’a pas pu s’afficher. Réessayez dans un instant ; si cela se reproduit, prévenez Jessica."
        >
            {/* Le détail technique n'a d'intérêt qu'en développement : le
                couple, lui, n'a pas à lire une trace d'erreur. */}
            {import.meta.env.DEV && (
                <pre className="mt-10 max-w-lg overflow-x-auto border border-ink/10 bg-white p-4 text-left text-xs text-ink/60">
                    {error instanceof Error ? error.message : String(error)}
                </pre>
            )}
        </MessageLayout>
    );
}

/* -------------------------------------------------------------------------- */

function MessageLayout({
    eyebrow,
    title,
    text,
    children,
}: {
    eyebrow: string;
    title: string;
    text: string;
    children?: ReactNode;
}) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
            <img
                src="/logo-ldt.png"
                alt="La Dernière Touche"
                className="h-16 w-auto"
                width={285}
                height={560}
            />

            <p className="mt-10 text-[11px] uppercase tracking-brand text-sage">{eyebrow}</p>

            <h1 className="mt-6 font-display text-2xl leading-snug sm:text-3xl">{title}</h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">{text}</p>

            <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link to="/" className={primaryButton}>
                    Retour à l’accueil
                </Link>
                <Link to="/login" className={secondaryButton}>
                    Se connecter
                </Link>
            </div>

            {children}
        </main>
    );
}
