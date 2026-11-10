import Icone from '@/Components/Icone';
import { focusRing } from '@/brand';
import { translate } from '@/i18n';
import { router } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';

/** Same key as the public site, so that the choice made there is kept. */
const STORAGE_KEY = 'ldt-language';

const SUPPORTED_LANGUAGES = ['fr', 'en'];

const LanguageContext = createContext({ language: 'fr', setLanguage: () => {} });

function readStoredLanguage() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        return SUPPORTED_LANGUAGES.includes(stored) ? stored : null;
    } catch {
        return null;
    }
}

function storeLanguage(language) {
    try {
        window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // Private browsing: the choice still holds for this visit.
    }
}

/**
 * Tell the server the language, so that the texts it builds (statuses,
 * document labels…) follow it: the current page is reloaded in that language.
 */
function sendLanguageToServer(language) {
    router.post(route('locale.update'), { locale: language }, { preserveScroll: true, preserveState: true });
}

/**
 * Language of the interface, shared by every page. The choice is kept in the
 * browser and in the session.
 */
export function LanguageProvider({ initialLocale, children }) {
    const serverLanguage = SUPPORTED_LANGUAGES.includes(initialLocale) ? initialLocale : 'fr';
    const [language, setLanguageState] = useState(() => readStoredLanguage() ?? serverLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        // Language chosen on the public site before logging in.
        if (language !== serverLanguage) {
            sendLanguageToServer(language);
        }
        // Only once, when the application starts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setLanguage(nextLanguage) {
        if (!SUPPORTED_LANGUAGES.includes(nextLanguage) || nextLanguage === language) {
            return;
        }

        setLanguageState(nextLanguage);
        storeLanguage(nextLanguage);
        sendLanguageToServer(nextLanguage);
    }

    return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    return useContext(LanguageContext);
}

/**
 * Button of the couple space header switching between French and English.
 */
export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const nextLanguage = language === 'fr' ? 'en' : 'fr';

    return (
        <button
            type="button"
            onClick={() => setLanguage(nextLanguage)}
            aria-label={translate(language, 'switchLanguage')}
            title={translate(language, 'switchLanguage')}
            className={`${focusRing} inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] uppercase tracking-[0.16em] text-sage transition-colors hover:bg-blush hover:text-ink`}
        >
            <Icone nom="language" className="text-[18px]" />
            <span className="hidden sm:inline">{nextLanguage.toUpperCase()}</span>
        </button>
    );
}
