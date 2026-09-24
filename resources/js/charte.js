/**
 * Styles partagés par les pages publiques (accueil, erreurs).
 *
 * Ce ne sont que des chaînes de classes Tailwind : les valeurs (couleurs,
 * polices, interlettrage) viennent des tokens déclarés dans
 * resources/css/app.css. Toute nouvelle page destinée aux couples doit
 * réutiliser ces constantes plutôt que redéfinir ses propres boutons.
 */

export const anneauFocus =
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

export const boutonPrincipal = `${anneauFocus} inline-flex items-center justify-center bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-ivory transition-opacity hover:opacity-80`;

export const boutonSecondaire = `${anneauFocus} inline-flex items-center justify-center border border-ink/20 px-8 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-ink`;
