import LegalNoticeContent from '@/Components/LegalNoticeContent';
import { textLink } from '@/brand';
import { useTranslation } from '@/i18n';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

/**
 * Public legal notice, linked from the footer of the public pages.
 */
export default function LegalNotice() {
    const { t } = useTranslation();

    return (
        <PublicLayout>
            <Head title={t('legal.title')} />

            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
                <p className="text-[11px] uppercase tracking-brand text-sage">{t('legal.caption')}</p>
                <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">{t('legal.title')}</h1>

                <div className="mt-10">
                    <LegalNoticeContent />
                </div>

                <p className="mt-12">
                    <Link href={route('home')} className={textLink}>
                        {t('legal.backHome')}
                    </Link>
                </p>
            </div>
        </PublicLayout>
    );
}
