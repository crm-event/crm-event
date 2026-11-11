import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import FieldError from '@/Components/FieldError';
import { fieldLabel, focusRing, primaryButton, secondaryButton, textField } from '@/brand';
import { CONTACT } from '@/contact';
import { useTranslation } from '@/i18n';
import PublicLayout from '@/Layouts/PublicLayout';

/** Photos of the page; their alternative texts are in i18n/landing.js. */
const IMAGE_SOURCES = {
    arch: '/images/landing/accueil1.jpg',
    bouquet: '/images/landing/accueil2.jpg',
    design: '/images/landing/wedding-design.jpg',
    coordination: '/images/landing/coordination.jpg',
    officiant: '/images/landing/officiante-de-ceremonie.jpg',
    jessica: '/images/landing/jessica.jpg',
};

/**
 * Link opening the visitor's mail app with a pre-filled project e-mail.
 */
function projectMailLink(mail) {
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body.join('\n'))}`;
}

export default function Landing({ auth }) {
    const { content } = useTranslation();

    const homeUrl = auth?.homeUrl ?? null;
    const t = content('landing');
    const images = Object.fromEntries(
        Object.entries(IMAGE_SOURCES).map(([name, src]) => [name, { src, alt: t.images[name] }]),
    );

    return (
        <>
            <Head title={t.pageTitle} />

            <PublicLayout>
                <Hero homeUrl={homeUrl} t={t} images={images} />
                <Stats t={t} />
                <Services t={t} images={images} />
                <About t={t} images={images} />
                <ClientArea t={t} />
                <Access t={t} />
                <Contact t={t} mailLink={projectMailLink(t.projectMail)} />
            </PublicLayout>
        </>
    );
}

function Photo({ image, ratio, eager = false, className = '', rounded = 'rounded-none' }) {
    const [failed, setFailed] = useState(false);

    return (
        <div className={`${ratio} overflow-hidden bg-blush ${rounded} ${className}`}>
            {!failed && (
                <img
                    src={image.src}
                    alt={image.alt}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                />
            )}
        </div>
    );
}

function SectionIntro({ eyebrow, title, text }) {
    return (
        <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-brand text-sage">{eyebrow}</p>
            <h2 className="mt-4 font-display text-2xl leading-snug sm:text-3xl">{title}</h2>
            <p className="mt-6 text-base leading-relaxed text-ink/70">{text}</p>
        </div>
    );
}

function Hero({ homeUrl, t, images }) {
    return (
        <section className="relative overflow-hidden border-b border-ink/10">
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blush/70 to-transparent" />

            <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 sm:px-10 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
                <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-brand text-sage">{t.hero.eyebrow}</p>
                    <h1 className="mt-5 font-display text-3xl leading-[1.2] sm:text-4xl lg:text-5xl">{t.hero.title}</h1>
                    <p className="mt-8 max-w-xl text-base leading-relaxed text-ink/70">{t.hero.text}</p>

                    <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        {homeUrl ? (
                            <Link href={homeUrl} className={primaryButton}>{t.hero.loggedPrimary}</Link>
                        ) : (
                            <a href="#contact" className={primaryButton}>{t.hero.primary}</a>
                        )}

                        <a href="#prestations" className={secondaryButton}>{t.hero.secondary}</a>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Photo image={images.arch} ratio="aspect-[3/4]" eager rounded="rounded-3xl" />
                    <Photo image={images.bouquet} ratio="aspect-[3/4]" eager className="mt-10" rounded="rounded-3xl" />
                </div>
            </div>
        </section>
    );
}

function Stats({ t }) {
    return (
        <section aria-label="Key figures" className="border-b border-ink/10 bg-blush/40">
            <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:grid-cols-3 sm:px-10">
                {t.stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-ink/10 bg-ivory px-5 py-5">
                        <p className="font-display text-xl">{item.value}</p>
                        <p className="mt-1 text-sm text-ink/70">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Services({ t, images }) {
    return (
        <section id="prestations" aria-labelledby="services-title" className="scroll-mt-24">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <SectionIntro eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.text} />

                <div className="mt-14 space-y-10">
                    {t.services.items.map((service, index) => (
                        <article key={service.title} className="grid items-center gap-8 rounded-3xl border border-ink/10 bg-blush/30 p-6 sm:p-8 lg:grid-cols-2 lg:gap-14">
                            <Photo
                                image={images[service.image]}
                                ratio="aspect-[5/4]"
                                rounded="rounded-2xl"
                                className={index % 2 === 1 ? 'lg:order-2' : ''}
                            />

                            <div className="max-w-md">
                                <p className="text-[10px] uppercase tracking-brand text-sage">{service.phase}</p>
                                <h3 className="mt-4 font-display text-2xl leading-snug">{service.title}</h3>
                                <p className="mt-4 text-sm leading-relaxed text-ink/70">{service.text}</p>

                                <ul className="mt-6">
                                    {service.points.map((point) => (
                                        <li key={point} className="border-t border-ink/15 py-3 text-sm last:border-b">{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function About({ t, images }) {
    return (
        <section
            id="a-propos"
            aria-labelledby="about-title"
            className="scroll-mt-24 border-t border-ink/10"
        >
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
                <Photo
                    image={images.jessica}
                    ratio="aspect-[4/5]"
                    rounded="rounded-3xl"
                />

                <div className="max-w-xl">
                    <p className="text-[10px] uppercase tracking-brand text-sage">
                        {t.about.eyebrow}
                    </p>

                    <h2
                        id="about-title"
                        className="mt-4 font-display text-2xl leading-snug sm:text-3xl"
                    >
                        {t.about.title}
                    </h2>

                    <p className="mt-6 text-base leading-relaxed text-ink/70">
                        {t.about.first}
                    </p>

                    <p className="mt-5 text-base leading-relaxed text-ink/70">
                        {t.about.second}
                    </p>
                </div>
            </div>
        </section>
    );
}
function ClientArea({ t }) {
    return (
        <section id="espace-client" aria-labelledby="client-area-title" className="scroll-mt-24 bg-blush">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
                <div className="max-w-sm">
                    <h2 id="client-area-title" className="font-display text-2xl leading-snug sm:text-3xl">{t.client.title}</h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">{t.client.text}</p>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2">
                    {t.client.features.map(([title, text]) => (
                        <li key={title} className="rounded-2xl border border-ink/10 bg-ivory p-6">
                            <h3 className="font-display text-lg leading-snug">{title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/**
 * Form to request a client space. Jessica accepts or refuses each request; the
 * confirmation is the same whatever the address, so that the form does not tell
 * who already has an account. `website` is a field only robots fill in.
 */
function AccessRequestForm({ t }) {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        partner1_first_name: '',
        partner2_first_name: '',
        email: '',
        wedding_date: '',
        website: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('access-request.store'), { preserveScroll: true });
    };

    if (wasSuccessful) {
        return (
            <p role="status" className="mt-14 max-w-2xl rounded-2xl border border-ink/10 bg-white p-6 text-base leading-relaxed sm:p-8">
                {t.access.form.sent}
            </p>
        );
    }

    const fields = [
        { name: 'partner1_first_name', label: t.access.form.firstName, autoComplete: 'given-name' },
        { name: 'partner2_first_name', label: t.access.form.partnerFirstName, autoComplete: 'off' },
        { name: 'email', label: t.access.form.email, type: 'email', autoComplete: 'email' },
        { name: 'wedding_date', label: t.access.form.weddingDate, type: 'date', autoComplete: 'off' },
    ];

    return (
        <form onSubmit={submit} className="mt-14 max-w-2xl rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
            <h3 className="font-display text-xl">{t.access.form.title}</h3>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
                {fields.map(({ name, label, type = 'text', autoComplete }) => (
                    <div key={name}>
                        <label htmlFor={`access-${name}`} className={fieldLabel}>{label}</label>
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
                className={`${primaryButton} mt-10 w-full disabled:cursor-wait disabled:opacity-50 sm:w-auto`}
            >
                {processing ? t.access.form.sending : t.access.request}
            </button>
        </form>
    );
}

function Access({ t }) {
    return (
        <section id="access" aria-labelledby="access-title" className="scroll-mt-24 border-y border-ink/10">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <div className="max-w-xl">
                    <h2 id="access-title" className="font-display text-2xl leading-snug sm:text-3xl">{t.access.title}</h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">{t.access.text}</p>
                </div>

                <ol className="mt-14 grid gap-5 sm:grid-cols-3 sm:gap-6">
                    {t.access.steps.map(([number, title, text]) => (
                        <li key={number} className="rounded-2xl border border-ink/10 bg-blush/40 p-6">
                            <p className="font-display text-sm text-sage">{number}</p>
                            <h3 className="mt-3 font-display text-lg leading-snug">{title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{text}</p>
                        </li>
                    ))}
                </ol>

                <AccessRequestForm t={t} />

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <Link href={route('login')} className={secondaryButton}>{t.access.login}</Link>
                </div>
            </div>
        </section>
    );
}

function Contact({ t, mailLink }) {
    return (
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24 bg-blush">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:px-10 md:grid-cols-[1fr_1fr] md:items-end">
                <div className="max-w-md">
                    <h2 id="contact-title" className="font-display text-2xl leading-snug sm:text-3xl">{t.contact.title}</h2>
                    <p className="mt-5 text-sm leading-relaxed text-ink/70">{t.contact.text}</p>

                    <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
                        <a href={mailLink} className={primaryButton}>{t.contact.button}</a>

                        <a
                            href={CONTACT.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className={secondaryButton}
                        >
                            {t.contact.instagram}
                        </a>

                        {CONTACT.whatsapp.length > 0 && (
                            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className={secondaryButton}>
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>

                <address className="rounded-3xl border border-ink/10 bg-ivory p-8 not-italic">
                    <p className="text-[10px] uppercase tracking-brand text-sage">{t.contact.label}</p>

                    <ul className="mt-6 space-y-4 text-sm leading-relaxed">
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className={`${focusRing} transition-colors hover:text-sage}`}>
                                {CONTACT.email}
                            </a>
                        </li>
                        <li>
                            <a href={CONTACT.phoneLink} className={`${focusRing} transition-colors hover:text-sage}`}>
                                {CONTACT.phone}
                            </a>
                        </li>
                        <li className="text-ink/70">{CONTACT.address}</li>
                    </ul>

                    <p className="mt-6 border-t border-ink/10 pt-6 text-xs leading-relaxed text-ink/50">{t.contact.note}</p>
                </address>
            </div>
        </section>
    );
}
