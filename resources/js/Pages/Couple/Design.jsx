
import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import FieldError from '@/Components/FieldError';
import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { useLanguage } from '@/Components/LanguageSwitcher';
import { translate } from '@/i18n';
import { focusRing, primaryButton, secondaryButton, textLink } from '@/brand';

function useT() {
    const { language } = useLanguage();

    const t = (key, params = {}) => translate(language, key, params);

    return { language, t };
}

const processStepStyles = [
    'bg-blush',
    'bg-blush/70',
    'bg-blush/60',
    'bg-ivory',
];

function formatDate(value, language, t) {
    if (!value) return t('designDateToSpecify');

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function uploadImage(collection, file) {
    router.post(
        route('couple.design.media.store'),
        { collection, file },
        { forceFormData: true, preserveScroll: true },
    );
}

function Pill({ children, muted = false }) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] ${
                muted ? 'bg-ivory text-ink/45' : 'bg-blush text-sage'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${muted ? 'bg-ink/25' : 'bg-sage'}`} />
            {children}
        </span>
    );
}

function SectionTitle({ eyebrow, title, children }) {
    return (
        <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[10px] uppercase tracking-brand text-sage">{eyebrow}</p>
                <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function UnavailableImage({ className = '' }) {
    const { t } = useT();

    return (
        <div className={`flex flex-col items-center justify-center gap-2 bg-blush px-3 text-center text-[11px] italic text-ink/50 ${className}`}>
            <Icone nom="image_not_supported" className="text-[22px] not-italic text-sage/70" />
            {t('designUnavailableImage')}
        </div>
    );
}

function ImagePreview({ src, alt, onClose }) {
    const { t } = useT();

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', closeOnEscape);

        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${t('designImagePreview')} ${alt}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5 sm:p-10"
            onClick={onClose}
            onKeyDown={(event) => {
                if (event.key === 'Escape') onClose();
            }}
            tabIndex="-1"
        >
            <button
                type="button"
                onClick={onClose}
                aria-label={t('designClosePreview')}
                className={`${focusRing} absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-ivory text-ink sm:right-8 sm:top-8`}
            >
                <Icone nom="close" className="text-[22px]" />
            </button>

            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-full object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}

function Moodboard({ moodboard, canEdit }) {
    const { t } = useT();
    const inputRef = useRef(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    function replace(event) {
        const file = event.target.files?.[0];

        if (file) uploadImage('moodboards', file);

        event.target.value = '';
    }

    const fileInput = canEdit && (
        <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={replace}
        />
    );

    if (!moodboard) {
        return (
            <>
                {fileInput}

                {canEdit ? (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className={`${focusRing} flex aspect-[5/4] w-full flex-col items-center justify-center gap-3 border border-dashed border-ink/20 bg-white/60 text-ink/55 transition-colors hover:border-ink/50 hover:text-ink`}
                    >
                        <Icone nom="add_photo_alternate" className="text-[28px]" />
                        <span className="text-[10px] uppercase tracking-[0.12em]">
                            {t('designAddMoodboard')}
                        </span>
                    </button>
                ) : (
                    <div className="flex aspect-[5/4] w-full items-center justify-center border border-dashed border-ink/20 text-sm text-ink/45">
                        {t('designNoMoodboard')}
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            {fileInput}

            <div className="group relative overflow-hidden bg-blush">
                {moodboard.url ? (
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className={`${focusRing} block w-full cursor-zoom-in text-left`}
                        aria-label={t('designEnlargeMoodboard')}
                    >
                        <img
                            src={moodboard.url}
                            alt={moodboard.alt}
                            className="aspect-[5/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                    </button>
                ) : (
                    <UnavailableImage className="aspect-[5/4] w-full" />
                )}

                {canEdit && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className={`${focusRing} absolute bottom-3 right-3 inline-flex items-center gap-2 bg-ivory/95 px-3 py-2 text-[10px] uppercase tracking-[0.1em] transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
                    >
                        <Icone nom="upload" className="text-[15px]" />
                        {t('designReplace')}
                    </button>
                )}
            </div>

            {isPreviewOpen && moodboard.url && (
                <ImagePreview
                    src={moodboard.url}
                    alt={moodboard.alt}
                    onClose={() => setIsPreviewOpen(false)}
                />
            )}
        </>
    );
}

function InspirationGallery({ images, canEdit }) {
    const { t } = useT();
    const inputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    function addImage(event) {
        const file = event.target.files?.[0];

        if (file) uploadImage('images', file);

        event.target.value = '';
    }

    function removeImage(image) {
        if (window.confirm(t('designRemoveInspiration'))) {
            router.delete(
                route('couple.design.media.destroy', image.id),
                { preserveScroll: true },
            );
        }
    }

    return (
        <>
            {canEdit && (
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={addImage}
                />
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => (
                    <div key={image.id} className="group relative aspect-square overflow-hidden bg-blush">
                        {image.url ? (
                            <button
                                type="button"
                                onClick={() => setPreviewImage(image)}
                                className={`${focusRing} block h-full w-full cursor-zoom-in text-left`}
                                aria-label={`${t('designEnlarge')} ${image.alt}`}
                            >
                                <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </button>
                        ) : (
                            <UnavailableImage className="h-full w-full" />
                        )}

                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => removeImage(image)}
                                aria-label={`${t('designRemove')} ${image.alt}`}
                                className={`${focusRing} absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-ivory/95 text-ink transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
                            >
                                <Icone nom="close" className="text-[16px]" />
                            </button>
                        )}
                    </div>
                ))}

                {canEdit && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className={`${focusRing} flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-ink/20 text-ink/50 transition-colors hover:border-ink/50 hover:text-ink`}
                    >
                        <Icone nom="add_photo_alternate" className="text-[24px]" />
                        <span className="text-center text-[10px] uppercase tracking-[0.1em]">
                            {t('designAdd')}
                        </span>
                    </button>
                )}
            </div>

            {images.length === 0 && !canEdit && (
                <p className="text-sm text-ink/45">{t('designNoPhotos')}</p>
            )}

            {previewImage && (
                <ImagePreview
                    src={previewImage.url}
                    alt={previewImage.alt}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </>
    );
}

function CreativeBrief({ brief, moodboard, inspirations, canEdit }) {
    const { language, t } = useT();
    const [editing, setEditing] = useState(false);
    const imageError = usePage().props.errors.file;

    const form = useForm({
        title: brief?.title ?? '',
        description: brief?.description ?? '',
        palette_input: (brief?.palette ?? []).join(', '),
        avoid: brief?.avoid ?? '',
    });

    function startEditing() {
        form.setData({
            title: brief?.title ?? '',
            description: brief?.description ?? '',
            palette_input: (brief?.palette ?? []).join(', '),
            avoid: brief?.avoid ?? '',
        });

        form.clearErrors();
        setEditing(true);
    }

    function save(event) {
        event.preventDefault();

        form.put(route('couple.design.brief.update'), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    }

    const isEmpty = !brief || (
        !brief.title &&
        !brief.description &&
        brief.palette.length === 0 &&
        !brief.avoid
    );

    return (
        <section
            id="design-brief"
            className="mt-16 scroll-mt-24 bg-blush/70 p-6 sm:p-8 lg:p-10"
            aria-labelledby="brief-heading"
        >
            <SectionTitle
                eyebrow={t('designBriefStep')}
                title={t('designCreativeBrief')}
            >
                {canEdit && (
                    <button
                        type="button"
                        onClick={editing ? () => setEditing(false) : startEditing}
                        className={`${focusRing} inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-sage transition-colors hover:text-ink`}
                    >
                        <Icone nom={editing ? 'close' : 'edit'} className="text-[16px]" />
                        {editing
                            ? translate(language, 'cancel')
                            : isEmpty
                                ? t('designWriteBrief')
                                : t('designEditBrief')}
                    </button>
                )}
            </SectionTitle>

            <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-brand text-sage">
                            {t('designMoodboard')}
                        </p>

                        {moodboard && (
                            <span className="text-[11px] text-ink/40">
                                {t('designAddedOn')} {formatDate(moodboard.created_at, language, t)}
                            </span>
                        )}
                    </div>

                    <div className="mt-3">
                        <Moodboard moodboard={moodboard} canEdit={canEdit} />
                    </div>
                </div>

                {editing ? (
                    <form onSubmit={save}>
                        <label htmlFor="brief-title" className="text-[10px] uppercase tracking-brand text-sage">
                            {t('designWeddingIntention')}
                        </label>

                        <input
                            id="brief-title"
                            value={form.data.title}
                            onChange={(event) => form.setData('title', event.target.value)}
                            placeholder={t('designWeddingIntentionPlaceholder')}
                            className="mt-3 w-full border-0 border-b border-ink/20 bg-transparent px-0 py-2 font-display text-xl focus:border-ink focus:ring-0"
                        />

                        <FieldError message={form.errors.title} />

                        <label htmlFor="brief-description" className="sr-only">
                            {t('designDescription')}
                        </label>

                        <textarea
                            id="brief-description"
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                            rows={6}
                            placeholder={t('designDescriptionPlaceholder')}
                            className="mt-5 w-full resize-y border border-ink/15 bg-white p-4 text-sm leading-relaxed focus:border-ink focus:ring-0"
                        />

                        <FieldError message={form.errors.description} />

                        <div className="mt-7 grid gap-6 border-t border-ink/10 pt-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="brief-palette" className="text-[10px] uppercase tracking-brand text-sage">
                                    {t('designPalette')}
                                </label>

                                <input
                                    id="brief-palette"
                                    value={form.data.palette_input}
                                    onChange={(event) => form.setData('palette_input', event.target.value)}
                                    placeholder={t('designPalettePlaceholder')}
                                    className="mt-3 w-full border border-ink/15 bg-white px-3 py-2 text-sm focus:border-ink focus:ring-0"
                                />

                                <FieldError message={form.errors.palette ?? form.errors['palette.0']} />
                            </div>

                            <div>
                                <label htmlFor="brief-avoid" className="text-[10px] uppercase tracking-brand text-sage">
                                    {t('designAvoid')}
                                </label>

                                <textarea
                                    id="brief-avoid"
                                    value={form.data.avoid}
                                    onChange={(event) => form.setData('avoid', event.target.value)}
                                    rows={3}
                                    className="mt-3 w-full resize-y border border-ink/15 bg-white p-3 text-sm leading-relaxed focus:border-ink focus:ring-0"
                                />

                                <FieldError message={form.errors.avoid} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className={`${primaryButton} mt-7 px-5 py-3 disabled:opacity-50`}
                        >
                            {form.processing
                                ? translate(language, 'saving')
                                : t('designSaveBrief')}
                        </button>
                    </form>
                ) : isEmpty ? (
                    <div>
                        <p className="text-[10px] uppercase tracking-brand text-sage">
                            {t('designWeddingIntention')}
                        </p>

                        <h3 id="brief-heading" className="mt-3 font-display text-2xl leading-snug">
                            {t('designTellUsAboutWedding')}
                        </h3>

                        <p className="mt-5 text-sm leading-relaxed text-ink/70">
                            {t('designBriefExplanation')}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-[10px] uppercase tracking-brand text-sage">
                            {t('designWeddingIntention')}
                        </p>

                        <h3 id="brief-heading" className="mt-3 font-display text-2xl leading-snug">
                            {brief.title || t('designYourWedding')}
                        </h3>

                        {brief.description && (
                            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink/70">
                                {brief.description}
                            </p>
                        )}

                        <div className="mt-7 grid gap-6 border-t border-ink/10 pt-5 sm:grid-cols-2">
                            <div>
                                <p className="text-[10px] uppercase tracking-brand text-sage">
                                    {t('designPalette')}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {brief.palette.length > 0 ? (
                                        brief.palette.map((color) => (
                                            <span
                                                key={color}
                                                className="border border-ink/10 bg-blush px-3 py-1.5 text-xs"
                                            >
                                                {color}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-ink/45">
                                            {t('designNotSpecified')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-brand text-sage">
                                    {t('designAvoid')}
                                </p>

                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/65">
                                    {brief.avoid || t('designNotSpecified')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 border-t border-ink/10 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-brand text-sage">
                            {t('designInspirationPhotos')}
                        </p>

                        <p className="mt-2 text-sm text-ink/55">
                            {t('designInspirationExplanation')}
                        </p>
                    </div>

                    <Icone nom="photo_library" className="hidden text-[25px] text-sage sm:block" />
                </div>

                <FieldError message={imageError} />

                <div className="mt-5">
                    <InspirationGallery images={inspirations} canEdit={canEdit} />
                </div>
            </div>
        </section>
    );
}

function VersionCard({ version, featured }) {
    const { language, t } = useT();
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const approval = useForm();
    const feedback = useForm({ text: '' });

    const available = Boolean(version.download_url);
    const approved = Boolean(version.approved_at);

    function approve() {
        approval.post(
            route('couple.documents.approve', version.id),
            { preserveScroll: true },
        );
    }

    function sendFeedback(event) {
        event.preventDefault();

        feedback.transform((data) => ({
            body: `${t('designFeedbackTitle')} « ${version.title} » :\n${data.text}`,
        }));

        feedback.post(route('couple.messages.store'));
    }

    return (
        <article
            id={featured ? 'design-final' : undefined}
            className={`scroll-mt-24 overflow-hidden border bg-white ${featured ? 'border-ink/15' : 'border-ink/10'}`}
        >
            <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-6 border-b border-ink/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-14 w-12 shrink-0 items-center justify-center bg-blush text-sage">
                            <Icone nom="menu_book" className="text-[27px]" />
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-brand text-sage">
                                {t('designDesignBook')}
                            </p>

                            <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                                {version.title}
                            </h3>

                            <p className="mt-2 text-xs text-ink/45">
                                {t('designProposalByJessica')} · {formatDate(version.created_at, language, t)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-brand text-sage">
                            {t('designVersion')} {String(version.number).padStart(2, '0')}
                        </p>

                        <Pill muted={!approved && !version.awaiting_approval}>
                            {approved
                                ? t('designApproved')
                                : version.awaiting_approval
                                    ? t('designToApprove')
                                    : t('designDiscover')}
                        </Pill>
                    </div>
                </div>

                {version.description && (
                    <p className="mt-7 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink/70">
                        {version.description}
                    </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
                    {available ? (
                        <a href={version.download_url} className={`${primaryButton} px-5 py-3`}>
                            <Icone nom="download" className="mr-2 text-[16px]" />
                            {t('designDownloadBook')}
                        </a>
                    ) : (
                        <span className="border border-dashed border-ink/20 px-4 py-3 text-xs italic text-ink/55">
                            {t('designUnavailableFile')}
                        </span>
                    )}

                    {version.awaiting_approval && (
                        <button
                            type="button"
                            onClick={approve}
                            disabled={approval.processing}
                            className={`${focusRing} border border-ink/15 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition-colors hover:border-ink disabled:opacity-50`}
                        >
                            <Icone nom="check" className="mr-1 align-middle text-[16px]" />
                            {approval.processing
                                ? translate(language, 'approving')
                                : t('designApproveDirection')}
                        </button>
                    )}

                    {approved && (
                        <span className="text-xs text-sage">
                            {t('designApprovedOn')} {formatDate(version.approved_at, language, t)}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setFeedbackOpen((current) => !current)}
                        className={`${focusRing} px-2 py-3 text-[10px] uppercase tracking-[0.12em] text-sage underline decoration-ink/20 underline-offset-4`}
                    >
                        {feedbackOpen
                            ? t('close')
                            : t('designRequestChange')}
                    </button>
                </div>
            </div>

            {feedbackOpen && (
                <form
                    onSubmit={sendFeedback}
                    className="border-t border-ink/10 bg-ivory p-6 sm:p-8"
                >
                    <label
                        htmlFor={`feedback-${version.id}`}
                        className="text-[10px] uppercase tracking-brand text-sage"
                    >
                        {t('designYourFeedback')}
                    </label>

                    <textarea
                        id={`feedback-${version.id}`}
                        rows={3}
                        required
                        value={feedback.data.text}
                        onChange={(event) => feedback.setData('text', event.target.value)}
                        placeholder={t('designFeedbackPlaceholder')}
                        className="mt-3 w-full resize-y border border-ink/15 bg-white p-4 text-sm focus:border-ink focus:ring-0"
                    />

                    <FieldError message={feedback.errors.body} />

                    <p className="mt-2 text-xs text-ink/50">
                        {t('designFeedbackExplanation')}
                    </p>

                    <button
                        type="submit"
                        disabled={feedback.processing}
                        className={`${primaryButton} mt-3 px-5 py-3 disabled:opacity-50`}
                    >
                        {feedback.processing
                            ? translate(language, 'sending')
                            : t('designSendFeedback')}
                    </button>
                </form>
            )}
        </article>
    );
}

function Process({ activeStep }) {
    const { t } = useT();

    const steps = [
        { number: '01', label: t('designStepInspirations'), icon: 'favorite' },
        { number: '02', label: t('designStepArtDirection'), icon: 'palette' },
        { number: '03', label: t('designStepFeedback'), icon: 'edit_note' },
        { number: '04', label: t('designStepFinal'), icon: 'auto_awesome' },
    ];

    const targets = [
        'design-brief',
        'design-proposals',
        'design-feedback',
        'design-final',
    ];

    return (
        <section className="mt-14" aria-label={t('designProgressLabel')}>
            <div className="grid gap-2 sm:grid-cols-4">
                {steps.map((step, index) => {
                    const complete = index < activeStep;
                    const current = index === activeStep;

                    return (
                        <a
                            key={step.number}
                            href={`#${targets[index]}`}
                            className={`${focusRing} relative block min-h-[116px] overflow-hidden p-4 transition-transform hover:-translate-y-0.5 ${processStepStyles[index]} ${current ? 'ring-1 ring-inset ring-ink/25' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] ${
                                        complete || current
                                            ? 'bg-ink text-ivory'
                                            : 'border border-ink/20 text-ink/45'
                                    }`}
                                >
                                    {complete
                                        ? <Icone nom="check" className="text-[15px]" />
                                        : step.number}
                                </span>

                                <Icone
                                    nom={step.icon}
                                    className={`text-[21px] ${current ? 'text-ink' : 'text-sage/60'}`}
                                />
                            </div>

                            <p className={`mt-5 text-[10px] uppercase tracking-[0.1em] ${current ? 'text-ink' : 'text-ink/60'}`}>
                                {step.label}
                            </p>

                            {current && (
                                <p className="mt-1 text-[11px] text-sage">
                                    {t('designCurrentStep')}
                                </p>
                            )}

                            {complete && (
                                <p className="mt-1 text-[11px] text-sage">
                                    {t('designCompleted')}
                                </p>
                            )}

                            {!complete && !current && (
                                <p className="mt-1 text-[11px] text-ink/40">
                                    {t('designComingSoon')}
                                </p>
                            )}
                        </a>
                    );
                })}
            </div>
        </section>
    );
}

export default function Design({
                                   brief,
                                   moodboard,
                                   inspirations,
                                   versions = [],
                                   canEdit,
                               }) {
    const { t } = useT();

    const sortedVersions = [...versions].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    const activeStep = sortedVersions.some((version) => version.approved_at)
        ? 3
        : sortedVersions.length > 0
            ? 2
            : 0;

    return (
        <CoupleLayout active="design">
            <Head title={t('design')} />

            <header className="relative overflow-hidden bg-blush px-6 py-8 sm:px-10 sm:py-12">
                <div className="relative z-10 max-w-2xl">
                    <p className="text-[10px] uppercase tracking-brand text-sage">
                        {t('designArtisticDirection')}
                    </p>

                    <h1 className="mt-7 max-w-xl font-display text-3xl leading-tight sm:text-5xl">
                        {t('designWeddingTitle')}
                    </h1>

                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/65">
                        {t('designIntro')}
                    </p>
                </div>

                <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full border border-ivory/70 sm:h-64 sm:w-64" />
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-ivory/50 sm:h-96 sm:w-96" />
            </header>

            <div className="mx-auto max-w-7xl">
                <Process activeStep={activeStep} />

                <CreativeBrief
                    brief={brief}
                    moodboard={moodboard}
                    inspirations={inspirations}
                    canEdit={canEdit}
                />
            </div>

            <section
                id="design-proposals"
                className="mt-20 scroll-mt-24 bg-blush/70 p-6 sm:p-8 lg:p-10"
                aria-labelledby="proposals-heading"
            >
                <SectionTitle
                    eyebrow={t('designProposalStep')}
                    title={t('designYourProposals')}
                >
                    <Link
                        href={route('couple.documents.index')}
                        className={`${textLink} text-[10px] uppercase tracking-[0.12em]`}
                    >
                        {t('designAllDocuments')}
                        <Icone nom="arrow_forward" className="ml-1 align-middle text-[15px]" />
                    </Link>
                </SectionTitle>

                <p
                    id="proposals-heading"
                    className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/65"
                >
                    {t('designProposalsExplanation')}
                </p>

                {sortedVersions.length === 0 ? (
                    <div className="mt-7 border border-dashed border-ink/20 bg-white px-6 py-12 text-center">
                        <Icone nom="palette" className="text-[28px] text-sage" />

                        <p className="mt-4 font-display text-lg">
                            {t('designFirstProposalComing')}
                        </p>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">
                            {t('designPreparingDirection')}
                        </p>
                    </div>
                ) : (
                    <div className="mt-7 space-y-5">
                        {sortedVersions.map((version, index) => (
                            <VersionCard
                                key={version.id}
                                version={version}
                                featured={index === 0}
                            />
                        ))}
                    </div>
                )}
            </section>

            <aside
                id="design-feedback"
                className="mt-14 flex scroll-mt-24 flex-col gap-4 bg-blush/70 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            >
                <div>
                    <p className="text-[10px] uppercase tracking-brand text-sage">
                        {t('designQuestion')}
                    </p>

                    <p className="mt-2 text-sm text-ink/60">
                        {t('designMessagesExplanation')}
                    </p>
                </div>

                <Link
                    href={route('couple.messages.index')}
                    className={`${secondaryButton} shrink-0 px-5 py-3`}
                >
                    {t('designWriteToJessica')}
                </Link>
            </aside>
        </CoupleLayout>
    );
}
