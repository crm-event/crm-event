import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { focusRing, primaryButton, secondaryButton } from '@/brand';

/**
 * Public landing page: the screen a visitor sees before logging in.
 *
 * It presents La Dernière Touche (wedding design, coordination and ceremony
 * officiant in Provence and on the French Riviera) and explains what the
 * client area is and how to get access to it. Every fact comes from the
 * client's own documents (docs/CONTEXTE-PROJET.md): no figure or story is
 * made up.
 *
 * There is deliberately no self sign-up: accounts are created by the
 * coordinator.
 */

// TODO(client): confirm with Jessica before going live. "whatsapp" stays
// empty until the number is validated (probably the same as the phone,
// i.e. 33769889271): the button is hidden rather than pointing to a guess.
const CONTACT = {
    email: 'ladernieretouche.event@gmail.com',
    phone: '07 69 88 92 71',
    phoneLink: 'tel:+33769889271',
    address: '9 boulevard René Chaillan, 13013 Marseille',
    siret: '984 937 078 00017',
    whatsapp: '',
    website: 'https://www.ladernieretouche.com/',
};

/**
 * Line-art illustrations drawn in the brand colors (public/images/landing/).
 * They are decorative, hence the empty `alt`.
 *
 * TODO(client): replace them with photos from Jessica's portfolio once she
 * has provided them and agreed to their use; give each photo a real `alt`.
 * Stock photos must not be used: they would pass for her own weddings.
 */
const IMAGES = {
    arch: { src: '/images/landing/ceremony-arch.svg', alt: '' },
    bouquet: { src: '/images/landing/bouquet.svg', alt: '' },
    design: { src: '/images/landing/reception-table.svg', alt: '' },
    coordination: { src: '/images/landing/planning.svg', alt: '' },
    officiant: { src: '/images/landing/story-book.svg', alt: '' },
};

const ACCESS_REQUEST_SUBJECT = 'Demande d’accès à notre espace client';

const ACCESS_REQUEST_BODY = [
    'Bonjour Jessica,',
    '',
    'Nous souhaitons accéder à notre espace client.',
    '',
    'Nos prénoms :',
    'Date du mariage :',
    'Lieu :',
    'E-mail de contact :',
    'Téléphone :',
    '',
    'Merci beaucoup,',
].join('\n');

// TODO(API): replace this mailto with a real form once an access request
// route exists. The page will stay the same, only this link becomes a <form>.
const ACCESS_REQUEST_LINK =
    `mailto:${CONTACT.email}` +
    `?subject=${encodeURIComponent(ACCESS_REQUEST_SUBJECT)}` +
    `&body=${encodeURIComponent(ACCESS_REQUEST_BODY)}`;

// First contact from a couple who is not a client yet. The fields follow a
// typical request received by the client: date, venue, number of guests and
// inspirations, then a first meeting.
const PROJECT_REQUEST_BODY = [
    'Bonjour Jessica,',
    '',
    'Nous souhaitons vous présenter notre projet de mariage.',
    '',
    'Nos prénoms :',
    'Date du mariage :',
    'Lieu :',
    'Nombre d’invités (environ) :',
    'Prestations qui nous intéressent (décoration, coordination, officiante) :',
    'Comment nous vous avons connue :',
    'Téléphone :',
    '',
    'Nous pouvons vous envoyer quelques inspirations.',
    '',
    'Merci beaucoup,',
].join('\n');

const PROJECT_REQUEST_LINK =
    `mailto:${CONTACT.email}` +
    `?subject=${encodeURIComponent('Notre projet de mariage')}` +
    `&body=${encodeURIComponent(PROJECT_REQUEST_BODY)}`;

const NAV = [
    { href: '#prestations', label: 'Prestations' },
    { href: '#a-propos', label: 'À propos' },
    { href: '#espace-client', label: 'Espace client' },
    { href: '#contact', label: 'Contact' },
];

/**
 * The three services sold by the client, with their content as described in
 * her presentation and her terms and conditions.
 */
const SERVICES = [
    {
        phase: 'Concevoir',
        title: 'Wedding design',
        text: 'De la première ébauche de moodboard au carnet design, nous imaginons votre décor : réception, signalétique, cérémonie et fleurs. Nous l’installons le jour J et le démontons le lendemain.',
        points: [
            'Moodboard, devis puis carnet design',
            'Points d’étape à M-6, M-3 et M-1',
            'Installation le jour J, désinstallation le lendemain',
        ],
        image: IMAGES.design,
    },
    {
        phase: 'Organiser',
        title: 'Coordination',
        text: 'Nous optimisons avec vous le planning de la journée, nous contactons vos prestataires et nous vérifions que chaque animation se déroule comme prévu.',
        points: [
            'Planning de la journée construit avec vous',
            'Contact et suivi de vos prestataires',
            'Vérification des animations',
        ],
        image: IMAGES.coordination,
    },
    {
        phase: 'Célébrer',
        title: 'Officiante de cérémonie',
        text: 'Une cérémonie qui raconte votre histoire : nous la préparons avec vous, nous l’écrivons, puis nous l’animons le jour J.',
        points: [
            '10 questionnaires « carnet d’histoire »',
            '3 rendez-vous étape',
            'Rédaction et animation de la cérémonie',
        ],
        image: IMAGES.officiant,
    },
];

// TODO(client): add real reviews as { quote, author }. The section is
// hidden while the list is empty, so nothing made up is ever shown.
const TESTIMONIALS = [];

/**
 * The four entries follow the journey described by the client
 * ("1 client, 1 digital space"). Task and deadline management is left out:
 * it belongs to the back office, hence to the other group.
 */
const FEATURES = [
    { title: 'Le projet en un coup d’œil', text: 'Date, lieu, temps forts de la journée et personnes impliquées, sur une seule page.' },
    { title: 'Votre design', text: 'Moodboards, carnet design et projections : suivez chaque version et laissez vos commentaires.' },
    { title: 'Vos documents', text: 'Devis, contrat et conditions générales, à consulter et télécharger à tout moment.' },
    { title: 'Vos échanges', text: 'Vos messages avec Jessica et l’historique de ce qui a été décidé, au même endroit.' },
];

/** The access process, as described by the client: nothing is automatic. */
const ACCESS_STEPS = [
    { number: '01', title: 'Vous nous écrivez', text: 'Un simple message suffit. Nous vérifions que votre dossier est bien ouvert.' },
    { number: '02', title: 'Nous ouvrons votre accès', text: 'Votre compte est créé par nos soins, une fois votre devis et votre contrat signés.' },
    { number: '03', title: 'Vous choisissez votre mot de passe', text: 'Vous recevez un identifiant et un code provisoire, à remplacer dès la première connexion.' },
];

/** Key facts, all taken from the client's presentation. */
const STATS = [
    { value: 'Depuis 2024', label: 'Une maison fondée à Marseille' },
    { value: '10 à 15', label: 'Mariages accompagnés chaque année' },
    { value: '1 couple', label: '1 espace client dédié' },
];

export default function Landing({ auth }) {
    const homeUrl = auth?.homeUrl ?? null;

    return (
        <>
            <Head title="La Dernière Touche · Wedding design & coordination en Provence" />

            <div className="flex min-h-screen flex-col bg-ivory font-sans text-ink">
                <Header homeUrl={homeUrl} />

                <main id="content" className="flex-1">
                    <Hero homeUrl={homeUrl} />
                    <Stats />
                    <Services />
                    <About />
                    <Testimonials />
                    <ClientArea />
                    <Access />
                    <Contact />
                </main>

                <Footer />
            </div>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Page sections                                                              */
/* -------------------------------------------------------------------------- */

function Header({ homeUrl }) {
    return (
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/95 backdrop-blur">
            <a
                href="#content"
                className={`${focusRing} sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-5 focus:z-10 focus:bg-ink focus:px-4 focus:py-2 focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-ivory`}
            >
                Aller au contenu
            </a>

            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
                <Link href={route('home')} className={`${focusRing} block`}>
                    <span className="block whitespace-nowrap font-display text-[11px] tracking-[0.12em] sm:text-base sm:tracking-[0.18em]">
                        LA DERNIÈRE TOUCHE
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                        Wedding design & coordination
                    </span>
                </Link>

                <nav aria-label="Navigation principale" className="hidden lg:block">
                    <ul className="flex items-center gap-8">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className={`${focusRing} text-[11px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink`}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <Link
                    href={homeUrl ?? route('login')}
                    className={`${focusRing} shrink-0 border border-ink/20 px-5 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-ink hover:bg-ink hover:text-ivory`}
                >
                    {homeUrl ? 'Mon espace' : 'Se connecter'}
                </Link>
            </div>
        </header>
    );
}

function Hero({ homeUrl }) {
    return (
        <section className="relative overflow-hidden border-b border-ink/10">
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blush/70 to-transparent" />

            <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 sm:px-10 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
                <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-brand text-sage">Provence & Côte d’Azur</p>

                    <h1 className="mt-5 font-display text-3xl leading-[1.2] sm:text-4xl lg:text-5xl">
                        Votre mariage, pensé avec élégance du premier rendez-vous au dernier invité.
                    </h1>

                    <p className="mt-8 max-w-xl text-base leading-relaxed text-ink/70">
                        Wedding design, coordination et officiante de cérémonie : une direction claire,
                        un cadre rassurant, et une ambiance qui vous ressemble vraiment.
                    </p>

                    <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        {homeUrl ? (
                            <Link href={homeUrl} className={primaryButton}>
                                Accéder à mon espace
                            </Link>
                        ) : (
                            <a href="#contact" className={primaryButton}>
                                Parler de votre projet
                            </a>
                        )}

                        <a href="#prestations" className={secondaryButton}>
                            Découvrir nos prestations
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Photo image={IMAGES.arch} ratio="aspect-[3/4]" eager rounded="rounded-3xl" />
                    <Photo
                        image={IMAGES.bouquet}
                        ratio="aspect-[3/4]"
                        eager
                        className="mt-10"
                        rounded="rounded-3xl"
                    />
                </div>
            </div>
        </section>
    );
}

function Stats() {
    return (
        <section aria-label="Repères" className="border-b border-ink/10 bg-blush/40">
            <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:grid-cols-3 sm:px-10">
                {STATS.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-ink/10 bg-ivory px-5 py-5">
                        <p className="font-display text-xl">{item.value}</p>
                        <p className="mt-1 text-sm text-ink/70">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Services() {
    return (
        <section id="prestations" aria-labelledby="services-title" className="scroll-mt-24">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <SectionIntro
                    eyebrow="Prestations"
                    title="Trois savoir-faire, au rythme de votre mariage."
                    text="Ils s’associent librement : décoration et coordination, décoration et officiante, ou officiante et coordination."
                />

                <div className="mt-14 space-y-10">
                    {SERVICES.map((service, index) => (
                        <article
                            key={service.title}
                            className="grid items-center gap-8 rounded-3xl border border-ink/10 bg-blush/30 p-6 sm:p-8 lg:grid-cols-2 lg:gap-14"
                        >
                            <Photo
                                image={service.image}
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
                                        <li
                                            key={point}
                                            className="border-t border-ink/15 py-3 text-sm last:border-b"
                                        >
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

function About() {
    return (
        <section id="a-propos" aria-labelledby="about-title" className="scroll-mt-24 border-t border-ink/10">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
                {/* TODO(client): a portrait of Jessica can replace this panel once she provides one. */}
                <figure className="flex aspect-[4/5] flex-col items-center justify-center rounded-3xl bg-blush px-10 text-center">
                    <img src="/logo-ldt.png" alt="" className="h-32 w-auto" width={285} height={560} />
                    <blockquote className="mt-10 font-display text-xl italic leading-snug text-ink/80">
                        «&nbsp;Faire de votre mariage, votre endroit préféré au monde.&nbsp;»
                    </blockquote>
                </figure>

                <div className="max-w-xl">
                    <p className="text-[10px] uppercase tracking-brand text-sage">À propos</p>
                    <h2 id="about-title" className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
                        Jessica Salles, fondatrice de La Dernière Touche.
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">
                        Jessica a créé La Dernière Touche à Marseille en 2024. Elle accompagne chaque année
                        10 à 15 couples, de France et de l’étranger, en Provence et sur la Côte d’Azur.
                    </p>
                    <p className="mt-5 text-base leading-relaxed text-ink/70">
                        Elle suit elle-même chaque projet, du premier rendez-vous jusqu’au jour J, et
                        s’entoure de prestataires de confiance pour les grands jours.
                    </p>
                </div>
            </div>
        </section>
    );
}

function Testimonials() {
    if (TESTIMONIALS.length === 0) return null;

    return (
        <section aria-labelledby="testimonials-title">
            <div className="mx-auto max-w-3xl px-6 py-20 sm:px-10 sm:py-24">
                <h2 id="testimonials-title" className="font-display text-2xl leading-snug sm:text-3xl">
                    Ils nous ont fait confiance
                </h2>
                <div className="mt-10 space-y-10">
                    {TESTIMONIALS.map((item) => (
                        <figure key={item.author} className="rounded-2xl border border-ink/10 bg-blush/40 p-7">
                            <blockquote className="font-display text-lg leading-relaxed">
                                «&nbsp;{item.quote}&nbsp;»
                            </blockquote>
                            <figcaption className="mt-5 text-[11px] uppercase tracking-[0.18em] text-sage">
                                {item.author}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ClientArea() {
    return (
        <section id="espace-client" aria-labelledby="client-area-title" className="scroll-mt-24 bg-blush">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
                <div className="max-w-sm">
                    <h2 id="client-area-title" className="font-display text-2xl leading-snug sm:text-3xl">
                        Un espace privé pour suivre votre mariage.
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">
                        Chaque couple accompagné retrouve son projet au même endroit, du premier devis au jour J.
                    </p>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2">
                    {FEATURES.map((feature) => (
                        <li key={feature.title} className="rounded-2xl border border-ink/10 bg-ivory p-6">
                            <h3 className="font-display text-lg leading-snug">{feature.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{feature.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Access() {
    return (
        <section id="access" aria-labelledby="access-title" className="scroll-mt-24 border-y border-ink/10">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <div className="max-w-xl">
                    <h2 id="access-title" className="font-display text-2xl leading-snug sm:text-3xl">
                        Un accès ouvert pour vous, personnellement.
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">
                        Pas d’inscription en ligne : chaque accès est créé à la main, pour un couple et pour un mariage.
                        Personne d’autre n’y a accès.
                    </p>
                </div>

                <ol className="mt-14 grid gap-5 sm:grid-cols-3 sm:gap-6">
                    {ACCESS_STEPS.map((step) => (
                        <li key={step.number} className="rounded-2xl border border-ink/10 bg-blush/40 p-6">
                            <p className="font-display text-sm text-sage">{step.number}</p>
                            <h3 className="mt-3 font-display text-lg leading-snug">{step.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{step.text}</p>
                        </li>
                    ))}
                </ol>

                <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <a href={ACCESS_REQUEST_LINK} className={primaryButton}>
                        Demander mon accès
                    </a>
                    <Link href={route('login')} className={secondaryButton}>
                        J’ai déjà un identifiant
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section
            id="contact"
            aria-labelledby="contact-title"
            className="scroll-mt-24 bg-blush"
        >
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:px-10 md:grid-cols-[1fr_1fr] md:items-end">
                <div className="max-w-md">
                    <h2 id="contact-title" className="font-display text-2xl leading-snug sm:text-3xl">
                        Parlons de votre projet.
                    </h2>
                    <p className="mt-5 text-sm leading-relaxed text-ink/70">
                        Dites-nous la date, le lieu, le nombre d’invités et l’ambiance que vous imaginez :
                        nous vous proposerons un premier rendez-vous. Aucun compte n’est nécessaire pour
                        nous écrire.
                    </p>

                    <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row">
                        <a href={PROJECT_REQUEST_LINK} className={primaryButton}>
                            Présenter mon projet
                        </a>
                        {CONTACT.whatsapp.length > 0 && (
                            <a
                                href={`https://wa.me/${CONTACT.whatsapp}`}
                                target="_blank"
                                rel="noreferrer"
                                className={secondaryButton}
                            >
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>

                <address className="rounded-3xl border border-ink/10 bg-ivory p-8 not-italic">
                    <p className="text-[10px] uppercase tracking-brand text-sage">Nous joindre</p>
                    <ul className="mt-6 space-y-4 text-sm leading-relaxed">
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className={`${focusRing} transition-colors hover:text-sage`}>
                                {CONTACT.email}
                            </a>
                        </li>
                        <li>
                            <a href={CONTACT.phoneLink} className={`${focusRing} transition-colors hover:text-sage`}>
                                {CONTACT.phone}
                            </a>
                        </li>
                        <li className="text-ink/70">{CONTACT.address}</li>
                    </ul>
                    <p className="mt-6 border-t border-ink/10 pt-6 text-xs leading-relaxed text-ink/50">
                        Les demandes arrivent aussi par Instagram et par le site : toutes sont lues par Jessica.
                    </p>
                </address>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-ink/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <img src="/logo-ldt.png" alt="" className="h-14 w-auto" width={285} height={560} />
                    <div className="max-w-xs">
                        <p className="font-display text-sm tracking-[0.18em]">LA DERNIÈRE TOUCHE</p>
                        <p className="mt-3 text-sm leading-relaxed text-ink/70">
                            Wedding design, coordination et officiante de cérémonie en
                            Provence et sur la Côte d’Azur.
                        </p>
                    </div>
                </div>

                <nav aria-label="Pied de page">
                    <ul className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em] text-sage">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className={`${focusRing} transition-colors hover:text-ink`}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-col gap-2 text-sm text-ink/70 md:items-end">
                    <a href={`mailto:${CONTACT.email}`} className={`${focusRing} transition-colors hover:text-ink`}>
                        {CONTACT.email}
                    </a>
                    <a href={CONTACT.phoneLink} className={`${focusRing} transition-colors hover:text-ink`}>
                        {CONTACT.phone}
                    </a>
                    <a
                        href={CONTACT.website}
                        target="_blank"
                        rel="noreferrer"
                        className={`${focusRing} transition-colors hover:text-ink`}
                    >
                        Voir le portfolio
                    </a>
                </div>
            </div>

            {/* TODO(legal): add links to the legal notice and the privacy
                policy (required for a French commercial website). */}
            <div className="border-t border-ink/10 bg-blush">
                <p className="mx-auto max-w-6xl px-6 py-5 text-[11px] text-ink/60 sm:px-10">
                    © {new Date().getFullYear()} La Dernière Touche · SIRET {CONTACT.siret}
                </p>
            </div>
        </footer>
    );
}
