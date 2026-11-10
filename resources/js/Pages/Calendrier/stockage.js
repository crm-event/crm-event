export const CLE_STOCKAGE = 'crm-event.calendrier.jalons.v1';

export function lireJalonsEnregistres() {
    try {
        if (typeof window === 'undefined') {
            return [];
        }

        const jalons = JSON.parse(window.localStorage.getItem(CLE_STOCKAGE) ?? '[]');
        return Array.isArray(jalons)
            ? jalons.filter((jalon) => jalon?.id && jalon?.date && jalon?.titre)
            : [];
    } catch {
        return [];
    }
}
