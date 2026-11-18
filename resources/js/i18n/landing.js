/**
 * Texts of the landing page (Pages/Landing.jsx). Unlike the other areas, they
 * are structured (lists of services, features…): the page reads them as a
 * whole with content('landing') (see ./index.js). The header and footer
 * texts are in ./site.js.
 *
 * `image` names a photo of the page (IMAGE_SOURCES in Landing.jsx), whose
 * alternative text is in `images`; `icon` is a Material Symbols name.
 */
export default {
    fr: {
        pageTitle: 'La Dernière Touche · Wedding design & coordination en Provence',

        hero: {
            eyebrow: 'Provence & Côte d’Azur',
            title: 'Votre mariage, pensé avec élégance du premier rendez-vous au dernier invité.',
            text: 'Wedding design, coordination et officiante de cérémonie : une direction claire, un cadre rassurant, et un espace privé où suivre chaque étape de votre projet.',
            primary: 'Demander mon accès',
            loggedPrimary: 'Accéder à mon espace',
            secondary: 'Découvrir les prestations',
            alreadyClient: 'Déjà accompagnés ?',
            login: 'Se connecter',
        },

        statsLabel: 'Chiffres clés',
        stats: [
            { value: 'Depuis 2024', label: 'Une maison fondée en Provence' },
            { value: '10 à 15', label: 'Mariages accompagnés chaque année' },
            { value: 'Un espace', label: 'Privé pour chaque couple accompagné' },
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

        clientArea: {
            eyebrow: 'Votre espace client',
            title: 'Tout votre mariage, réuni au même endroit.',
            text: 'Dès que Jessica ouvre votre accès, votre projet se suit ici : plus de mails éparpillés ni de fichiers à chercher.',
            features: [
                { icon: 'favorite', title: 'Votre mariage', text: 'Date, lieu, prestations, avancement et prochain rendez-vous, sur une seule page.' },
                { icon: 'palette', title: 'Le design', text: 'Votre brief, vos inspirations et le moodboard. Vous suivez chaque proposition et donnez votre avis.' },
                { icon: 'description', title: 'Les documents', text: 'Devis, contrat et conditions générales à consulter, télécharger et valider d’un « Lu et approuvé ».' },
                { icon: 'event', title: 'Les rendez-vous', text: 'Les points d’étape convenus avec Jessica, toujours sous les yeux.' },
                { icon: 'chat_bubble', title: 'Les messages', text: 'Vos échanges écrits et vocaux avec Jessica, et l’historique de ce qui a été décidé.' },
                { icon: 'groups', title: 'La communauté', text: 'Un espace pour partager idées et bonnes adresses avec les autres couples.' },
            ],
            cta: 'Demander mon accès',
            note: 'Chaque espace est ouvert par Jessica, pour un couple et un mariage.',
        },

        about: {
            eyebrow: 'À propos',
            title: 'Jessica Salles, fondatrice de La Dernière Touche.',
            first: 'Jessica a créé La Dernière Touche en Provence en 2024. Elle accompagne chaque année 10 à 15 couples, de France et de l’étranger, en Provence et sur la Côte d’Azur.',
            second: 'Elle suit elle-même chaque projet, du premier rendez-vous jusqu’au jour J, et s’entoure de prestataires de confiance pour les grands jours.',
            quote: '« Faire de votre mariage, votre endroit préféré au monde. »',
        },

        start: {
            eyebrow: 'Votre projet',
            title: 'Votre mariage commence ici.',
            text: 'Faites votre demande en ligne : elle arrive directement chez Jessica, qui étudie chaque projet personnellement et vous ouvre votre espace client.',
            button: 'Demander mon accès',
            questionsTitle: 'Une question avant de vous lancer ?',
            questionsText: 'Jessica vous répond par téléphone, par e-mail ou sur Instagram.',
        },

        images: {
            arch: 'Décoration élégante de mariage',
            bouquet: 'Détails raffinés d’un mariage',
            design: 'Décoration contemporaine de mariage',
            coordination: 'Coordination d’un mariage',
            officiant: 'Cérémonie de mariage',
            jessica: 'Jessica, fondatrice de La Dernière Touche',
        },
    },

    en: {
        pageTitle: 'La Dernière Touche · Wedding design & coordination in Provence',

        hero: {
            eyebrow: 'Provence & French Riviera',
            title: 'Your wedding, thoughtfully designed from the first meeting to the last guest.',
            text: 'Wedding design, day-of coordination and ceremony officiating: a clear direction, a reassuring framework and a private space to follow every step of your project.',
            primary: 'Request access',
            loggedPrimary: 'Access my space',
            secondary: 'Discover our services',
            alreadyClient: 'Already working with us?',
            login: 'Log in',
        },

        statsLabel: 'Key figures',
        stats: [
            { value: 'Since 2024', label: 'A wedding studio founded in Provence' },
            { value: '10 to 15', label: 'Weddings supported every year' },
            { value: 'One space', label: 'Private to each couple we support' },
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

        clientArea: {
            eyebrow: 'Your client area',
            title: 'Your whole wedding, in one place.',
            text: 'As soon as Jessica opens your access, your project is followed here: no more scattered emails or files to look for.',
            features: [
                { icon: 'favorite', title: 'Your wedding', text: 'Date, venue, services, progress and next appointment, all on one page.' },
                { icon: 'palette', title: 'The design', text: 'Your brief, your inspirations and the moodboard. Follow every proposal and share your feedback.' },
                { icon: 'description', title: 'The documents', text: 'Quote, contract and terms to view, download and approve with “Read and approved”.' },
                { icon: 'event', title: 'The appointments', text: 'The milestones agreed with Jessica, always in sight.' },
                { icon: 'chat_bubble', title: 'The messages', text: 'Your written and voice messages with Jessica, and the history of every decision.' },
                { icon: 'groups', title: 'The community', text: 'A space to share ideas and good addresses with the other couples.' },
            ],
            cta: 'Request access',
            note: 'Each space is opened by Jessica, for one couple and one wedding.',
        },

        about: {
            eyebrow: 'About',
            title: 'Jessica Salles, founder of La Dernière Touche.',
            first: 'Jessica founded La Dernière Touche in Provence in 2024. Each year, she supports 10 to 15 couples from France and abroad across Provence and the French Riviera.',
            second: 'She personally follows every project, from the first meeting to the wedding day, and works with trusted suppliers to make each celebration special.',
            quote: '“Making your wedding your favourite place in the world.”',
        },

        start: {
            eyebrow: 'Your project',
            title: 'Your wedding starts here.',
            text: 'Send your request online: it goes straight to Jessica, who reviews every project personally and opens your client area.',
            button: 'Request access',
            questionsTitle: 'A question before you start?',
            questionsText: 'Jessica answers by phone, by email or on Instagram.',
        },

        images: {
            arch: 'Elegant wedding decoration',
            bouquet: 'Refined wedding details',
            design: 'Contemporary wedding decoration',
            coordination: 'Wedding coordination',
            officiant: 'Wedding ceremony',
            jessica: 'Jessica, founder of La Dernière Touche',
        },
    },
};
