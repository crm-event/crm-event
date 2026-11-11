import Icone from '@/Components/Icone';
import { focusRing } from '@/brand';
import { useTranslation } from '@/i18n';
import { router } from '@inertiajs/react';
import { useState } from 'react';

const VARIANTS = {
    /** Bordered, next to the "Se connecter" button of the public pages. */
    outlined:
        'border border-ink/20 px-4 py-3.5 text-[10px] tracking-[0.18em] text-ink hover:border-ink hover:bg-ink hover:text-ivory',
    /** Discreet, among the icon buttons of the couple space header. */
    subtle: 'rounded-lg px-2.5 py-2 text-[10px] tracking-[0.16em] text-sage hover:bg-blush hover:text-ink',
};

/**
 * The only language switcher of the site, shown on every public page and in
 * the couple space. It sends the choice to the server (LocaleController),
 * which keeps it in a cookie and reloads the page in that language: the texts
 * built by the server and those of the interface change together.
 */
export default function LanguageSwitcher({ variant = 'subtle', className = '' }) {
    const { language, t } = useTranslation();
    const [isSwitching, setIsSwitching] = useState(false);
    const nextLanguage = language === 'fr' ? 'en' : 'fr';

    const switchLanguage = () => {
        router.post(
            route('locale.update'),
            { locale: nextLanguage },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsSwitching(true),
                onFinish: () => setIsSwitching(false),
            },
        );
    };

    return (
        <button
            type="button"
            onClick={switchLanguage}
            disabled={isSwitching}
            lang={nextLanguage}
            aria-label={t('switchLanguage')}
            title={t('switchLanguage')}
            className={`${focusRing} inline-flex shrink-0 items-center gap-1.5 uppercase transition-colors disabled:cursor-wait disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
        >
            {/* On phones, the bordered version keeps only the language code, so
                that it fits next to the "Se connecter" button. */}
            <span className={variant === 'outlined' ? 'hidden sm:inline-flex' : 'inline-flex'}>
                <Icone nom="language" className="text-[18px]" />
            </span>
            <span>{nextLanguage}</span>
        </button>
    );
}
