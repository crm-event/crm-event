import { Head, Link } from '@inertiajs/react';
import { anneauFocus, boutonPrincipal, boutonSecondaire } from '@/charte';

/**
 * Page d'accueil publique — l'écran que voit un visiteur avant de se connecter.
 *
 * Ce n'est pas un site vitrine : la cliente en a déjà un
 * (ladernieretouche.com). Cette page explique ce qu'est l'espace client et
 * comment y accéder. Il n'y a volontairement aucune inscription libre, les
 * comptes sont créés par la coordinatrice.
 */

// TODO(cliente) : coordonnées à confirmer avec Jessica avant toute mise en
// ligne. « whatsapp » reste vide tant que le numéro n'est pas validé : le
// bouton ne s'affiche pas plutôt que de pointer vers un numéro inventé.
const CONTACT = {
    email: 'contact@laderniertouche.com',
    whatsapp: '',
    website: 'https://www.laderniertouche.com/',
};

const DEMANDE_SUJET = 'Demande d’accès à notre espace client';

const DEMANDE_CORPS = [
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

// TODO(API) : remplacer ce mailto par un vrai formulaire le jour où une route
// de demande d'accès existera. La page ne bougera pas, seul ce lien deviendra
// un <form>.
const LIEN_DEMANDE =
    `mailto:${CONTACT.email}` +
    `?subject=${encodeURIComponent(DEMANDE_SUJET)}` +
    `&body=${encodeURIComponent(DEMANDE_CORPS)}`;

/**
 * Les quatre entrées reprennent le parcours décrit par la cliente
 * (« 1 client, 1 espace digital »). La gestion des tâches et des échéances n'y
 * figure pas : elle relève du back-office, donc de l'autre groupe.
 */
const RUBRIQUES = [
    {
        label: 'Votre mariage',
        titre: 'Les informations clés',
        texte: 'La date, le lieu, les temps forts de la journée et les personnes qui vous accompagnent, réunis sur une seule page.',
    },
    {
        label: 'Votre design',
        titre: 'La conception de votre décor',
        texte: 'Moodboards, carnet design et projections : vous suivez chaque version et vous y laissez vos commentaires.',
    },
    {
        label: 'Vos documents',
        titre: 'Tout au même endroit',
        texte: 'Devis, contrat, conditions générales : consultables et téléchargeables à tout moment, sans rechercher un vieil e-mail.',
    },
    {
        label: 'Vos échanges',
        titre: 'Une conversation privée',
        texte: 'Vos messages avec Jessica et l’historique complet de ce qui a été dit et décidé, conservés d’un bout à l’autre du projet.',
    },
];

/** Le parcours d'accès, tel que la cliente l'a décrit : rien d'automatique. */
const ETAPES = [
    {
        numero: '01',
        titre: 'Vous faites la demande',
        texte: 'Un message à Jessica suffit. Elle vérifie que votre dossier est bien ouvert de son côté.',
    },
    {
        numero: '02',
        titre: 'Jessica ouvre votre accès',
        texte: 'Les comptes ne se créent pas tout seuls : c’est elle qui crée le vôtre, une fois votre devis et votre contrat signés.',
    },
    {
        numero: '03',
        titre: 'Vous choisissez votre mot de passe',
        texte: 'Vous recevez un identifiant et un code provisoire. À la première connexion, vous le remplacez par le vôtre.',
    },
];

export default function Landing({ auth }) {
    const connecte = Boolean(auth?.user);

    return (
        <>
            <Head title="Espace client" />

            <div className="flex min-h-screen flex-col bg-ivory font-sans text-ink">
                <EnTete connecte={connecte} />

                <main id="contenu" className="flex-1">
                    <Hero connecte={connecte} />
                    <Rubriques />
                    <Acces />
                    <Contact />
                </main>

                <PiedDePage />
            </div>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Blocs de la page                                                           */
/* -------------------------------------------------------------------------- */

function EnTete({ connecte }) {
    return (
        <header className="relative border-b border-ink/10">
            <a
                href="#contenu"
                className={`${anneauFocus} sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-5 focus:z-10 focus:bg-ink focus:px-4 focus:py-2 focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-ivory`}
            >
                Aller au contenu
            </a>

            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
                <Link href="/" className={`${anneauFocus} block`}>
                    <span className="block whitespace-nowrap font-display text-[11px] tracking-[0.12em] sm:text-base sm:tracking-[0.18em]">
                        LA DERNIÈRE TOUCHE
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                        Maison de mariage
                    </span>
                </Link>

                <Link
                    href={connecte ? route('dashboard') : route('login')}
                    className={`${anneauFocus} shrink-0 border border-ink/20 px-5 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-ink hover:bg-ink hover:text-ivory`}
                >
                    {connecte ? 'Mon espace' : 'Se connecter'}
                </Link>
            </div>
        </header>
    );
}

function Hero({ connecte }) {
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
                <Link
                    href={connecte ? route('dashboard') : route('login')}
                    className={boutonPrincipal}
                >
                    {connecte ? 'Accéder à mon espace' : 'Se connecter'}
                </Link>
                <a href="#acces" className={boutonSecondaire}>
                    Demander un accès
                </a>
            </div>
        </section>
    );
}

function Rubriques() {
    return (
        <section aria-labelledby="titre-rubriques" className="border-t border-ink/10">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
                <h2
                    id="titre-rubriques"
                    className="text-center text-[11px] uppercase tracking-brand text-sage"
                >
                    Ce que vous y retrouverez
                </h2>

                <ul className="mt-14 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
                    {RUBRIQUES.map((rubrique) => (
                        <li key={rubrique.label} className="bg-ivory p-8">
                            <p className="text-[10px] uppercase tracking-brand text-sage">
                                {rubrique.label}
                            </p>
                            <h3 className="mt-5 font-display text-xl leading-snug">
                                {rubrique.titre}
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-ink/70">
                                {rubrique.texte}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Acces() {
    return (
        <section id="acces" aria-labelledby="titre-acces" className="scroll-mt-8 bg-blush">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <div className="max-w-xl">
                    <p className="text-[11px] uppercase tracking-brand text-sage">
                        Votre accès
                    </p>
                    <h2
                        id="titre-acces"
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
                    {ETAPES.map((etape) => (
                        <li key={etape.numero} className="border-t border-ink/15 pt-6">
                            <p className="font-display text-sm text-sage">
                                {etape.numero}
                            </p>
                            <h3 className="mt-4 font-display text-lg leading-snug">
                                {etape.titre}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">
                                {etape.texte}
                            </p>
                        </li>
                    ))}
                </ol>

                <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <a href={LIEN_DEMANDE} className={boutonPrincipal}>
                        Demander un accès
                    </a>
                    <Link href={route('login')} className={boutonSecondaire}>
                        J’ai déjà un identifiant
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section aria-labelledby="titre-contact" className="border-t border-ink/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 sm:px-10 md:flex-row md:items-end md:justify-between">
                <div className="max-w-md">
                    <p className="text-[11px] uppercase tracking-brand text-sage">
                        Une question
                    </p>
                    <h2
                        id="titre-contact"
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
                        className={`${boutonSecondaire} text-sm normal-case tracking-normal`}
                    >
                        {CONTACT.email}
                    </a>
                    {CONTACT.whatsapp.length > 0 && (
                        <a
                            href={`https://wa.me/${CONTACT.whatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                            className={boutonSecondaire}
                        >
                            WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}

function PiedDePage() {
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
                        className={`${anneauFocus} transition-colors hover:text-ink`}
                    >
                        laderniertouche.com
                    </a>
                </div>
            </div>
        </footer>
    );
}
