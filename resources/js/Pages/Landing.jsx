import Icone from '@/Components/Icone';
import { focusRing, primaryButton, secondaryButton, textLink } from '@/brand';
import { CONTACT } from '@/contact';
import { useTranslation } from '@/i18n';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

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
 * Landing page: the services of La Dernière Touche and its client area. Every
 * call to action leads to the access request page, the way into the site.
 */
export default function Landing({ auth }) {
    const { content } = useTranslation();

    const homeUrl = auth?.homeUrl ?? null;
    const t = content('landing');
    const images = Object.fromEntries(
        Object.entries(IMAGE_SOURCES).map(([name, src]) => [name, { src, alt: t.images[name] }]),
    );

    return (
        <PublicLayout>
            <Head title={t.pageTitle} />

            <Hero homeUrl={homeUrl} t={t} images={images} />
            <Stats t={t} />
            <Services t={t} images={images} />
            <ClientArea homeUrl={homeUrl} t={t} />
            <About t={t} images={images} />
            <Start homeUrl={homeUrl} t={t} />
        </PublicLayout>
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

function SectionIntro({ id, eyebrow, title, text }) {
    return (
        <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-brand text-sage">{eyebrow}</p>
            <h2 id={id} className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
                {title}
            </h2>
            {text && <p className="mt-6 text-base leading-relaxed text-ink/70">{text}</p>}
        </div>
    );
}

/**
 * Main call to action: the access request for a visitor, their space for a
 * logged-in user.
 */
function PrimaryAction({ homeUrl, label, loggedLabel, className = '' }) {
    return (
        <Link href={homeUrl ?? route('access-request.create')} className={`${primaryButton} ${className}`}>
            {homeUrl ? loggedLabel : label}
        </Link>
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
                        <PrimaryAction homeUrl={homeUrl} label={t.hero.primary} loggedLabel={t.hero.loggedPrimary} />
                        <a href="#prestations" className={secondaryButton}>
                            {t.hero.secondary}
                        </a>
                    </div>

                    {!homeUrl && (
                        <p className="mt-6 text-sm text-ink/70">
                            {t.hero.alreadyClient}{' '}
                            <Link href={route('login')} className={`${textLink} text-ink`}>
                                {t.hero.login}
                            </Link>
                        </p>
                    )}
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
        <section aria-label={t.statsLabel} className="border-b border-ink/10 bg-blush/40">
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
                <SectionIntro id="services-title" eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.text} />

                <div className="mt-14 space-y-10">
                    {t.services.items.map((service, index) => (
                        <article
                            key={service.title}
                            className="grid items-center gap-8 rounded-3xl border border-ink/10 bg-blush/30 p-6 sm:p-8 lg:grid-cols-2 lg:gap-14"
                        >
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
                                        <li key={point} className="border-t border-ink/15 py-3 text-sm last:border-b">
                                            {point}
                                        </li>
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

function ClientArea({ homeUrl, t }) {
    return (
        <section id="espace-client" aria-labelledby="client-area-title" className="scroll-mt-24 bg-blush">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <SectionIntro id="client-area-title" eyebrow={t.clientArea.eyebrow} title={t.clientArea.title} text={t.clientArea.text} />

                <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {t.clientArea.features.map((feature) => (
                        <li key={feature.title} className="rounded-2xl border border-ink/10 bg-ivory p-6">
                            <Icone nom={feature.icon} className="text-[24px] text-sage" />
                            <h3 className="mt-4 font-display text-lg leading-snug">{feature.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{feature.text}</p>
                        </li>
                    ))}
                </ul>

                <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <PrimaryAction homeUrl={homeUrl} label={t.clientArea.cta} loggedLabel={t.hero.loggedPrimary} />
                    {!homeUrl && <p className="max-w-sm text-sm text-ink/70">{t.clientArea.note}</p>}
                </div>
            </div>
        </section>
    );
}

function About({ t, images }) {
    return (
        <section id="a-propos" aria-labelledby="about-title" className="scroll-mt-24">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
                <Photo image={images.jessica} ratio="aspect-[4/5]" rounded="rounded-3xl" />

                <div className="max-w-xl">
                    <p className="text-[10px] uppercase tracking-brand text-sage">{t.about.eyebrow}</p>
                    <h2 id="about-title" className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
                        {t.about.title}
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">{t.about.first}</p>
                    <p className="mt-5 text-base leading-relaxed text-ink/70">{t.about.second}</p>

                    <blockquote className="mt-10 border-l-2 border-sage pl-6 font-display text-xl italic leading-snug text-ink/80 sm:text-2xl">
                        {t.about.quote}
                    </blockquote>
                </div>
            </div>
        </section>
    );
}

/**
 * Last section: the invitation to send a request, and the contact details for
 * a question asked beforehand.
 */
function Start({ homeUrl, t }) {
    const contactLink = `${focusRing} transition-colors hover:text-sage`;

    return (
        <section id="contact" aria-labelledby="start-title" className="scroll-mt-24 border-t border-ink/10 bg-ink text-ivory">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-10 sm:py-24 md:grid-cols-[3fr_2fr] md:items-center md:gap-16">
                <div className="max-w-xl">
                    <p className="text-[10px] uppercase tracking-brand text-ivory/60">{t.start.eyebrow}</p>
                    <h2 id="start-title" className="mt-4 font-display text-3xl leading-snug sm:text-4xl">
                        {t.start.title}
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-ivory/75">{t.start.text}</p>

                    <Link
                        href={homeUrl ?? route('access-request.create')}
                        className={`${focusRing} mt-10 inline-flex items-center justify-center bg-ivory px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-85`}
                    >
                        {homeUrl ? t.hero.loggedPrimary : t.start.button}
                    </Link>
                </div>

                <address className="rounded-3xl border border-ivory/15 p-8 not-italic">
                    <p className="font-display text-lg leading-snug">{t.start.questionsTitle}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ivory/70">{t.start.questionsText}</p>

                    <ul className="mt-6 space-y-3 text-sm">
                        <li>
                            <a href={CONTACT.phoneLink} className={contactLink}>
                                {CONTACT.phone}
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className={contactLink}>
                                {CONTACT.email}
                            </a>
                        </li>
                        <li>
                            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className={contactLink}>
                                Instagram
                            </a>
                        </li>
                    </ul>
                </address>
            </div>
        </section>
    );
}
