import { EVENEMENTS } from '@/Pages/Calendrier/donnees';

export const CLE_STOCKAGE = 'crm-event.calendrier.jalons.v1';
export const CLE_MODIFICATIONS = 'crm-event.calendrier.modifications.v1';
export const CLE_SUPPRESSIONS = 'crm-event.calendrier.suppressions.v1';

export function lireJalonsEnregistres() {
    try {
        const jalons = JSON.parse(window.localStorage.getItem(CLE_STOCKAGE) ?? '[]');
        return Array.isArray(jalons)
            ? jalons.filter((jalon) => jalon?.id && jalon?.date && jalon?.titre)
            : [];
    } catch {
        return [];
    }
}

export function lireModifications() {
    try {
        const modifications = JSON.parse(window.localStorage.getItem(CLE_MODIFICATIONS) ?? '{}');
        return modifications && typeof modifications === 'object' && !Array.isArray(modifications)
            ? modifications
            : {};
    } catch {
        return {};
    }
}

export function lireSuppressions() {
    try {
        const suppressions = JSON.parse(window.localStorage.getItem(CLE_SUPPRESSIONS) ?? '[]');
        return Array.isArray(suppressions)
            ? suppressions.filter((id) => typeof id === 'string')
            : [];
    } catch {
        return [];
    }
}

export function composerEvenements(jalonsEnregistres, modifications, suppressions) {
    return [
        ...EVENEMENTS.map((evenement) => modifications[evenement.id]
            ? { ...evenement, ...modifications[evenement.id], modifie: true }
            : evenement),
        ...jalonsEnregistres,
    ].filter((evenement) => !suppressions.includes(evenement.id));
}

export function lireEvenementsCalendrier() {
    return composerEvenements(
        lireJalonsEnregistres(),
        lireModifications(),
        lireSuppressions(),
    );
}
