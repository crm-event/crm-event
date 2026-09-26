/**
 * Renvoie toutes les cases de la grille d'un mois (semaine commençant le lundi),
 * semaines complètes comprises : les derniers jours du mois précédent et les
 * premiers du suivant sont marqués `horsMois`.
 */
export function construireCases(annee, mois) {
    const nombreDeJours = new Date(annee, mois, 0).getDate();
    const decalage = (new Date(annee, mois - 1, 1).getDay() + 6) % 7;
    const jourPrecedent = new Date(annee, mois - 1, 0).getDate();
    const total = Math.ceil((decalage + nombreDeJours) / 7) * 7;

    return Array.from({ length: total }, (_, index) => {
        const jour = index - decalage + 1;

        if (jour < 1) {
            return { jour: jourPrecedent + jour, horsMois: true };
        }

        if (jour > nombreDeJours) {
            return { jour: jour - nombreDeJours, horsMois: true };
        }

        return { jour, horsMois: false };
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
