import { usePage } from '@inertiajs/react';
import auth from './auth';
import couple from './couple';
import errors from './errors';
import landing from './landing';
import legal from './legal';
import profile from './profile';

/**
 * Languages of the site, the first one being the default. The server decides
 * the language of each page (SetLocale middleware) and shares it as the
 * `locale` prop: React only reads it, so that server texts (statuses, error
 * messages) and interface texts always agree.
 */
export const SUPPORTED_LANGUAGES = ['fr', 'en'];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];

/**
 * Every text of the site, by language. Shared and couple space texts sit at
 * the root (t('cancel')); each other area has its own namespace
 * (t('auth.login.title'), t('errors.404.title')…).
 *
 * A text may contain {placeholders}, replaced by the values given to t().
 * A text depending on a number gives its singular and plural forms separated
 * by "|", chosen from the `value` placeholder.
 */
const TRANSLATIONS = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((language) => [
        language,
        {
            ...couple[language],
            auth: auth[language],
            errors: errors[language],
            landing: landing[language],
            legal: legal[language],
            profile: profile[language],
        },
    ]),
);

/**
 * The given language when the site has it, French otherwise.
 *
 * @param {unknown} language
 * @returns {string}
 */
export function normalizeLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

/**
 * Value found at a dotted `key` ("auth.login.title") in a language.
 */
function lookup(language, key) {
    return key.split('.').reduce((node, part) => node?.[part], TRANSLATIONS[language]);
}

/**
 * Pick the singular or the plural form of a text depending on `count`:
 * in French 0 and 1 take the singular, in English only 1 does.
 */
function pickPluralForm(text, language, count) {
    const [singular, plural = singular] = text.split('|');
    const isSingular = language === 'fr' ? Math.abs(count) <= 1 : Math.abs(count) === 1;

    return isSingular ? singular : plural;
}

/**
 * Text of `key` in `language` (French when missing), with its {placeholders}
 * replaced by `params`. Returns the key itself when no text exists, so that a
 * missing translation shows up without breaking the page.
 *
 * @param {string} language
 * @param {string} key
 * @param {Record<string, string|number>} [params]
 * @returns {string}
 */
export function translate(language, key, params = {}) {
    const found = lookup(language, key);
    const text = typeof found === 'string' ? found : lookup(DEFAULT_LANGUAGE, key);

    if (typeof text !== 'string') {
        return key;
    }

    const form = typeof params.value === 'number' ? pickPluralForm(text, language, params.value) : text.split('|').pop();

    return form.replace(/\{(\w+)\}/g, (placeholder, name) => (name in params ? String(params[name]) : placeholder));
}

/**
 * Structured content (lists, nested objects) of a namespace in a language,
 * for pages whose texts are not single strings, such as the landing page.
 *
 * @param {string} language
 * @param {string} key
 * @returns {any}
 */
export function translateContent(language, key) {
    return lookup(language, key) ?? lookup(DEFAULT_LANGUAGE, key);
}

/**
 * Language of the current page and the functions to read its texts:
 *
 *     const { language, t } = useTranslation();
 *     t('auth.login.title');
 *     t('guestCount', { value: 12 });
 *
 * @returns {{ language: string, t: (key: string, params?: Record<string, string|number>) => string, content: (key: string) => any }}
 */
export function useTranslation() {
    const language = normalizeLanguage(usePage().props.locale);

    return {
        language,
        t: (key, params) => translate(language, key, params),
        content: (key) => translateContent(language, key),
    };
}
