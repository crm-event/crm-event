
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

export default function EtapeTimeline({ etape, derniere = false }) {
    if (!etape) return null;

    const statut = etape.statut || etape.status || 'a-venir';

    const valide = statut === 'valide' || statut === 'completed';
    const active = statut === 'actif' || statut === 'active';

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
                        nom={valide ? 'check' : active ? 'hourglass_top' : 'celebration'}
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
                        ? 'Validé'
                        : active
                            ? 'Échéance active'
                            : 'À venir'}
                    {' · '}
                    {formaterDate(etape.date || etape.due_date)}
                </p>

                <h3 className="mt-1 font-display text-[11px] leading-[1.5] text-ink">
                    {etape.titre || etape.title || 'Étape sans titre'}
                </h3>

                <p className="mt-1 text-[9px] leading-[1.5] text-sage">
                    {etape.description || ''}
                </p>
            </div>
        </div>
    );
}
