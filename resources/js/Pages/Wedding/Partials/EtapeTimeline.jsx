
import Icone from '@/Components/Icone';

function formaterDate(date) {
    if (!date) return 'Date à définir';

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) return date;

    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(valeur);
}

function obtenirStatut(date) {
    if (!date) return 'a-venir';

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    const dateEtape = new Date(date);

    if (Number.isNaN(dateEtape.getTime())) return 'a-venir';

    dateEtape.setHours(0, 0, 0, 0);

    if (dateEtape < aujourdHui) return 'valide';
    if (dateEtape.getTime() === aujourdHui.getTime()) return 'actif';

    return 'a-venir';
}

export default function EtapeTimeline({ etape, derniere = false }) {
    if (!etape) return null;

    const statut = obtenirStatut(etape.starts_at);

    const valide = statut === 'valide';
    const active = statut === 'actif';

    return (
        <div className="relative min-w-0 flex-1">
            <div className="relative z-10 flex h-6 items-center">
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        valide || active
                            ? 'bg-ink text-white'
                            : 'bg-blush text-sage'
                    }`}
                >
                    <Icone
                        nom={
                            valide
                                ? 'check'
                                : active
                                    ? 'hourglass_top'
                                    : 'celebration'
                        }
                        className="text-[12px]"
                    />
                </span>

                {!derniere && (
                    <span
                        className={`absolute left-5 right-0 top-1/2 h-px ${
                            valide ? 'bg-ink' : 'bg-subtle'
                        }`}
                    />
                )}
            </div>

            <div
                className={`mt-2 min-h-[142px] pr-3 ${
                    active ? 'rounded-xl bg-ivory p-3 pr-3' : 'pt-1'
                }`}
            >
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-sage">
                    {valide
                        ? 'Terminé'
                        : active
                            ? 'Aujourd’hui'
                            : 'À venir'}
                    {' · '}
                    {formaterDate(etape.starts_at)}
                </p>

                <h3 className="mt-1 font-display text-[11px] leading-[1.5] text-ink">
                    {etape.title || 'Étape sans titre'}
                </h3>

                <p className="mt-1 text-[9px] leading-[1.5] text-sage">
                    {etape.notes || ''}
                </p>
            </div>
        </div>
    );
}
