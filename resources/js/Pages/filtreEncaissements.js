export const dateExercice = (ligne) => (ligne.paid_at ?? ligne.due_date ?? ligne.invoiced_at ?? ligne.created_at ?? '').slice(0, 10);

export function filtrerEncaissements(payments, annee, dossier) {
    return payments.filter((ligne) => (annee === 'toutes' || (dateExercice(ligne).slice(0, 4) || 'sans-date') === annee)
        && (!dossier || String(ligne.wedding_id) === dossier));
}
