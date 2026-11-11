import Icone from '@/Components/Icone';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { focusRing, primaryButton, secondaryButton } from '@/brand';
import { CONTACT } from '@/contact';
import { useTranslation } from '@/i18n';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const navLink = `${focusRing} text-[11px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink`;

const footerLink = `${focusRing} transition-colors hover:text-ink`;

/** Buttons of the header, hidden on phones where they move to the menu. */
const headerButton = `${focusRing} hidden items-center justify-center px-5 py-3.5 text-[11px] uppercase tracking-[0.18em] md:inline-flex`;

const headerPrimaryButton = `${headerButton} bg-ink text-ivory transition-opacity hover:opacity-80`;

const headerSecondaryButton = `${headerButton} border border-ink/20 transition-colors hover:border-ink`;

/**
 * Sections of the landing page reached from the menu. The links are absolute,
 * so that they also work from the other public pages.
 */
function useNavigationItems() {
    const { t } = useTranslation();

    return [
        { href: `${route('home')}#prestations`, label: t('site.nav.services') },
        { href: `${route('home')}#espace-client`, label: t('site.nav.clientArea') },
        { href: `${route('home')}#a-propos`, label: t('site.nav.about') },
        { href: `${route('home')}#contact`, label: t('site.nav.contact') },
    ];
}

/**
 * Shell of the public pages (landing page, access request, legal notice): the
 * header with the language switcher, the access request and login buttons,
 * and the footer.
 */
export default function PublicLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-ivory font-sans text-ink antialiased">
            <Header />

            <main id="content" className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}

function Brand() {
    const { t } = useTranslation();

    return (
        <Link href={route('home')} className={`${focusRing} block shrink-0`}>
            <span className="block whitespace-nowrap font-display text-sm tracking-[0.14em] sm:text-lg sm:tracking-[0.18em]">
                LA DERNIÈRE TOUCHE
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">{t('site.tagline')}</span>
        </Link>
    );
}

function Header() {
    const { t } = useTranslation();
    const homeUrl = usePage().props.auth?.homeUrl ?? null;
    const navigationItems = useNavigationItems();
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

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [isMenuOpen]);

    return (
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/95 backdrop-blur">
            <a
                href="#content"
                className={`${focusRing} sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-5 focus:z-10 focus:bg-ink focus:px-4 focus:py-2 focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-ivory`}
            >
                {t('site.skip')}
            </a>

            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
                <Brand />

                <nav aria-label={t('site.navigation')} className="hidden xl:block">
                    <ul className="flex items-center gap-8">
                        {navigationItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className={navLink}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <LanguageSwitcher variant="outlined" />

                    {homeUrl ? (
                        <Link href={homeUrl} className={headerSecondaryButton}>
                            {t('site.account')}
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className={`${navLink} hidden px-2 py-3.5 lg:inline-block`}>
                                {t('site.login')}
                            </Link>
                            <Link href={route('access-request.create')} className={headerPrimaryButton}>
                                {t('site.requestAccess')}
                            </Link>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-expanded={isMenuOpen}
                        aria-controls="public-menu"
                        aria-label={isMenuOpen ? t('site.closeMenu') : t('site.openMenu')}
                        className={`${focusRing} inline-flex size-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink xl:hidden`}
                    >
                        <Icone nom={isMenuOpen ? 'close' : 'menu'} className="text-[22px]" />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div id="public-menu" className="border-t border-ink/10 bg-ivory xl:hidden">
                    <nav aria-label={t('site.navigation')} className="mx-auto max-w-7xl px-6 py-6 sm:px-10">
                        <ul className="divide-y divide-ink/10 border-y border-ink/10">
                            {navigationItems.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`${navLink} block py-4`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            {homeUrl ? (
                                <Link href={homeUrl} className={primaryButton}>
                                    {t('site.account')}
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('access-request.create')} className={primaryButton}>
                                        {t('site.requestAccess')}
                                    </Link>
                                    <Link href={route('login')} className={secondaryButton}>
                                        {t('site.login')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

function Footer() {
    const { t } = useTranslation();
    const navigationItems = useNavigationItems();

    return (
        <footer className="border-t border-ink/10">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:px-10 md:grid-cols-[2fr_1fr_1fr]">
                <div className="flex items-start gap-4">
                    <img src="/logo-ldt.png" alt="" className="h-14 w-auto" width={285} height={560} />

                    <div className="max-w-xs">
                        <p className="font-display text-sm tracking-[0.18em]">LA DERNIÈRE TOUCHE</p>
                        <p className="mt-3 text-sm leading-relaxed text-ink/70">{t('site.footer')}</p>
                    </div>
                </div>

                <nav aria-label={t('site.footerNavigation')}>
                    <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-[0.18em] text-sage">
                        {navigationItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className={footerLink}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <Link href={route('access-request.create')} className={footerLink}>
                                {t('site.requestAccess')}
                            </Link>
                        </li>
                    </ul>
                </nav>

                <ul className="flex flex-col gap-3 text-sm text-ink/70">
                    <li>
                        <a href={`mailto:${CONTACT.email}`} className={footerLink}>
                            {CONTACT.email}
                        </a>
                    </li>
                    <li>
                        <a href={CONTACT.phoneLink} className={footerLink}>
                            {CONTACT.phone}
                        </a>
                    </li>
                    <li>
                        <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className={footerLink}>
                            Instagram
                        </a>
                    </li>
                    <li>
                        <a href={CONTACT.website} target="_blank" rel="noreferrer" className={footerLink}>
                            {t('site.portfolio')}
                        </a>
                    </li>
                </ul>
            </div>

            <div className="border-t border-ink/10 bg-blush">
                <p className="mx-auto max-w-6xl px-6 py-5 text-[11px] text-ink/60 sm:px-10">
                    © {new Date().getFullYear()} La Dernière Touche · SIRET {CONTACT.siret} ·{' '}
                    <Link
                        href={route('legal-notice')}
                        className={`${focusRing} underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink`}
                    >
                        {t('site.legalNotice')}
                    </Link>
                </p>
            </div>
        </footer>
    );
}
