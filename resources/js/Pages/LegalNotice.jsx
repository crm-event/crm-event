import LegalNoticeContent from '@/Components/LegalNoticeContent';
import { focusRing, textLink } from '@/brand';
import { Head, Link } from '@inertiajs/react';

/**
 * Public legal notice, linked from the footer of the landing page.
 */
export default function LegalNotice() {
    return (
        <div className="min-h-screen bg-ivory font-sans text-ink antialiased">
            <Head title="Mentions légales" />

            <header className="border-b border-ink/10">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-5 sm:px-10">
                    <Link href={route('home')} className={`${focusRing} block`}>
                        <span className="block whitespace-nowrap font-display text-xs tracking-[0.14em] sm:text-lg sm:tracking-[0.18em]">
                            LA DERNIÈRE TOUCHE
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                            Wedding design &amp; coordination
                        </span>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
                <p className="text-[11px] uppercase tracking-brand text-sage">Informations légales</p>
                <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">Mentions légales</h1>

                <div className="mt-10">
                    <LegalNoticeContent />
                </div>

                <p className="mt-12">
                    <Link href={route('home')} className={textLink}>
                        Retour à l’accueil
                    </Link>
                </p>
            </main>
        </div>
    );
}
