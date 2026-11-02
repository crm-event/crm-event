/**
 * Styles partagés par les pages publiques (accueil, erreurs, connexion).
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

/** Micro-titre en capitales placé au-dessus d'un champ de formulaire. */
export const libelleChamp = 'block text-[10px] uppercase tracking-brand text-sage';

/**
 * Champ de saisie souligné, sans cadre. Le soulignement passe au noir au
 * focus ; le ring ajouté par @tailwindcss/forms est neutralisé pour rester
 * dans la charte.
 */
export const champSaisie =
    'block w-full border-0 border-b border-ink/20 bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink/30 transition-colors focus:border-ink focus:ring-0 aria-invalid:border-ink';

/** Lien texte discret, souligné finement. */
export const lienTexte = `${anneauFocus} underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink`;
