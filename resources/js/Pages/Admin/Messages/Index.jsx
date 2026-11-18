import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { focusRing } from '@/brand';
import { Head, Link } from '@inertiajs/react';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * Jessica's inbox: one thread per couple who has access to their space, the
 * most recent activity first, with the number of unread messages.
 */
export default function Index({ threads }) {
    return (
        <BackOfficeLayout actif="messages" filAriane="Messages">
            <Head title="Messages" />

            <div className="flex w-full max-w-4xl flex-col gap-6">
                <header>
                    <h1 className="font-display text-3xl tracking-tight text-ink">Messages</h1>
                    <p className="mt-1 text-body text-sage">
                        Une conversation privée par couple ayant accès à son espace.
                    </p>
                </header>

                {threads.length === 0 ? (
                    <p className="rounded-lg border border-hairline bg-white px-6 py-10 text-center text-body text-sage">
                        Aucun couple n’a encore accès à son espace.
                    </p>
                ) : (
                    <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-white">
                        {threads.map((thread) => (
                            <li key={thread.couple_id}>
                                <Link
                                    href={route('admin.messages.show', thread.couple_id)}
                                    className={`${focusRing} flex items-center gap-4 px-6 py-4 transition-colors hover:bg-ivory`}
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush">
                                        <Icone nom="favorite" className="text-[18px] text-sage" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className={`text-body ${thread.unread_count > 0 ? 'font-semibold text-ink' : 'text-ink'}`}>
                                            {thread.title}
                                        </p>
                                        <p className="truncate text-body-sm text-sage">
                                            {thread.last_message ?? 'Pas encore de message'}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        {thread.last_message_at && (
                                            <time dateTime={thread.last_message_at} className="text-[11px] text-sage">
                                                {dateFormatter.format(new Date(thread.last_message_at))}
                                            </time>
                                        )}
                                        {thread.unread_count > 0 && (
                                            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
                                                {thread.unread_count} non lu{thread.unread_count > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </BackOfficeLayout>
    );
}
