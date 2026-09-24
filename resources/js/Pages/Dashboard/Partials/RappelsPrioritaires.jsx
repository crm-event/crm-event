import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

/**
 * Les tâches à traiter en priorité, dans la colonne de droite.
 *
 * Les rappels sont ceux de la maquette, en attendant les vraies données.
 */
const STYLES_BADGE = {
    attention: 'bg-warning/15 font-semibold text-warning',
    sombre: 'bg-ink text-white',
    neutre: 'border border-subtle bg-white text-sage',
};

const RAPPELS = [
    {
        badge: { libelle: 'Aujourd’hui • 16:30', style: 'attention' },
        titre: 'Rendez-vous découverte couple',
        detail: 'Manon & Thibault (Budget estimé 75k€ • Luberon)',
        note: { icone: 'videocam', libelle: 'Visioconférence Google Meet' },
        action: { libelle: 'Préparer', lien: true },
    },
    {
        badge: { libelle: 'Échéance J-2', style: 'sombre' },
        titre: 'Échéance acompte 30%',
        detail: 'Mariage Juliette & Marc • Facture F-2025-018 (2 400 €)',
        note: { icone: 'mail', libelle: 'Relance aimable à envoyer', attention: true },
        action: { libelle: 'Relancer' },
    },
    {
        badge: { libelle: 'En attente signature', style: 'neutre' },
        titre: 'Avenant scénographie florale',
        detail: 'Validation arche cérémoniale et chemins d’oliviers (1 150 €)',
        note: { icone: 'person', libelle: 'En attente des mariés' },
        action: { libelle: 'Consulter', lien: true },
    },
];

const classesAction = `${anneauFocus} text-[10px] uppercase tracking-[0.12em] text-ink underline`;

function Rappel({ rappel }) {
    const { badge, titre, detail, note, action } = rappel;

    return (
        <div className="flex flex-col gap-1.5 rounded-lg border border-hairline bg-ivory/70 p-3">
            <div className="flex items-center justify-between">
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] ${STYLES_BADGE[badge.style]}`}
                >
                    {badge.libelle}
                </span>
                <button
                    type="button"
                    aria-label={`Valider : ${titre}`}
                    className={`${anneauFocus} text-sage transition-colors hover:text-ink`}
                >
                    <Icone nom="check_circle" className="text-[17px]" />
                </button>
            </div>
            <h3 className="text-body font-medium text-ink">{titre}</h3>
            <p className="text-body-sm text-sage">{detail}</p>
            <div className="mt-1 flex items-center justify-between text-body-sm">
                <span
                    className={`inline-flex items-center gap-1 text-[11px] ${
                        note.attention ? 'text-warning' : 'text-sage'
                    }`}
                >
                    <Icone nom={note.icone} className="text-[13px]" />
                    {note.libelle}
                </span>
                {action.lien ? (
                    <a href="#" className={classesAction}>
                        {action.libelle}
                    </a>
                ) : (
                    <button type="button" className={classesAction}>
                        {action.libelle}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function RappelsPrioritaires() {
    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                    <span className="text-caps uppercase text-sage">
                        Conduite de projet
                    </span>
                    <h2 className="font-display text-title-sm text-ink">
                        Rappels prioritaires
                    </h2>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ivory text-body-sm font-medium text-ink">
                    {RAPPELS.length}
                </span>
            </div>

            <div className="mt-4 space-y-4">
                {RAPPELS.map((rappel) => (
                    <Rappel key={rappel.titre} rappel={rappel} />
                ))}
            </div>

            <button
                type="button"
                className={`${anneauFocus} mt-4 w-full rounded-lg border border-subtle py-2 text-center text-label text-sage transition-colors hover:bg-ivory hover:text-ink`}
            >
                Voir l’ensemble des 8 tâches
            </button>
        </section>
    );
}
