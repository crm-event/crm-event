/**
 * Formate un montant en euros à la française : « 32 400 € ».
 */
export function formaterEuros(montant) {
    return `${Math.round(montant).toLocaleString('fr-FR')} €`;
}
