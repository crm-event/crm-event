/**
 * Texts of the error page (Pages/Error.jsx), by HTTP status.
 */
export default {
    fr: {
        caption: 'Erreur {status}',
        backHome: 'Retour à l’accueil',
        login: 'Se connecter',
        default: {
            title: 'Une erreur est survenue.',
            text: 'La page n’a pas pu s’afficher. Réessayez dans un instant.',
        },
        404: {
            title: 'Cette page n’existe pas.',
            text: 'Le lien que vous avez suivi n’est plus valide, ou il a été recopié incomplètement.',
        },
        403: {
            title: 'Cette page ne vous est pas accessible.',
            text: 'Votre compte n’a pas accès à cette partie du site. Si cela vous semble anormal, dites-le à Jessica.',
        },
        405: {
            title: 'Cette page n’existe pas.',
            text: 'Le lien que vous avez suivi ne mène à aucune page.',
        },
        419: {
            title: 'Votre session a expiré.',
            text: 'Pour protéger votre compte, la page s’est fermée après un moment d’inactivité. Rechargez-la, puis recommencez.',
        },
        500: {
            title: 'Quelque chose s’est mal passé.',
            text: 'La page n’a pas pu s’afficher. Réessayez dans un instant ; si cela se reproduit, prévenez Jessica.',
        },
        503: {
            title: 'Le site est en maintenance.',
            text: 'Il sera de retour dans quelques minutes. Merci de votre patience.',
        },
    },

    en: {
        caption: 'Error {status}',
        backHome: 'Back to home',
        login: 'Log in',
        default: {
            title: 'Something went wrong.',
            text: 'The page could not be displayed. Please try again in a moment.',
        },
        404: {
            title: 'This page does not exist.',
            text: 'The link you followed is no longer valid, or it was copied incompletely.',
        },
        403: {
            title: 'You cannot access this page.',
            text: 'Your account does not have access to this part of the site. If this seems wrong, let Jessica know.',
        },
        405: {
            title: 'This page does not exist.',
            text: 'The link you followed does not lead to any page.',
        },
        419: {
            title: 'Your session has expired.',
            text: 'To protect your account, the page closed after a period of inactivity. Reload it, then try again.',
        },
        500: {
            title: 'Something went wrong.',
            text: 'The page could not be displayed. Please try again in a moment; if it happens again, let Jessica know.',
        },
        503: {
            title: 'The site is under maintenance.',
            text: 'It will be back in a few minutes. Thank you for your patience.',
        },
    },
};
