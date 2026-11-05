import FieldError from '@/Components/FieldError';
import { primaryButton } from '@/brand';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
                        {message.body && (
                            <p
                                className={`whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed ${
                                    message.is_own ? 'bg-ink text-ivory' : 'bg-blush text-ink'
                                }`}
                            >
                                {message.body}
                            </p>
                        )}
                        {message.voice_note_url && (
                            <audio
                                controls
                                preload="metadata"
                                src={message.voice_note_url}
                                className="mt-2 max-w-full"
                                aria-label="Message vocal"
                            />
                        )}
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
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
        voice_note: null,
    });
    const recorder = useRef(null);
    const chunks = useRef([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingError, setRecordingError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!data.voice_note) {
            setPreviewUrl(null);
            return undefined;
        }

        const url = URL.createObjectURL(data.voice_note);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [data.voice_note]);

    const submit = (e) => {
        e.preventDefault();

        post(postUrl, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset('body', 'voice_note');
                setRecordingError('');
            },
        });
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            setRecordingError("L’enregistrement vocal n’est pas disponible sur ce navigateur.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
                .find((type) => MediaRecorder.isTypeSupported(type));
            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

            chunks.current = [];
            recorder.current = mediaRecorder;
            setRecordingError('');
            setIsRecording(true);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.current.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks.current, {
                    type: mediaRecorder.mimeType || 'audio/webm',
                });
                const extension = blob.type.includes('ogg')
                    ? 'ogg'
                    : blob.type.includes('mp4')
                      ? 'mp4'
                      : 'webm';

                setData('voice_note', new File([blob], `message-vocal.${extension}`, { type: blob.type }));
                stream.getTracks().forEach((track) => track.stop());
                recorder.current = null;
                setIsRecording(false);
            };
            mediaRecorder.start();
        } catch {
            setRecordingError("L’accès au microphone a été refusé ou n’est pas disponible.");
        }
    };

    const stopRecording = () => {
        recorder.current?.stop();
    };

    const removeRecording = () => {
        setData('voice_note', null);
        setRecordingError('');
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
                placeholder="Écrivez votre message…"
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? 'message-body-error' : 'message-body-hint'}
                onChange={(e) => setData('body', e.target.value)}
                onKeyDown={sendOnShortcut}
                className="block w-full resize-y border border-ink/15 bg-ivory px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink/35 focus:border-ink focus:ring-0 aria-invalid:border-ink"
            />
            <FieldError id="message-body-error" message={errors.body} />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span id="message-body-hint" className="text-xs text-ink/40">
                    Ctrl + Entrée pour envoyer
                </span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {!isRecording && !data.voice_note && (
                        <button
                            type="button"
                            onClick={startRecording}
                            disabled={processing}
                            className="border border-ink/20 px-3 py-2 text-sm text-ink transition-colors hover:border-ink disabled:opacity-50"
                        >
                            Enregistrer un vocal
                        </button>
                    )}
                    {isRecording && (
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="border border-ink bg-blush px-3 py-2 text-sm text-ink"
                        >
                            Arrêter l’enregistrement
                        </button>
                    )}
                    {data.voice_note && !isRecording && (
                        <button
                            type="button"
                            onClick={removeRecording}
                            className="text-sm text-sage underline"
                        >
                            Supprimer le vocal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing || isRecording || (!data.body.trim() && !data.voice_note)}
                        className={`${primaryButton} disabled:cursor-wait disabled:opacity-50`}
                    >
                        {processing ? 'Envoi…' : 'Envoyer'}
                    </button>
                </div>
            </div>
            {previewUrl && (
                <audio controls src={previewUrl} className="mt-3 max-w-full" aria-label="Aperçu du message vocal" />
            )}
            {recordingError && <p className="mt-2 text-sm text-red-700">{recordingError}</p>}
            <FieldError id="message-voice-error" message={errors.voice_note} />
        </form>
    );
}
