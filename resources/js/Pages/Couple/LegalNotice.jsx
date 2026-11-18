import LegalNoticeContent from '@/Components/LegalNoticeContent';
import { useTranslation } from '@/i18n';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head } from '@inertiajs/react';

/**
 * Legal notice of the couple space: the public notice plus what is specific to
 * a logged-in couple (data kept in the space, rules of use).
 */
export default function LegalNotice() {
    const { t } = useTranslation();

    return (
        <CoupleLayout active="legal">
            <Head title={t('legal.title')} />

            <h1 className="font-display text-3xl leading-snug sm:text-4xl">{t('legal.title')}</h1>

            <div className="mt-10">
                <LegalNoticeContent forCoupleSpace />
            </div>
        </CoupleLayout>
    );
}
