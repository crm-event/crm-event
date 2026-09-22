/**
 * Styles partagés entre les pages publiques du portail.
 *
 * Ce ne sont que des chaînes de classes Tailwind : les valeurs (couleurs,
 * polices) viennent des tokens déclarés dans `src/index.css`. Toute nouvelle
 * page publique doit réutiliser ces trois constantes plutôt que de redéfinir
 * ses propres boutons.
 */

export const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

export const primaryButton = `${focusRing} inline-flex items-center justify-center bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-ivory transition-opacity hover:opacity-80`;

export const secondaryButton = `${focusRing} inline-flex items-center justify-center border border-ink/20 px-8 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-ink`;
