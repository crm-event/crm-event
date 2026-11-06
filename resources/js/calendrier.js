/**
 * Renvoie toutes les cases de la grille d'un mois (semaine commençant le lundi),
 * semaines complètes comprises : les derniers jours du mois précédent et les
 * premiers du suivant sont marqués `horsMois`.
 */
export function construireCases(annee, mois) {
    const nombreDeJours = new Date(annee, mois, 0).getDate();
    const decalage = (new Date(annee, mois - 1, 1).getDay() + 6) % 7;
    const total = Math.ceil((decalage + nombreDeJours) / 7) * 7;

    return Array.from({ length: total }, (_, index) => {
        const date = new Date(annee, mois - 1, index - decalage + 1);

        return {
            jour: date.getDate(),
            mois: date.getMonth() + 1,
            annee: date.getFullYear(),
            horsMois: date.getMonth() + 1 !== mois,
        };
    });
}

/**
 * Nom du mois suivi de l'année, à la française : « Avril 2025 ».
 */
export function nomDuMois(annee, mois) {
    const nom = new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', {
        month: 'long',
    });

    return `${nom.charAt(0).toUpperCase()}${nom.slice(1)} ${annee}`;
}
