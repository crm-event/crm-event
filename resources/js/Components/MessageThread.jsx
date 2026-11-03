import FieldError from '@/Components/FieldError';
import { primaryButton } from '@/brand';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * Private thread between a couple and Jessica, used on both sides: the
 * user's own messages on the right, the other party's on the left.
 *
 * `otherPartyName` labels the messages received, `postUrl` is where the form
 * is sent. When `canWrite` is false, `cannotWriteText` replaces the form.
 */
export default function MessageThread({
    messages,
    otherPartyName,
    postUrl,
    canWrite,
    cannotWriteText,
    maxBodyLength,
    emptyText,
}) {
    const endOfThread = useRef(null);

    useEffect(() => {
        endOfThread.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    return (
        <div className="flex flex-col border border-ink/10 bg-white">
            <ol
                aria-label="Messages"
                className="flex max-h-[60vh] min-h-64 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-8"
            >
                {messages.length === 0 && (
                    <li className="m-auto max-w-sm text-center text-sm leading-relaxed text-ink/50">
                        {emptyText}
                    </li>
                )}

                {messages.map((message) => (
                    <li
                        key={message.id}
                        className={`flex max-w-[85%] flex-col ${message.is_own ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                        <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-sage">
                            {message.is_own ? 'Vous' : otherPartyName}
                        </p>
                        <p
                            className={`whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed ${
                                message.is_own ? 'bg-ink text-ivory' : 'bg-blush text-ink'
                            }`}
                        >
                            {message.body}
                        </p>
                        <p className="mt-1 text-[11px] text-ink/45">
                            <time dateTime={message.sent_at}>
                                {dateFormatter.format(new Date(message.sent_at))}
                            </time>
                            {message.is_own && message.read_at && ' · Lu'}
                        </p>
                    </li>
                ))}
                <li ref={endOfThread} aria-hidden="true" />
            </ol>

            <div className="border-t border-ink/10 px-5 py-5 sm:px-8">
                {canWrite ? (
                    <Composer postUrl={postUrl} maxBodyLength={maxBodyLength} />
                ) : (
                    <p className="text-sm leading-relaxed text-ink/60">{cannotWriteText}</p>
                )}
            </div>
        </div>
    );
}

function Composer({ postUrl, maxBodyLength }) {
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();

        post(postUrl, {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    // Ctrl + Enter (or Cmd + Enter) sends the message, Enter adds a new line.
    const sendOnShortcut = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            submit(e);
        }
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor="message-body" className="sr-only">
                Votre message
            </label>
            <textarea
                id="message-body"
                value={data.body}
                rows={3}
                maxLength={maxBodyLength}
                required
                placeholder="Écrivez votre message…"
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? 'message-body-error' : 'message-body-hint'}
                onChange={(e) => setData('body', e.target.value)}
                onKeyDown={sendOnShortcut}
                className="block w-full resize-y border border-ink/15 bg-ivory px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink/35 focus:border-ink focus:ring-0 aria-invalid:border-ink"
            />
            <FieldError id="message-body-error" message={errors.body} />

            <div className="mt-3 flex items-center justify-between gap-4">
                <span id="message-body-hint" className="text-xs text-ink/40">
                    Ctrl + Entrée pour envoyer
                </span>
                <button
                    type="submit"
                    disabled={processing}
                    className={`${primaryButton} disabled:cursor-wait disabled:opacity-50`}
                >
                    {processing ? 'Envoi…' : 'Envoyer'}
                </button>
            </div>
        </form>
    );
}
