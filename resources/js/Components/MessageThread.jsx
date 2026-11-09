import FieldError from '@/Components/FieldError';
import Icone from '@/Components/Icone';
import { primaryButton } from '@/brand';
import { useLanguage } from '@/Components/LanguageSwitcher';
import { translate } from '@/i18n';
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
    updateUrl,
    deleteUrl,
}) {
    const language = useLanguage().language;
    const t = (key) => translate(language, key);
    const endOfThread = useRef(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const editForm = useForm({ body: '' });

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
                            {message.is_own ? (language === 'en' ? 'You' : 'Vous') : otherPartyName}
                        </p>
                        {editingMessageId === message.id ? (
                            <div className="w-full min-w-64">
                                <textarea
                                    value={editForm.data.body}
                                    rows={3}
                                    maxLength={maxBodyLength}
                                    onChange={(event) => editForm.setData('body', event.target.value)}
                                    className="block w-full border border-ink/20 bg-ivory px-3 py-2 text-sm text-ink focus:border-ink focus:ring-0"
                                    aria-label={language === 'en' ? 'Edit message' : 'Modifier le message'}
                                />
                                <FieldError message={editForm.errors.body} />
                                <div className="mt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMessageId(null)}
                                        className="text-xs text-sage underline"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            editForm.patch(updateUrl(message.id), {
                                                preserveScroll: true,
                                                onSuccess: () => setEditingMessageId(null),
                                            })
                                        }
                                        disabled={editForm.processing || !editForm.data.body.trim()}
                                        className={`${primaryButton} px-3 py-2 text-xs disabled:opacity-50`}
                                    >
                                        {editForm.processing
                                            ? language === 'en' ? 'Saving…' : 'Enregistrement…'
                                            : language === 'en' ? 'Save' : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        ) : message.body ? (
                            <p
                                className={`whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed ${
                                    message.is_own ? 'bg-ink text-ivory' : 'bg-blush text-ink'
                                }`}
                            >
                                {message.body}
                            </p>
                        ) : null}
                        {message.voice_note_url ? (
                            <VoiceMessagePlayer
                                src={message.voice_note_url}
                                isOwn={message.is_own}
                            />
                        ) : (
                            message.has_voice_note && (
                                <p className="border border-dashed border-ink/20 px-4 py-3 text-sm italic text-ink/55">
                                    Message vocal indisponible sur cet appareil
                                </p>
                            )
                        )}
                        <p className="mt-1 text-[11px] text-ink/45">
                            <time dateTime={message.sent_at}>
                                {dateFormatter.format(new Date(message.sent_at))}
                            </time>
                            {message.is_own && message.read_at && ` · ${language === 'en' ? 'Read' : 'Lu'}`}
                        </p>
                        {message.is_own && editingMessageId !== message.id && (
                            <div className="mt-1 flex gap-3 text-xs text-sage">
                                {message.body && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editForm.setData('body', message.body);
                                            editForm.clearErrors();
                                            setEditingMessageId(message.id);
                                        }}
                                        className="inline-flex items-center gap-1 underline hover:text-ink"
                                        aria-label={language === 'en' ? 'Edit message' : 'Modifier le message'}
                                        title={language === 'en' ? 'Edit message' : 'Modifier le message'}
                                    >
                                        <Icone nom="edit" className="!text-[11px] leading-none" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm(language === 'en' ? 'Delete this message?' : 'Supprimer ce message ?')) {
                                            editForm.delete(deleteUrl(message.id), {
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 underline hover:text-ink"
                                    aria-label="Supprimer le message"
                                    title="Supprimer le message"
                                >
                                    <Icone nom="delete" className="!text-[11px] leading-none" />
                                </button>
                            </div>
                        )}
                    </li>
                ))}
                <li ref={endOfThread} aria-hidden="true" />
            </ol>

            <div className="border-t border-ink/10 px-5 py-5 sm:px-8">
                {canWrite ? (
                    <Composer postUrl={postUrl} maxBodyLength={maxBodyLength} language={language} />
                ) : (
                    <p className="text-sm leading-relaxed text-ink/60">{cannotWriteText}</p>
                )}
            </div>
        </div>
    );
}

function VoiceMessagePlayer({ src, isOwn }) {
    const audio = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlayback = async () => {
        if (!audio.current) {
            return;
        }

        if (isPlaying) {
            audio.current.pause();
        } else {
            await audio.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    const seek = (event) => {
        const time = Number(event.target.value);

        if (audio.current) {
            audio.current.currentTime = time;
        }

        setCurrentTime(time);
    };

    return (
        <div
            className={`mt-2 flex w-full min-w-64 items-center gap-3 px-3 py-2.5 ${
                isOwn ? 'bg-ink text-ivory' : 'bg-blush text-ink'
            }`}
        >
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isOwn ? 'bg-ivory/15' : 'bg-white/60'
                }`}
            >
                <Icone
                    nom="mic"
                    className={`!text-[15px] leading-none ${isOwn ? 'text-ivory' : 'text-ink'}`}
                />
            </span>
            <div className="min-w-0 flex-1">
                <audio
                    ref={audio}
                    preload="metadata"
                    src={src}
                    onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                    aria-label="Message vocal"
                />
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            isOwn ? 'bg-ivory text-ink' : 'bg-ink text-ivory'
                        }`}
                        aria-label={isPlaying ? 'Mettre le message vocal en pause' : 'Écouter le message vocal'}
                    >
                        <Icone
                            nom={isPlaying ? 'pause' : 'play_arrow'}
                            className="!text-[16px] leading-none"
                        />
                    </button>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={seek}
                        className={`h-1 min-w-0 flex-1 cursor-pointer ${
                            isOwn ? 'accent-ivory' : 'accent-ink'
                        }`}
                        aria-label="Progression du message vocal"
                    />
                    <span className="w-20 text-right font-mono text-[10px] opacity-70">
                        {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function formatAudioTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return '0:00';
    }

    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function Composer({ postUrl, maxBodyLength, language }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
        voice_note: null,
    });
    const recorder = useRef(null);
    const chunks = useRef([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
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

    useEffect(() => {
        if (!isRecording) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setRecordingSeconds((seconds) => seconds + 1);
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isRecording]);

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
            setRecordingSeconds(0);
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
                {language === 'en' ? 'Your message' : 'Votre message'}
            </label>
            <textarea
                id="message-body"
                value={data.body}
                rows={3}
                maxLength={maxBodyLength}
                placeholder={language === 'en' ? 'Write your message…' : 'Écrivez votre message…'}
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? 'message-body-error' : 'message-body-hint'}
                onChange={(e) => setData('body', e.target.value)}
                onKeyDown={sendOnShortcut}
                className="block w-full resize-y border border-ink/15 bg-ivory px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink/35 focus:border-ink focus:ring-0 aria-invalid:border-ink"
            />
            <FieldError id="message-body-error" message={errors.body} />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span id="message-body-hint" className="text-xs text-ink/40">
                    {language === 'en' ? 'Ctrl + Enter to send' : 'Ctrl + Entrée pour envoyer'}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {!isRecording && !data.voice_note && (
                        <button
                            type="button"
                            onClick={startRecording}
                            disabled={processing}
                            className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2 text-sm text-ink transition-colors hover:border-ink disabled:opacity-50"
                        >
                            <Icone nom="mic" className="!text-[14px] leading-none" />
                            {language === 'en' ? 'Record' : 'Enregistrer'}
                        </button>
                    )}
                    {isRecording && (
                        <div className="flex items-center gap-3 border border-ink bg-blush px-3 py-2 text-sm text-ink">
                            <span className="flex items-center gap-2" role="status" aria-live="polite">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
                                {language === 'en' ? 'Recording' : 'Enregistrement en cours'}
                                <span className="font-mono text-xs">
                                    {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                                    {String(recordingSeconds % 60).padStart(2, '0')}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="inline-flex items-center gap-1 underline underline-offset-2"
                                aria-label={language === 'en' ? 'Stop recording' : 'Arrêter l’enregistrement'}
                                title={language === 'en' ? 'Stop recording' : 'Arrêter l’enregistrement'}
                            >
                                <Icone nom="stop" className="!text-[14px] leading-none" />
                                {language === 'en' ? 'Stop' : 'Arrêter'}
                            </button>
                        </div>
                    )}
                    {data.voice_note && !isRecording && (
                        <button
                            type="button"
                            onClick={removeRecording}
                            className="text-sm text-sage underline"
                        >
                            {language === 'en' ? 'Delete voice note' : 'Supprimer le vocal'}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing || isRecording || (!data.body.trim() && !data.voice_note)}
                        className={`${primaryButton} disabled:cursor-wait disabled:opacity-50`}
                    >
                        {processing
                            ? language === 'en' ? 'Sending…' : 'Envoi…'
                            : language === 'en' ? 'Send' : 'Envoyer'}
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
