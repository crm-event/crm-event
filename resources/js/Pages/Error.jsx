import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { focusRing, primaryButton, secondaryButton } from '@/brand';
import { useTranslation } from '@/i18n';
import { Head, Link } from '@inertiajs/react';

/** Statuses that have their own message in i18n/errors.js. */
const KNOWN_STATUSES = [403, 404, 405, 419, 500, 503];

/**
 * Error page, following the project's brand guidelines.
 *
 * It is rendered by the exception handler (bootstrap/app.php) instead of
 * Laravel's default pages: a couple must never land on a raw
 * "404 | Not Found" or on a stack trace.
 */
export default function Error({ status }) {
    const { t } = useTranslation();
    const messageKey = KNOWN_STATUSES.includes(status) ? `errors.${status}` : 'errors.default';

    return (
        <>
            <Head title={t('errors.caption', { status })} />

            <main className="relative flex min-h-screen flex-col items-center justify-center bg-ivory px-6 py-20 text-center font-sans text-ink">
                <div className="absolute right-6 top-6 sm:right-10">
                    <LanguageSwitcher variant="outlined" />
                </div>

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
                    {t('errors.caption', { status })}
                </p>

                <h1 className="mt-6 font-display text-2xl leading-snug sm:text-3xl">
                    {t(`${messageKey}.title`)}
                </h1>

                <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
                    {t(`${messageKey}.text`)}
                </p>

                <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <Link href={route('home')} className={primaryButton}>
                        {t('errors.backHome')}
                    </Link>
                    <Link href={route('login')} className={secondaryButton}>
                        {t('errors.login')}
                    </Link>
                </div>
            </main>
        </>
    );
}
