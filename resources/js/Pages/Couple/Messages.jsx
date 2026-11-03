import MessageThread from '@/Components/MessageThread';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head } from '@inertiajs/react';

/**
 * Private thread between the couple and Jessica.
 *
 * Jessica's messages are marked as read when the page is opened.
 */
export default function Messages({ messages, canWrite, maxBodyLength }) {
    return (
        <CoupleLayout active="messages">
            <Head title="Messages" />

            <p className="text-[11px] uppercase tracking-brand text-sage">Vos échanges</p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">Messages</h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                Votre conversation privée avec Jessica : tout ce qui a été dit et décidé reste
                ici, d’un bout à l’autre de votre projet.
            </p>

            <div className="mt-10 max-w-3xl">
                <MessageThread
                    messages={messages}
                    otherPartyName="Jessica"
                    postUrl={route('couple.messages.store')}
                    canWrite={canWrite}
                    cannotWriteText="Votre dossier n’est pas encore ouvert : Jessica vous préviendra dès que la messagerie sera disponible."
                    maxBodyLength={maxBodyLength}
                    emptyText="Aucun message pour l’instant. Écrivez à Jessica, elle vous répondra ici."
                />
            </div>
        </CoupleLayout>
    );
}
