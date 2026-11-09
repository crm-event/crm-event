import Icone from '@/Components/Icone';
import Dropdown from '@/Components/Dropdown';
import { focusRing } from '@/brand';
import { Link, router, usePage } from '@inertiajs/react';
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
 *
 * Pages are prefetched so that navigating feels instant, the database being
 * remote in development. Entries with `prefetchOnPress` mark data as read when
 * they are opened (messages, documents): they are only prefetched when the
 * button is pressed, never on a mere hover.
 */
const NAVIGATION_GROUPS = [
    {
        label: 'Votre mariage',
        entries: [
            { key: 'wedding', label: 'Notre mariage', icon: 'favorite', route: 'couple.home' },
            { key: 'design', label: 'Design', icon: 'palette', route: 'couple.design.index' },
            {
                key: 'documents',
                label: 'Documents',
                icon: 'description',
                route: 'couple.documents.index',
                prefetchOnPress: true,
            },
            { key: 'appointments', label: 'Rendez-vous', icon: 'event', route: 'couple.appointments.index' },
            {
                key: 'messages',
                label: 'Messages',
                icon: 'chat_bubble',
                route: 'couple.messages.index',
                prefetchOnPress: true,
            },
        ],
    },
    {
        label: 'Entre couples',
        entries: [
            {
                key: 'community',
                label: 'Communauté',
                icon: 'diversity_1',
                route: 'couple.community.index',
            },
        ],
    },
];

/** How long a prefetched page may be shown before being fetched again. */
const PREFETCH_CACHE_DURATION = '10s';

const entryClasses =
    'flex items-center gap-3 border-l-2 px-4 py-2.5 text-[15px] transition-colors';

const PAGE_LABELS = {
    wedding: 'Notre mariage',
    design: 'Design',
    documents: 'Documents',
    appointments: 'Rendez-vous',
    messages: 'Messages',
    community: 'Communauté',
    account: 'Mon compte',
};

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
            prefetch={entry.prefetchOnPress ? 'click' : 'hover'}
            cacheFor={PREFETCH_CACHE_DURATION}
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

function Sidebar({ activeKey }) {
    return (
        <div className="flex h-full flex-col bg-blush">
            <Link
                href={route('couple.home')}
                prefetch
                cacheFor={PREFETCH_CACHE_DURATION}
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

        </div>
    );
}

const notificationDateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * Bell of the couple space. The notifications are computed by the server from
 * the couple's data (HandleInertiaRequests): each one disappears once the
 * couple has dealt with it, e.g. read the message or opened the document.
 */
function NotificationsMenu() {
    const notifications = usePage().props.coupleNotifications ?? [];

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    aria-label={
                        notifications.length > 0
                            ? `Notifications (${notifications.length})`
                            : 'Notifications'
                    }
                    className={`${focusRing} relative rounded-lg p-2 text-sage transition-colors hover:bg-blush hover:text-ink`}
                >
                    <Icone nom="notifications" className="text-[20px]" />
                    {notifications.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-sage px-1 text-[9px] font-medium leading-none text-ivory">
                            {notifications.length}
                        </span>
                    )}
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content width="96" contentClasses="bg-white p-0">
                <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-brand text-sage">
                            Votre actualité
                        </p>
                        <p className="mt-1 font-display text-xl text-ink">
                            Notifications
                        </p>
                    </div>
                    <span className="rounded-full bg-blush px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage">
                        {notifications.length}{' '}
                        {notifications.length > 1 ? 'nouvelles' : 'nouvelle'}
                    </span>
                </div>

                {notifications.length > 0 ? (
                    <div className="divide-y divide-ink/10">
                        {notifications.map((notification) => (
                            <Link
                                key={notification.key}
                                href={route(notification.route)}
                                className={`${focusRing} flex gap-3 px-5 py-4 transition-colors hover:bg-blush/60`}
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-sage">
                                    <Icone nom={notification.icon} className="text-[19px]" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-ink">
                                        {notification.title}
                                    </span>
                                    <span className="mt-1 block text-sm leading-relaxed text-ink/65">
                                        {notification.text}
                                    </span>
                                    {notification.date && (
                                        <span className="mt-2 block text-[10px] uppercase tracking-[0.12em] text-sage">
                                            {notification.date_label}{' '}
                                            {notificationDateFormatter.format(new Date(notification.date))}
                                        </span>
                                    )}
                                </span>
                                <Icone nom="arrow_forward" className="self-center text-[16px] text-sage" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-10 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blush text-sage">
                            <Icone nom="done_all" className="text-[21px]" />
                        </span>
                        <p className="mt-4 font-display text-lg text-ink">Tout est à jour</p>
                        <p className="mt-1 text-sm text-ink/65">
                            Vous n’avez aucune notification en attente.
                        </p>
                    </div>
                )}
            </Dropdown.Content>
        </Dropdown>
    );
}

function ClientHeader({ active, user, isMenuOpen, onOpenMenu }) {
    const pageLabel = PAGE_LABELS[active] || 'Espace client';
    const initials = user.name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-white/90 px-4 shadow-[0_4px_18px_rgba(31,27,24,0.05)] backdrop-blur-md sm:px-6 lg:fixed lg:left-sidebar lg:right-0 lg:h-20 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    aria-label="Ouvrir la navigation"
                    aria-expanded={isMenuOpen}
                    onClick={onOpenMenu}
                    className={`${focusRing} rounded-lg p-2 text-sage transition-colors hover:bg-blush hover:text-ink lg:hidden`}
                >
                    <Icone nom="menu" className="text-[22px]" />
                </button>

                <div className="min-w-0">
                    <p className="hidden text-[10px] uppercase tracking-brand text-sage sm:block">
                        Espace client
                    </p>
                    <p className="truncate font-display text-lg text-ink sm:mt-0.5 sm:text-xl">
                        {pageLabel}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <button
                    type="button"
                    aria-label="Changer de langue"
                    title="Bientôt disponible"
                    className={`${focusRing} inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] uppercase tracking-[0.16em] text-sage transition-colors hover:bg-blush hover:text-ink`}
                >
                    <Icone nom="language" className="text-[18px]" />
                    <span className="hidden sm:inline">FR</span>
                </button>

                <span className="hidden h-6 w-px bg-ink/10 sm:block" />

                <NotificationsMenu />

                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            aria-label={`Profil de ${user.name}`}
                            className={`${focusRing} flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-blush`}
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-xs text-ivory">
                                {initials}
                            </span>
                            <span className="hidden max-w-32 truncate text-sm text-ink lg:block">
                                {user.name}
                            </span>
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content contentClasses="bg-white p-2">
                        <div className="border-b border-ink/10 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-brand text-sage">
                                Votre espace
                            </p>
                            <p className="mt-1 truncate font-display text-base text-ink">
                                {user.name}
                            </p>
                        </div>
                        <Dropdown.Link
                            href={route('profile.edit')}
                            prefetch
                            cacheFor={PREFETCH_CACHE_DURATION}
                            className="mt-1 rounded-md px-3 py-2 text-ink hover:bg-blush focus:bg-blush"
                        >
                            <span className="flex items-center gap-3">
                                <Icone
                                    nom="person"
                                    className="text-[18px] text-sage"
                                />
                                Mon compte
                            </span>
                        </Dropdown.Link>
                        <Dropdown.Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-md px-3 py-2 text-ink hover:bg-blush focus:bg-blush"
                        >
                            <span className="flex items-center gap-3">
                                <Icone
                                    nom="logout"
                                    className="text-[18px] text-sage"
                                />
                                Se déconnecter
                            </span>
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}

export default function CoupleLayout({ active = 'wedding', children }) {
    const user = usePage().props.auth.user;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Inertia keeps prefetched pages even after a form is sent: forget them so
    // that a page never shows data older than the message or post just sent.
    useEffect(
        () =>
            router.on('finish', (event) => {
                if (event.detail.visit.method !== 'get') {
                    router.flushAll();
                }
            }),
        [],
    );

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
                <Sidebar activeKey={active} />
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
                        <Sidebar activeKey={active} />
                    </aside>
                </div>
            )}

            <ClientHeader
                active={active}
                user={user}
                isMenuOpen={isMenuOpen}
                onOpenMenu={() => setIsMenuOpen(true)}
            />

            <main className="lg:pl-sidebar">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 lg:pt-36 lg:pb-16">
                    {children}
                </div>
            </main>
        </div>
    );
}
