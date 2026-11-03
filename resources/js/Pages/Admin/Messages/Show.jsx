import Icone from '@/Components/Icone';
import MessageThread from '@/Components/MessageThread';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { focusRing } from '@/brand';
import { Head, Link } from '@inertiajs/react';

/**
 * Jessica's view of the private thread with one couple. The couple's messages
 * are marked as read when the page is opened.
 */
export default function Show({ couple, messages, canWrite, maxBodyLength }) {
    return (
        <BackOfficeLayout actif="messages" filAriane={couple.title}>
            <Head title={`Messages · ${couple.title}`} />

            <div className="flex w-full max-w-4xl flex-col gap-6">
                <Link
                    href={route('admin.messages.index')}
                    className={`${focusRing} inline-flex items-center gap-1 self-start text-body-sm text-sage transition-colors hover:text-ink`}
                >
                    <Icone nom="arrow_back" className="text-[16px]" />
                    Tous les messages
                </Link>

                <h1 className="font-display text-3xl tracking-tight text-ink">{couple.title}</h1>

                <MessageThread
                    messages={messages}
                    otherPartyName={couple.title}
                    postUrl={route('admin.messages.store', couple.id)}
                    canWrite={canWrite}
                    cannotWriteText="Ce couple n’a pas encore de mariage enregistré : créez-le avant de lui écrire."
                    maxBodyLength={maxBodyLength}
                    emptyText="Aucun message avec ce couple pour l’instant."
                />
            </div>
        </BackOfficeLayout>
    );
}
