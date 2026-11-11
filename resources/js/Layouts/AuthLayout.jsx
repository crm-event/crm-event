import { focusRing } from '@/brand';
import { Link } from '@inertiajs/react';

/**
 * Shell of the authentication pages (login, forgotten password, password
 * reset): the client's logo and motto on the left on large screens, the form
 * on the right.
 *
 * `caption` is the small uppercase title above the heading, `title` the main
 * heading and `intro` the sentence below it.
 */
export default function AuthLayout({ caption, title, intro, children }) {
    return (
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
                        {caption}
                    </p>

                    <h1 className="mt-6 font-display text-3xl leading-snug">{title}</h1>

                    {intro && (
                        <p className="mt-5 text-sm leading-relaxed text-ink/70">{intro}</p>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * Status message sent back by the server (e.g. "reset link sent").
 */
export function StatusMessage({ message }) {
    if (!message) {
        return null;
    }

    return (
        <p
            role="status"
            className="mt-8 border-l-2 border-sage bg-blush px-4 py-3 text-sm leading-relaxed"
        >
            {message}
        </p>
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
