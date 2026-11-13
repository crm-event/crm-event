import FieldError from '@/Components/FieldError';
import Icone from '@/Components/Icone';
import { fieldLabel, primaryButton } from '@/brand';
import { useTranslation } from '@/i18n';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const RATINGS = [1, 2, 3, 4, 5];

/**
 * "12 juin 2027", from an ISO date.
 */
function formatDate(value, language) {
    return new Date(value).toLocaleDateString(language === 'en' ? 'en-GB' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Star drawn in SVG: the icon font of the site only has outlined symbols.
 */
function Star({ filled, className = '' }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path
                d="M12 2.8l2.84 5.76 6.36.92-4.6 4.48 1.08 6.33L12 17.3l-5.68 2.99 1.08-6.33-4.6-4.48 6.36-.92z"
                fill={filled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Five radio buttons drawn as stars; hovering previews the rating.
 */
function RatingInput({ value, onChange, error }) {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState(null);
    const shown = hovered ?? value;

    return (
        <fieldset aria-describedby={error ? 'rating-error' : undefined}>
            <legend className={fieldLabel}>{t('reviewRating')}</legend>

            <div className="mt-4 flex gap-1" onMouseLeave={() => setHovered(null)}>
                {RATINGS.map((rating) => (
                    <label
                        key={rating}
                        onMouseEnter={() => setHovered(rating)}
                        className="cursor-pointer rounded-md p-1 text-sage has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink"
                    >
                        <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={value === rating}
                            onChange={() => onChange(rating)}
                            className="sr-only"
                        />
                        <span className="sr-only">{t('reviewStars', { value: rating })}</span>
                        <Star filled={shown !== null && rating <= shown} className="h-9 w-9" />
                    </label>
                ))}
            </div>

            <FieldError id="rating-error" message={error} />
        </fieldset>
    );
}

function RecommendInput({ value, onChange, error }) {
    const { t } = useTranslation();
    const choices = [
        { value: true, label: t('reviewYes') },
        { value: false, label: t('reviewNo') },
    ];

    return (
        <fieldset aria-describedby={error ? 'recommend-error' : undefined}>
            <legend className={fieldLabel}>{t('reviewRecommend')}</legend>

            <div className="mt-4 flex gap-3">
                {choices.map((choice) => (
                    <label
                        key={String(choice.value)}
                        className={`cursor-pointer border px-6 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink ${
                            value === choice.value
                                ? 'border-ink bg-ink text-ivory'
                                : 'border-ink/20 text-ink hover:border-ink'
                        }`}
                    >
                        <input
                            type="radio"
                            name="would_recommend"
                            checked={value === choice.value}
                            onChange={() => onChange(choice.value)}
                            className="sr-only"
                        />
                        {choice.label}
                    </label>
                ))}
            </div>

            <FieldError id="recommend-error" message={error} />
        </fieldset>
    );
}

function ReviewForm({ maxBodyLength }) {
    const { t } = useTranslation();
    const form = useForm({ rating: null, would_recommend: null, body: '' });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('couple.review.store'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="mt-12 space-y-10 rounded-3xl border border-ink/10 bg-white p-6 sm:p-10">
            <RatingInput
                value={form.data.rating}
                onChange={(rating) => {
                    form.setData('rating', rating);
                    form.clearErrors('rating');
                }}
                error={form.errors.rating}
            />

            <RecommendInput
                value={form.data.would_recommend}
                onChange={(choice) => {
                    form.setData('would_recommend', choice);
                    form.clearErrors('would_recommend');
                }}
                error={form.errors.would_recommend}
            />

            <div>
                <label htmlFor="review-body" className={fieldLabel}>
                    {t('reviewBody')} <span className="normal-case tracking-normal text-ink/40">({t('reviewOptional')})</span>
                </label>

                <textarea
                    id="review-body"
                    value={form.data.body}
                    onChange={(event) => form.setData('body', event.target.value)}
                    rows={6}
                    maxLength={maxBodyLength}
                    placeholder={t('reviewBodyPlaceholder')}
                    aria-invalid={form.errors.body ? true : undefined}
                    aria-describedby={form.errors.body ? 'body-error' : undefined}
                    className="mt-4 w-full resize-y border border-ink/15 bg-white p-4 text-sm leading-relaxed focus:border-ink focus:ring-0"
                />

                <FieldError id="body-error" message={form.errors.body} />
            </div>

            <div className="flex flex-col gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink/60">{t('reviewOnce')}</p>

                <button type="submit" disabled={form.processing} className={`${primaryButton} disabled:opacity-50`}>
                    {form.processing ? t('sending') : t('reviewSend')}
                </button>
            </div>
        </form>
    );
}

function SubmittedReview({ review }) {
    const { language, t } = useTranslation();

    return (
        <section className="mt-12 rounded-3xl border border-ink/10 bg-white p-6 sm:p-10">
            <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush text-sage">
                    <Icone nom="favorite" className="text-[22px]" />
                </span>
                <div>
                    <h2 className="font-display text-2xl">{t('reviewThanksTitle')}</h2>
                    <p className="mt-2 text-base leading-relaxed text-ink/70">{t('reviewThanksText')}</p>
                </div>
            </div>

            <div className="mt-8 border-t border-ink/10 pt-8">
                <div className="flex gap-1 text-sage" role="img" aria-label={t('reviewStars', { value: review.rating })}>
                    {RATINGS.map((rating) => (
                        <Star key={rating} filled={rating <= review.rating} className="h-6 w-6" />
                    ))}
                </div>

                <p className="mt-4 text-sm text-ink/70">
                    {review.would_recommend ? t('reviewWouldRecommend') : t('reviewWouldNotRecommend')}
                </p>

                {review.body && (
                    <blockquote className="mt-6 whitespace-pre-line border-l-2 border-sage pl-6 font-display text-lg italic leading-relaxed text-ink/80">
                        {review.body}
                    </blockquote>
                )}

                <p className="mt-6 text-[10px] uppercase tracking-[0.12em] text-sage">
                    {t('reviewSentOn')} {formatDate(review.submitted_at, language)}
                </p>
            </div>
        </section>
    );
}

function NotRequested() {
    const { t } = useTranslation();

    return (
        <section className="mt-12 rounded-3xl border border-ink/10 bg-blush/40 p-8 text-center sm:p-12">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-sage">
                <Icone nom="schedule" className="text-[22px]" />
            </span>
            <h2 className="mt-5 font-display text-2xl">{t('reviewNotRequestedTitle')}</h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink/70">{t('reviewNotRequestedText')}</p>
        </section>
    );
}

/**
 * "Votre avis" tab: the couple rates their experience once Jessica has
 * invited them, then sees the review they gave.
 */
export default function Review({ review, maxBodyLength }) {
    const { t } = useTranslation();

    return (
        <CoupleLayout active="review">
            <Head title={t('review')} />

            <p className="text-[11px] uppercase tracking-brand text-sage">{t('reviewEyebrow')}</p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">{t('reviewTitle')}</h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">{t('reviewIntro')}</p>

            {review === null ? (
                <NotRequested />
            ) : review.submitted_at ? (
                <SubmittedReview review={review} />
            ) : (
                <ReviewForm maxBodyLength={maxBodyLength} />
            )}
        </CoupleLayout>
    );
}
