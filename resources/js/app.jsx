import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { normalizeLanguage } from '@/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// The server renders <html lang> for the first page; keep it right when the
// language changes without a full reload (LanguageSwitcher), and when going
// back in the history.
const syncDocumentLanguage = (event) => {
    document.documentElement.lang = normalizeLanguage(event.detail.page.props.locale);
};

router.on('success', syncDocumentLanguage);
router.on('navigate', syncDocumentLanguage);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
