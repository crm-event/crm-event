import MessageThread from '@/Components/MessageThread';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head } from '@inertiajs/react';
import { useLanguage } from '@/Components/LanguageSwitcher';
import { translate } from '@/i18n';

/**
 * Private thread between the couple and Jessica.
 *
 * Jessica's messages are marked as read when the page is opened.
 */
export default function Messages({ messages, canWrite, maxBodyLength }) {
    const language = useLanguage().language;
    const t = (key) => translate(language, key);

    return (
        <CoupleLayout active="messages">
            <Head title="Messages" />

            <p className="text-[11px] uppercase tracking-brand text-sage">{t('yourConversations')}</p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">Messages</h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                {t('messagesIntro')}
            </p>

            <div className="mt-10 max-w-3xl">
                <MessageThread
                    messages={messages}
                    otherPartyName="Jessica"
                    postUrl={route('couple.messages.store')}
                    updateUrl={(id) => route('couple.messages.update', id)}
                    deleteUrl={(id) => route('couple.messages.destroy', id)}
                    canWrite={canWrite}
                    cannotWriteText={language === 'en'
                        ? 'Your file is not open yet. Jessica will let you know when messaging is available.'
                        : 'Votre dossier n’est pas encore ouvert : Jessica vous préviendra dès que la messagerie sera disponible.'}
                    maxBodyLength={maxBodyLength}
                    emptyText={t('noMessages')}
                />
            </div>
        </CoupleLayout>
    );
}
