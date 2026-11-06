import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { focusRing, primaryButton, secondaryButton } from '@/brand';

const CONTACT = {
    email: 'ladernieretouche.event@gmail.com',
    phone: '07 69 88 92 71',
    phoneLink: 'tel:+33769889271',
    address: '9 boulevard René Chaillan, 13013 Marseille',
    siret: '984 937 078 00017',
    whatsapp: '',
    instagram: 'https://www.instagram.com/ladernieretouche.wedding/',
    website: 'https://www.ladernieretouche.com/',
};

const IMAGES = {
    arch: {
        src: '/images/landing/accueil1.jpg',
        alt: 'Décoration élégante de mariage',
    },
    bouquet: {
        src: '/images/landing/accueil2.jpg',
        alt: 'Détails raffinés d’un mariage',
    },
    design: {
        src: '/images/landing/wedding-design.jpg',
        alt: 'Décoration contemporaine de mariage',
    },
    coordination: {
        src: '/images/landing/coordination.jpg',
        alt: 'Coordination d’un mariage',
    },
    officiant: {
        src: '/images/landing/officiante-de-ceremonie.jpg',
        alt: 'Cérémonie de mariage',
    },
    jessica: {
        src: '/images/landing/jessica.jpg',
        alt: 'Jessica, fondatrice de La Dernière Touche',
    },
};

const CONTENT = {
    fr: {
        htmlLang: 'fr',
        switchLanguage: 'English',
        login: 'Se connecter',
        account: 'Mon espace',
        skip: 'Aller au contenu',
        navigation: 'Navigation principale',
        footerNavigation: 'Pied de page',
        tagline: 'Wedding design & coordination',

        nav: {
            services: 'Prestations',
            about: 'À propos',
            clientArea: 'Espace client',
            contact: 'Contact',
        },

        hero: {
            eyebrow: 'Provence & Côte d’Azur',
            title: 'Votre mariage, pensé avec élégance du premier rendez-vous au dernier invité.',
            text: 'Wedding design, coordination et officiante de cérémonie : une direction claire, un cadre rassurant, et une ambiance qui vous ressemble vraiment.',
            primary: 'Parler de votre projet',
            loggedPrimary: 'Accéder à mon espace',
            secondary: 'Découvrir nos prestations',
        },

        stats: [
            { value: 'Depuis 2024', label: 'Une maison fondée en Provence' },
            { value: '10 à 15', label: 'Mariages accompagnés chaque année' },
            { value: '1 couple', label: '1 espace client dédié' },
        ],

        services: {
            eyebrow: 'Prestations',
            title: 'Trois savoir-faire, au rythme de votre mariage.',
            text: 'Ils s’associent librement : décoration et coordination, décoration et officiante, ou officiante et coordination.',
            items: [
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
            ],
        },

        about: {
            eyebrow: 'À propos',
            title: 'Jessica Salles, fondatrice de La Dernière Touche.',
            first: 'Jessica a créé La Dernière Touche en Provence en 2024. Elle accompagne chaque année 10 à 15 couples, de France et de l’étranger, en Provence et sur la Côte d’Azur.',
            second: 'Elle suit elle-même chaque projet, du premier rendez-vous jusqu’au jour J, et s’entoure de prestataires de confiance pour les grands jours.',
            quote: 'Faire de votre mariage, votre endroit préféré au monde.',
        },

        client: {
            title: 'Un espace privé pour suivre votre mariage.',
            text: 'Chaque couple accompagné retrouve son projet au même endroit, du premier devis au jour J.',
            features: [
                ['Le projet en un coup d’œil', 'Date, lieu, temps forts de la journée et personnes impliquées, sur une seule page.'],
                ['Votre design', 'Moodboards, carnet design et projections : suivez chaque version et laissez vos commentaires.'],
                ['Vos documents', 'Devis, contrat et conditions générales, à consulter et télécharger à tout moment.'],
                ['Vos échanges', 'Vos messages avec Jessica et l’historique de ce qui a été décidé, au même endroit.'],
            ],
        },

        access: {
            title: 'Un accès ouvert pour vous, personnellement.',
            text: 'Pas d’inscription en ligne : chaque accès est créé à la main, pour un couple et pour un mariage. Personne d’autre n’y a accès.',
            request: 'Demander mon accès',
            login: 'J’ai déjà un identifiant',
            steps: [
                ['01', 'Vous nous écrivez', 'Un simple message suffit. Nous vérifions que votre dossier est bien ouvert.'],
                ['02', 'Nous ouvrons votre accès', 'Votre compte est créé par nos soins, une fois votre devis et votre contrat signés.'],
                ['03', 'Vous choisissez votre mot de passe', 'Vous recevez un identifiant et un code provisoire, à remplacer dès la première connexion.'],
            ],
        },

        contact: {
            title: 'Parlez-nous de votre mariage.',
            text: 'Parlez-nous de votre mariage : sa date, son lieu, le nombre d’invités et l’ambiance que vous imaginez. Nous vous proposerons ensuite un premier rendez-vous. Aucun compte n’est nécessaire pour nous écrire.',
            button: 'Présenter mon projet',
            instagram: 'Suivez-nous sur Instagram',
            label: 'Nous joindre',
            note: 'Les demandes arrivant par e-mail, Instagram ou le site sont toutes lues par Jessica.',
        },

        footer: 'Wedding design, coordination et officiante de cérémonie en Provence et sur la Côte d’Azur.',
        portfolio: 'Voir le portfolio',
    },

    en: {
        htmlLang: 'en',
        switchLanguage: 'Français',
        login: 'Log in',
        account: 'My client area',
        skip: 'Skip to content',
        navigation: 'Main navigation',
        footerNavigation: 'Footer navigation',
        tagline: 'Wedding design & coordination',

        nav: {
            services: 'Services',
            about: 'About',
            clientArea: 'Client area',
            contact: 'Contact',
        },

        hero: {
            eyebrow: 'Provence & French Riviera',
            title: 'Your wedding, thoughtfully designed from the first meeting to the last guest.',
            text: 'Wedding design, day-of coordination and ceremony officiating: a clear direction, a reassuring framework and an atmosphere that feels truly yours.',
            primary: 'Tell us about your project',
            loggedPrimary: 'Access my client area',
            secondary: 'Discover our services',
        },

        stats: [
            { value: 'Since 2024', label: 'A wedding studio founded in Provence' },
            { value: '10 to 15', label: 'Weddings supported every year' },
            { value: '1 couple', label: '1 dedicated client area' },
        ],

        services: {
            eyebrow: 'Services',
            title: 'Three areas of expertise, following the rhythm of your wedding.',
            text: 'Combine them freely: design and coordination, design and ceremony, or ceremony and coordination.',
            items: [
                {
                    phase: 'Design',
                    title: 'Wedding design',
                    text: 'From the first moodboard to the design book, we imagine your setting: reception, stationery, ceremony and flowers. We install it on the wedding day and dismantle it the following day.',
                    points: [
                        'Moodboard, quote and design book',
                        'Progress meetings at M-6, M-3 and M-1',
                        'Installation on the wedding day and dismantling the next day',
                    ],
                    image: IMAGES.design,
                },
                {
                    phase: 'Organise',
                    title: 'Coordination',
                    text: 'Together, we refine the day’s schedule, liaise with your suppliers and make sure every special moment runs as planned.',
                    points: [
                        'Day schedule created with you',
                        'Supplier communication and follow-up',
                        'Coordination of your planned activities',
                    ],
                    image: IMAGES.coordination,
                },
                {
                    phase: 'Celebrate',
                    title: 'Ceremony officiating',
                    text: 'A ceremony that tells your story: we prepare it with you, write it together and officiate it on your wedding day.',
                    points: [
                        '10 personal story questionnaires',
                        '3 preparation meetings',
                        'Ceremony writing and officiating',
                    ],
                    image: IMAGES.officiant,
                },
            ],
        },

        about: {
            eyebrow: 'About',
            title: 'Jessica Salles, founder of La Dernière Touche.',
            first: 'Jessica founded La Dernière Touche in Provence in 2024. Each year, she supports 10 to 15 couples from France and abroad across Provence and the French Riviera.',
            second: 'She personally follows every project, from the first meeting to the wedding day, and works with trusted suppliers to make each celebration special.',
            quote: 'Making your wedding your favourite place in the world.',
        },

        client: {
            title: 'A private space to follow your wedding.',
            text: 'Every couple we support can find their project in one place, from the first quotation to the wedding day.',
            features: [
                ['Your project at a glance', 'Your date, venue, key moments and the people involved, all on one page.'],
                ['Your design', 'Moodboards, design books and proposals: follow every version and leave your comments.'],
                ['Your documents', 'Quotes, contracts and terms, available to view and download at any time.'],
                ['Your conversations', 'Your messages with Jessica and the history of every decision, all in one place.'],
            ],
        },

        access: {
            title: 'Private access created especially for you.',
            text: 'There is no online sign-up: every account is created personally for one couple and one wedding. No one else can access it.',
            request: 'Request access',
            login: 'I already have an account',
            steps: [
                ['01', 'You contact us', 'A simple message is all it takes. We check that your file has been opened.'],
                ['02', 'We create your access', 'Your account is created once your quote and contract have been signed.'],
                ['03', 'You choose your password', 'You receive a username and temporary code, which you replace after your first login.'],
            ],
        },

        contact: {
            title: 'Tell us about your wedding.',
            text: 'Tell us about your wedding: the date, venue, number of guests and atmosphere you have in mind. We will then suggest an initial meeting. No account is needed to contact us.',
            button: 'Share your project',
            instagram: 'Follow us on Instagram',
            label: 'Get in touch',
            note: 'Every request received by email, Instagram or through the website is personally read by Jessica.',
        },

        footer: 'Wedding design, coordination and ceremony officiating across Provence and the French Riviera.',
        portfolio: 'View the portfolio',
    },
};

function createMailLinks(language) {
    const english = language === 'en';

    const accessSubject = english
        ? 'Request for access to our client area'
        : 'Demande d’accès à notre espace client';

    const accessBody = english
        ? ['Hello Jessica,', '', 'We would like to access our client area.', '', 'Our names:', 'Wedding date:', 'Venue:', 'Contact email:', 'Phone number:', '', 'Thank you,'].join('\n')
        : ['Bonjour Jessica,', '', 'Nous souhaitons accéder à notre espace client.', '', 'Nos prénoms :', 'Date du mariage :', 'Lieu :', 'E-mail de contact :', 'Téléphone :', '', 'Merci beaucoup,'].join('\n');

    const projectSubject = english ? 'Our wedding project' : 'Notre projet de mariage';

    const projectBody = english
        ? ['Hello Jessica,', '', 'We would like to tell you about our wedding project.', '', 'Our names:', 'Wedding date:', 'Venue:', 'Approximate number of guests:', 'Services we are interested in (design, coordination, ceremony officiating):', 'How did you hear about us:', 'Phone number:', '', 'We can also send you some inspiration images.', '', 'Thank you,'].join('\n')
        : ['Bonjour Jessica,', '', 'Nous souhaitons vous présenter notre projet de mariage.', '', 'Nos prénoms :', 'Date du mariage :', 'Lieu :', 'Nombre d’invités (environ) :', 'Prestations qui nous intéressent (décoration, coordination, officiante) :', 'Comment nous vous avons connue :', 'Téléphone :', '', 'Nous pouvons vous envoyer quelques inspirations.', '', 'Merci beaucoup,'].join('\n');

    return {
        access: `mailto:${CONTACT.email}?subject=${encodeURIComponent(accessSubject)}&body=${encodeURIComponent(accessBody)}`,
        project: `mailto:${CONTACT.email}?subject=${encodeURIComponent(projectSubject)}&body=${encodeURIComponent(projectBody)}`,
    };
}

export default function Landing({ auth }) {
    const [language, setLanguage] = useState(() => {
        if (typeof window === 'undefined') return 'fr';

        return window.localStorage.getItem('ldt-language') ?? 'fr';
    });

    const homeUrl = auth?.homeUrl ?? null;
    const t = CONTENT[language];
    const mailLinks = createMailLinks(language);

    function changeLanguage(nextLanguage) {
        setLanguage(nextLanguage);
        window.localStorage.setItem('ldt-language', nextLanguage);
        document.documentElement.lang = CONTENT[nextLanguage].htmlLang;
    }

    return (
        <>
            <Head title="La Dernière Touche · Wedding design & coordination en Provence" />

            <div className="flex min-h-screen flex-col bg-ivory font-sans text-ink">
                <Header homeUrl={homeUrl} language={language} onLanguageChange={changeLanguage} t={t} />

                <main id="content" className="flex-1">
                    <Hero homeUrl={homeUrl} t={t} />
                    <Stats t={t} />
                    <Services t={t} />
                    <About t={t} />
                    <ClientArea t={t} />
                    <Access t={t} mailLink={mailLinks.access} />
                    <Contact t={t} mailLink={mailLinks.project} />
                </main>

                <Footer t={t} />
            </div>
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

function Header({ homeUrl, language, onLanguageChange, t }) {
    return (
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/95 backdrop-blur">
            <a
                href="#content"
                className={`${focusRing} sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-5 focus:z-10 focus:bg-ink focus:px-4 focus:py-2 focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-ivory`}
            >
                {t.skip}
            </a>

            <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-5 sm:px-10">
                <Link href={route('home')} className={`${focusRing} block`}>
                    <span className="block whitespace-nowrap font-display text-xs tracking-[0.14em] sm:text-lg sm:tracking-[0.18em]">
                        LA DERNIÈRE TOUCHE
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-brand text-sage">
                        {t.tagline}
                    </span>
                </Link>

                <nav aria-label={t.navigation} className="hidden lg:block">
                    <ul className="flex items-center gap-9">
                        <li><a href="#prestations" className={`${focusRing} text-[11px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink`}>{t.nav.services}</a></li>
                        <li><a href="#a-propos" className={`${focusRing} text-[11px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink`}>{t.nav.about}</a></li>
                        <li><a href="#espace-client" className={`${focusRing} text-[11px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink`}>{t.nav.clientArea}</a></li>
                        <li><a href="#contact" className={`${focusRing} text-[11px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink`}>{t.nav.contact}</a></li>
                    </ul>
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onLanguageChange(language === 'fr' ? 'en' : 'fr')}
                        className={`${focusRing} border border-ink/20 px-4 py-3.5 text-[10px] uppercase tracking-[0.18em] transition hover:border-ink hover:bg-ink hover:text-ivory`}
                        aria-label={`Switch language to ${t.switchLanguage}`}
                    >
                        {language === 'fr' ? 'EN' : 'FR'}
                    </button>

                    <Link
                        href={homeUrl ?? route('login')}
                        className={`${focusRing} shrink-0 border border-ink/20 px-6 py-3.5 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-ink hover:bg-ink hover:text-ivory`}
                    >
                        {homeUrl ? t.account : t.login}
                    </Link>
                </div>
            </div>
        </header>
    );
}

function Hero({ homeUrl, t }) {
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
                    <Photo image={IMAGES.arch} ratio="aspect-[3/4]" eager rounded="rounded-3xl" />
                    <Photo image={IMAGES.bouquet} ratio="aspect-[3/4]" eager className="mt-10" rounded="rounded-3xl" />
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

function Services({ t }) {
    return (
        <section id="prestations" aria-labelledby="services-title" className="scroll-mt-24">
            <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
                <SectionIntro eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.text} />

                <div className="mt-14 space-y-10">
                    {t.services.items.map((service, index) => (
                        <article key={service.title} className="grid items-center gap-8 rounded-3xl border border-ink/10 bg-blush/30 p-6 sm:p-8 lg:grid-cols-2 lg:gap-14">
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

function About({ t }) {
    return (
        <section
            id="a-propos"
            aria-labelledby="about-title"
            className="scroll-mt-24 border-t border-ink/10"
        >
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[2fr_3fr] lg:gap-20">
                <Photo
                    image={IMAGES.jessica}
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

function Access({ t, mailLink }) {
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

                <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <a href={mailLink} className={primaryButton}>{t.access.request}</a>
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

function Footer({ t }) {
    const navItems = [
        { href: '#prestations', label: t.nav.services },
        { href: '#a-propos', label: t.nav.about },
        { href: '#espace-client', label: t.nav.clientArea },
        { href: '#contact', label: t.nav.contact },
    ];

    return (
        <footer className="border-t border-ink/10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <img src="/logo-ldt.png" alt="" className="h-14 w-auto" width={285} height={560} />

                    <div className="max-w-xs">
                        <p className="font-display text-sm tracking-[0.18em]">LA DERNIÈRE TOUCHE</p>
                        <p className="mt-3 text-sm leading-relaxed text-ink/70">{t.footer}</p>
                    </div>
                </div>

                <nav aria-label={t.footerNavigation}>
                    <ul className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em] text-sage">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className={`${focusRing} transition-colors hover:text-ink`}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-col gap-2 text-sm text-ink/70 md:items-end">
                    <a href={`mailto:${CONTACT.email}`} className={`${focusRing} transition-colors hover:text-ink}`}>{CONTACT.email}</a>
                    <a href={CONTACT.phoneLink} className={`${focusRing} transition-colors hover:text-ink}`}>{CONTACT.phone}</a>

                    <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className={`${focusRing} transition-colors hover:text-ink}`}>
                        Instagram
                    </a>

                    <a href={CONTACT.website} target="_blank" rel="noreferrer" className={`${focusRing} transition-colors hover:text-ink}`}>
                        {t.portfolio}
                    </a>
                </div>
            </div>

            <div className="border-t border-ink/10 bg-blush">
                <p className="mx-auto max-w-6xl px-6 py-5 text-[11px] text-ink/60 sm:px-10">
                    © {new Date().getFullYear()} La Dernière Touche · SIRET {CONTACT.siret}
                </p>
            </div>
        </footer>
    );
}
