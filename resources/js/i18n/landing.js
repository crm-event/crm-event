/**
 * Texts of the landing page (Pages/Landing.jsx). Unlike the other areas, they
 * are structured (lists of services, steps…): the page reads them as a whole
 * with content('landing') (see ./index.js).
 *
 * `image` names a photo of the page (IMAGE_SOURCES in Landing.jsx), whose
 * alternative text is in `images`.
 */
export default {
    fr: {
        pageTitle: 'La Dernière Touche · Wedding design & coordination en Provence',
        login: 'Se connecter',
        account: 'Mon espace',
        skip: 'Aller au contenu',
        navigation: 'Navigation principale',
        footerNavigation: 'Pied de page',
        legalNotice: 'Mentions légales',
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
                    image: 'design',
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
                    image: 'coordination',
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
                    image: 'officiant',
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
                ['01', 'Vous faites votre demande', 'Vos prénoms et votre e-mail suffisent. Nous vérifions que votre dossier est bien ouvert.'],
                ['02', 'Nous ouvrons votre accès', 'Votre compte est créé par nos soins, une fois votre devis et votre contrat signés.'],
                ['03', 'Vous choisissez votre mot de passe', 'Vous recevez par e-mail un identifiant et un code provisoire, à remplacer dès la première connexion.'],
            ],
            form: {
                title: 'Demander votre accès',
                firstName: 'Votre prénom',
                partnerFirstName: 'Le prénom de votre conjoint (facultatif)',
                email: 'Votre adresse e-mail',
                weddingDate: 'Date du mariage (facultative)',
                sending: 'Envoi…',
                sent: 'Merci, votre demande est bien transmise à Jessica. Si votre accès est ouvert, vous recevrez votre identifiant et votre code provisoire par e-mail.',
            },
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

        images: {
            arch: 'Décoration élégante de mariage',
            bouquet: 'Détails raffinés d’un mariage',
            design: 'Décoration contemporaine de mariage',
            coordination: 'Coordination d’un mariage',
            officiant: 'Cérémonie de mariage',
            jessica: 'Jessica, fondatrice de La Dernière Touche',
        },

        projectMail: {
            subject: 'Notre projet de mariage',
            body: [
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
            ],
        },
    },

    en: {
        pageTitle: 'La Dernière Touche · Wedding design & coordination in Provence',
        login: 'Log in',
        account: 'My client area',
        skip: 'Skip to content',
        navigation: 'Main navigation',
        footerNavigation: 'Footer navigation',
        legalNotice: 'Legal notice',
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
                    image: 'design',
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
                    image: 'coordination',
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
                    image: 'officiant',
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
                ['01', 'You send your request', 'Your first names and email are all it takes. We check that your file has been opened.'],
                ['02', 'We create your access', 'Your account is created once your quote and contract have been signed.'],
                ['03', 'You choose your password', 'You receive a username and temporary code by email, which you replace after your first login.'],
            ],
            form: {
                title: 'Request your access',
                firstName: 'Your first name',
                partnerFirstName: 'Your partner’s first name (optional)',
                email: 'Your email address',
                weddingDate: 'Wedding date (optional)',
                sending: 'Sending…',
                sent: 'Thank you, your request has been passed on to Jessica. If your access is opened, you will receive your username and temporary code by email.',
            },
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

        images: {
            arch: 'Elegant wedding decoration',
            bouquet: 'Refined wedding details',
            design: 'Contemporary wedding decoration',
            coordination: 'Wedding coordination',
            officiant: 'Wedding ceremony',
            jessica: 'Jessica, founder of La Dernière Touche',
        },

        projectMail: {
            subject: 'Our wedding project',
            body: [
                'Hello Jessica,',
                '',
                'We would like to tell you about our wedding project.',
                '',
                'Our names:',
                'Wedding date:',
                'Venue:',
                'Approximate number of guests:',
                'Services we are interested in (design, coordination, ceremony officiating):',
                'How did you hear about us:',
                'Phone number:',
                '',
                'We can also send you some inspiration images.',
                '',
                'Thank you,',
            ],
        },
    },
};
