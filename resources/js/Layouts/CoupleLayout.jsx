import Icone from '@/Components/Icone';
import { focusRing } from '@/brand';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Shell of the couple space: navigation on the left, content on the right.
 *
 * It follows the structure of the back office (BackOfficeLayout) so that the
 * application feels like one product, but with the softer look of the public
 * pages: blush panel, serif titles, no search bar, no business vocabulary.
 *
 * Entries without a `route` are not built yet: they are displayed, but
 * disabled, so the couple can already see what the space will contain.
 */
const NAVIGATION_GROUPS = [
    {
        label: 'Votre mariage',
        entries: [
            { key: 'home', label: 'Accueil', icon: 'home', route: 'couple.home' },
            { key: 'wedding', label: 'Notre mariage', icon: 'favorite' },
            { key: 'design', label: 'Design', icon: 'palette' },
            { key: 'documents', label: 'Documents', icon: 'description' },
            { key: 'appointments', label: 'Rendez-vous', icon: 'event' },
            { key: 'messages', label: 'Messages', icon: 'chat_bubble' },
        ],
    },
    {
        label: 'Entre couples',
        entries: [
            { key: 'community', label: 'Communauté', icon: 'diversity_1' },
        ],
    },
];

const entryClasses =
    'flex items-center gap-3 border-l-2 px-4 py-2.5 text-[15px] transition-colors';

function NavigationEntry({ entry, isActive }) {
    const content = (
        <>
            <Icone nom={entry.icon} className="text-[20px]" />
            <span className="flex-1">{entry.label}</span>
        </>
    );

    if (!entry.route) {
        return (
            <span
                className={`${entryClasses} cursor-not-allowed border-transparent text-ink/35`}
                aria-disabled="true"
                title="Bientôt disponible"
            >
                {content}
                <span className="text-[9px] uppercase tracking-[0.18em]">Bientôt</span>
            </span>
        );
    }

    return (
        <Link
            href={route(entry.route)}
            aria-current={isActive ? 'page' : undefined}
            className={`${focusRing} ${entryClasses} ${
                isActive
                    ? 'border-sage bg-ivory text-ink'
                    : 'border-transparent text-ink/70 hover:bg-ivory/60 hover:text-ink'
            }`}
        >
            {content}
        </Link>
    );
}

function Sidebar({ activeKey, user }) {
    return (
        <div className="flex h-full flex-col bg-blush">
            <Link
                href={route('couple.home')}
                className={`${focusRing} flex h-24 shrink-0 items-center gap-4 border-b border-ink/10 px-6`}
            >
                <img
                    src="/logo-ldt.png"
                    alt=""
                    className="h-12 w-auto"
                    width={285}
                    height={560}
                />
                <span>
                    <span className="block whitespace-nowrap font-display text-[12px] tracking-[0.14em]">
                        LA DERNIÈRE TOUCHE
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                        Espace client
                    </span>
                </span>
            </Link>

            <nav aria-label="Navigation de l’espace client" className="flex-1 overflow-y-auto py-6">
                {NAVIGATION_GROUPS.map((group) => (
                    <div key={group.label} className="mb-6 last:mb-0">
                        <p className="mb-2 px-6 text-[10px] uppercase tracking-brand text-sage">
                            {group.label}
                        </p>
                        <ul className="space-y-0.5 px-2">
                            {group.entries.map((entry) => (
                                <li key={entry.key}>
                                    <NavigationEntry
                                        entry={entry}
                                        isActive={entry.key === activeKey}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="shrink-0 border-t border-ink/10 px-6 py-5">
                <p className="truncate font-display text-base">{user.name}</p>
                <div className="mt-3 flex items-center gap-5 text-[10px] uppercase tracking-[0.18em] text-sage">
                    <Link
                        href={route('profile.edit')}
                        className={`${focusRing} transition-colors hover:text-ink`}
                    >
                        Mon compte
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`${focusRing} uppercase tracking-[0.18em] transition-colors hover:text-ink`}
                    >
                        Se déconnecter
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CoupleLayout({ active = 'home', children }) {
    const user = usePage().props.auth.user;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!isMenuOpen) {
            return undefined;
        }

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('keydown', closeOnEscape);

        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [isMenuOpen]);

    return (
        <div className="min-h-screen bg-ivory font-sans text-ink antialiased">
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-sidebar border-r border-ink/10 lg:block">
                <Sidebar activeKey={active} user={user} />
            </aside>

            {isMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-ink/30"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <aside className="relative h-full w-sidebar max-w-[85vw] border-r border-ink/10">
                        <button
                            type="button"
                            aria-label="Fermer la navigation"
                            onClick={() => setIsMenuOpen(false)}
                            className={`${focusRing} absolute left-full top-3 ml-1 p-2 text-ivory hover:opacity-80`}
                        >
                            <Icone nom="close" className="text-[22px]" />
                        </button>
                        <Sidebar activeKey={active} user={user} />
                    </aside>
                </div>
            )}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/10 bg-ivory/95 px-4 backdrop-blur-md sm:px-6 lg:hidden">
                <Link href={route('couple.home')} className={`${focusRing} flex items-center gap-3`}>
                    <img
                        src="/logo-ldt.png"
                        alt=""
                        className="h-9 w-auto"
                        width={285}
                        height={560}
                    />
                    <span className="font-display text-[12px] tracking-[0.16em]">
                        LA DERNIÈRE TOUCHE
                    </span>
                </Link>
                <button
                    type="button"
                    aria-label="Ouvrir la navigation"
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen(true)}
                    className={`${focusRing} p-2 text-sage hover:text-ink`}
                >
                    <Icone nom="menu" className="text-[24px]" />
                </button>
            </header>

            <main className="lg:pl-sidebar">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 lg:py-16">
                    {children}
                </div>
            </main>
        </div>
    );
}
