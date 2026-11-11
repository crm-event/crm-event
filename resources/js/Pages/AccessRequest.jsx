import FieldError from '@/Components/FieldError';
import { fieldLabel, primaryButton, secondaryButton, textField, textLink } from '@/brand';
import { useTranslation } from '@/i18n';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Page where a couple asks for a client space. Each request reaches Jessica's
 * list of inquiries; she accepts or refuses it (Admin/CoupleController).
 */
export default function AccessRequest() {
    const { t, content } = useTranslation();

    return (
        <PublicLayout>
            <Head title={t('accessRequest.pageTitle')} />

            <div className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blush/70 to-transparent" />

                <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
                    <div>
                        <p className="text-[10px] uppercase tracking-brand text-sage">{t('accessRequest.eyebrow')}</p>
                        <h1 className="mt-5 font-display text-3xl leading-[1.2] sm:text-4xl">{t('accessRequest.title')}</h1>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">{t('accessRequest.intro')}</p>

                        <h2 className="mt-12 text-[10px] uppercase tracking-brand text-sage">{t('accessRequest.stepsTitle')}</h2>
                        <ol className="mt-6 space-y-6">
                            {content('accessRequest.steps').map((step, index) => (
                                <li key={step.title} className="flex gap-5">
                                    <span className="font-display text-sm text-sage">{String(index + 1).padStart(2, '0')}</span>
                                    <div>
                                        <h3 className="font-display text-lg leading-snug">{step.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <p className="mt-10 border-l-2 border-sage pl-4 text-sm leading-relaxed text-ink/70">
                            {t('accessRequest.privateNote')}
                        </p>
                    </div>

                    <div>
                        <AccessRequestForm />

                        <p className="mt-6 text-sm text-ink/70">
                            {t('accessRequest.alreadyAccess')}{' '}
                            <Link href={route('login')} className={`${textLink} text-ink`}>
                                {t('accessRequest.login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

/**
 * The confirmation is the same whatever the address, so that the form does
 * not tell who already has an account. `website` is a field only robots fill
 * in.
 */
function AccessRequestForm() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        partner1_first_name: '',
        partner2_first_name: '',
        email: '',
        wedding_date: '',
        website: '',
    });

    const submit = (event) => {
        event.preventDefault();
        // The server sends the visitor back to this page: keep the component,
        // so that the confirmation can replace the form.
        post(route('access-request.store'), { preserveScroll: true, preserveState: true });
    };

    if (wasSuccessful) {
        return (
            <div role="status" className="rounded-3xl border border-ink/10 bg-white p-8 sm:p-10">
                <h2 className="font-display text-2xl leading-snug">{t('accessRequest.sent.title')}</h2>
                <p className="mt-4 text-base leading-relaxed text-ink/70">{t('accessRequest.sent.text')}</p>
                <Link href={route('home')} className={`${secondaryButton} mt-8`}>
                    {t('accessRequest.sent.backHome')}
                </Link>
            </div>
        );
    }

    const fields = [
        { name: 'partner1_first_name', label: t('accessRequest.form.firstName'), autoComplete: 'given-name' },
        { name: 'partner2_first_name', label: t('accessRequest.form.partnerFirstName'), autoComplete: 'off' },
        { name: 'email', label: t('accessRequest.form.email'), type: 'email', autoComplete: 'email' },
        { name: 'wedding_date', label: t('accessRequest.form.weddingDate'), type: 'date', autoComplete: 'off' },
    ];

    return (
        <form onSubmit={submit} className="relative rounded-3xl border border-ink/10 bg-white p-8 sm:p-10">
            <h2 className="font-display text-2xl leading-snug">{t('accessRequest.form.title')}</h2>

            <div className="mt-8 space-y-8">
                {fields.map(({ name, label, type = 'text', autoComplete }) => (
                    <div key={name}>
                        <label htmlFor={`access-${name}`} className={fieldLabel}>
                            {label}
                        </label>
                        <input
                            id={`access-${name}`}
                            type={type}
                            value={data[name]}
                            autoComplete={autoComplete}
                            aria-invalid={Boolean(errors[name])}
                            aria-describedby={errors[name] ? `access-${name}-error` : undefined}
                            onChange={(event) => setData(name, event.target.value)}
                            className={`${textField} mt-2`}
                        />
                        <FieldError id={`access-${name}-error`} message={errors[name]} />
                    </div>
                ))}
            </div>

            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="access-website">Website</label>
                <input
                    id="access-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(event) => setData('website', event.target.value)}
                />
            </div>

            <button
                type="submit"
                disabled={processing}
                className={`${primaryButton} mt-10 w-full disabled:cursor-wait disabled:opacity-50`}
            >
                {processing ? t('accessRequest.form.sending') : t('accessRequest.form.submit')}
            </button>

            <p className="mt-4 text-xs leading-relaxed text-ink/50">{t('accessRequest.form.privacy')}</p>
        </form>
    );
}
