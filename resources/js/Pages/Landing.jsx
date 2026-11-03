import { Head, Link } from '@inertiajs/react';
import { focusRing, primaryButton, secondaryButton } from '@/brand';

/**
 * Public landing page: the screen a visitor sees before logging in.
 *
 * This is not a showcase website: the client already has one
 * (ladernieretouche.com). This page explains what the client area is and how
 * to get access to it. There is deliberately no self sign-up, accounts are
 * created by the coordinator.
 */

// TODO(client): contact details to be confirmed with Jessica before going
// live. "whatsapp" stays empty until the number is validated: the button is
// hidden rather than pointing to a made-up number.
const CONTACT = {
    email: 'contact@laderniertouche.com',
    whatsapp: '',
    website: 'https://www.laderniertouche.com/',
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

/**
 * The four entries follow the journey described by the client
 * ("1 client, 1 digital space"). Task and deadline management is left out:
 * it belongs to the back office, hence to the other group.
 */
const FEATURES = [
    {
        label: 'Votre mariage',
        title: 'Les informations clés',
        text: 'La date, le lieu, les temps forts de la journée et les personnes qui vous accompagnent, réunis sur une seule page.',
    },
    {
        label: 'Votre design',
        title: 'La conception de votre décor',
        text: 'Moodboards, carnet design et projections : vous suivez chaque version et vous y laissez vos commentaires.',
    },
    {
        label: 'Vos documents',
        title: 'Tout au même endroit',
        text: 'Devis, contrat, conditions générales : consultables et téléchargeables à tout moment, sans rechercher un vieil e-mail.',
    },
    {
        label: 'Vos échanges',
        title: 'Une conversation privée',
        text: 'Vos messages avec Jessica et l’historique complet de ce qui a été dit et décidé, conservés d’un bout à l’autre du projet.',
    },
];

/** The access process, as described by the client: nothing is automatic. */
const ACCESS_STEPS = [
    {
        number: '01',
        title: 'Vous faites la demande',
        text: 'Un message à Jessica suffit. Elle vérifie que votre dossier est bien ouvert de son côté.',
    },
    {
        number: '02',
        title: 'Jessica ouvre votre accès',
        text: 'Les comptes ne se créent pas tout seuls : c’est elle qui crée le vôtre, une fois votre devis et votre contrat signés.',
    },
    {
        number: '03',
        title: 'Vous choisissez votre mot de passe',
        text: 'Vous recevez un identifiant et un code provisoire. À la première connexion, vous le remplacez par le vôtre.',
    },
];

export default function Landing({ auth }) {
    // Space of the logged-in user (couple space or back office), null for guests.
    const homeUrl = auth?.homeUrl ?? null;

    return (
        <>
            <Head title="Espace client" />

            <div className="flex min-h-screen flex-col bg-ivory font-sans text-ink">
                <Header homeUrl={homeUrl} />

                <main id="content" className="flex-1">
                    <Hero homeUrl={homeUrl} />
                    <Features />
                    <Access />
                    <Contact />
                </main>

                <Footer />
            </div>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Page sections                                                              */
/* -------------------------------------------------------------------------- */

function Header({ homeUrl }) {
    return (
        <header className="relative border-b border-ink/10">
            <a
                href="#content"
                className={`${focusRing} sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-5 focus:z-10 focus:bg-ink focus:px-4 focus:py-2 focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-ivory`}
            >
                Aller au contenu
            </a>

            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
                <Link href={route('home')} className={`${focusRing} block`}>
                    <span className="block whitespace-nowrap font-display text-[11px] tracking-[0.12em] sm:text-base sm:tracking-[0.18em]">
                        LA DERNIÈRE TOUCHE
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                        Maison de mariage
                    </span>
                </Link>

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
        <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-10 sm:py-28">
            <img
                src="/logo-ldt.png"
                alt="La Dernière Touche"
                className="mx-auto h-20 w-auto sm:h-28"
                width={285}
                height={560}
            />

            <p className="mt-10 text-[11px] uppercase tracking-brand text-sage">
                Espace client
            </p>

            <h1 className="mt-6 font-display text-3xl leading-[1.25] sm:text-4xl lg:text-5xl lg:leading-[1.2]">
                Votre mariage,
                <br />
                réuni en un seul endroit.
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink/70">
                Vos documents, votre carnet design, vos moodboards et vos échanges
                avec Jessica — dans un espace privé qui n’appartient qu’à vous.
            </p>

            <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link href={homeUrl ?? route('login')} className={primaryButton}>
                    {homeUrl ? 'Accéder à mon espace' : 'Se connecter'}
                </Link>
                <a href="#access" className={secondaryButton}>
                    Demander un accès
                </a>
            </div>
        </section>
    );
}

function Features() {
    return (
        <section aria-labelledby="features-title" className="border-t border-ink/10">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
                <h2
                    id="features-title"
                    className="text-center text-[11px] uppercase tracking-brand text-sage"
                >
                    Ce que vous y retrouverez
                </h2>

                <ul className="mt-14 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((feature) => (
                        <li key={feature.label} className="bg-ivory p-8">
                            <p className="text-[10px] uppercase tracking-brand text-sage">
                                {feature.label}
                            </p>
                            <h3 className="mt-5 font-display text-xl leading-snug">
                                {feature.title}
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-ink/70">
                                {feature.text}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Access() {
    return (
        <section id="access" aria-labelledby="access-title" className="scroll-mt-8 bg-blush">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <div className="max-w-xl">
                    <p className="text-[11px] uppercase tracking-brand text-sage">
                        Votre accès
                    </p>
                    <h2
                        id="access-title"
                        className="mt-6 font-display text-2xl leading-snug sm:text-3xl"
                    >
                        Un espace ouvert par Jessica, pour vous seuls.
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-ink/70">
                        Il n’y a pas d’inscription libre. Chaque espace est créé à la
                        main, pour un couple et pour un mariage — personne d’autre n’y
                        a accès.
                    </p>
                </div>

                <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
                    {ACCESS_STEPS.map((step) => (
                        <li key={step.number} className="border-t border-ink/15 pt-6">
                            <p className="font-display text-sm text-sage">
                                {step.number}
                            </p>
                            <h3 className="mt-4 font-display text-lg leading-snug">
                                {step.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">
                                {step.text}
                            </p>
                        </li>
                    ))}
                </ol>

                <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <a href={ACCESS_REQUEST_LINK} className={primaryButton}>
                        Demander un accès
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
        <section aria-labelledby="contact-title" className="border-t border-ink/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 sm:px-10 md:flex-row md:items-end md:justify-between">
                <div className="max-w-md">
                    <p className="text-[11px] uppercase tracking-brand text-sage">
                        Une question
                    </p>
                    <h2
                        id="contact-title"
                        className="mt-6 font-display text-2xl leading-snug"
                    >
                        Écrivez-lui, elle répond.
                    </h2>
                    <p className="mt-5 text-sm leading-relaxed text-ink/70">
                        Avant, pendant, après : vous n’avez jamais besoin d’un compte
                        pour joindre Jessica.
                    </p>
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                    <a
                        href={`mailto:${CONTACT.email}`}
                        className={`${secondaryButton} text-sm normal-case tracking-normal`}
                    >
                        {CONTACT.email}
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
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-ink/10 bg-blush">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
                <p className="font-display text-sm italic text-ink/70">
                    « Faire de votre mariage, votre endroit préféré au monde. »
                </p>

                <div className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em] text-sage md:items-end">
                    <p>Wedding design · Coordination · Officiante</p>
                    <a
                        href={CONTACT.website}
                        target="_blank"
                        rel="noreferrer"
                        className={`${focusRing} transition-colors hover:text-ink`}
                    >
                        laderniertouche.com
                    </a>
                </div>
            </div>
        </footer>
    );
}
