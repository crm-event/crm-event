import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

/**
 * Fil d'activité du studio, dans la colonne de droite.
 *
 * Les événements sont ceux de la maquette, en attendant les vraies données.
 */
const ACTIVITES = [
    {
        icone: 'camera',
        titre: 'Nouveau lead Instagram reçu',
        quand: 'Il y a 24 min',
        detail: 'Camille V. • Mariage Juin 2026 à Saint-Tropez',
        pied: { etiquette: 'Formulaire Bio', action: 'Créer la fiche' },
    },
    {
        icone: 'draw',
        sombre: true,
        titre: 'Devis signé par Sophie & Julien',
        quand: 'Il y a 2h',
        detail: 'Formule Complète • Bastide des Amandiers (6 200 €)',
        pied: { succes: 'Acompte de 30% en attente' },
    },
    {
        icone: 'palette',
        accent: true,
        titre: 'Planche d’ambiance validée',
        quand: 'Hier à 18:40',
        detail: 'Thème "Ombres d’Été & Céramique Blanche" • Chloé & Rémi',
        pied: { texte: 'Transmis à l’artisan fleuriste' },
    },
    {
        icone: 'euro',
        titre: 'Virement encaissé (1 800 €)',
        quand: '14 Avril',
        detail: 'Solde scénographie • Mariage Élisa & Paul',
    },
];

function Pied({ pied }) {
    if (pied.etiquette) {
        return (
            <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-ivory px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-sage">
                    {pied.etiquette}
                </span>
                <button
                    type="button"
                    className={`${anneauFocus} text-[11px] font-medium text-ink underline hover:text-sage`}
                >
                    {pied.action}
                </button>
            </div>
        );
    }

    if (pied.succes) {
        return (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <Icone nom="done_all" className="text-[13px]" />
                {pied.succes}
            </span>
        );
    }

    return (
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-sage">
            {pied.texte}
        </span>
    );
}

function Activite({ activite }) {
    return (
        <div className="relative flex items-start gap-3">
            <div
                className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    activite.sombre
                        ? 'bg-ink text-white'
                        : 'border border-hairline bg-ivory'
                }`}
            >
                <Icone
                    nom={activite.icone}
                    className={`text-[14px] ${
                        activite.sombre
                            ? ''
                            : activite.accent
                              ? 'text-sage'
                              : 'text-ink'
                    }`}
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-ink">{activite.titre}</span>
                    <span className="shrink-0 text-[10px] text-sage">
                        {activite.quand}
                    </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-body-sm text-sage">
                    {activite.detail}
                </p>
                {activite.pied && <Pied pied={activite.pied} />}
            </div>
        </div>
    );
}

export default function ActiviteRecente() {
    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                    <span className="text-caps uppercase text-sage">
                        Temps réel
                    </span>
                    <h2 className="font-display text-title-sm text-ink">
                        Activité récente du studio
                    </h2>
                </div>
                <Icone nom="history" className="text-[18px] text-sage" />
            </div>

            <div className="relative mt-4">
                <div className="absolute bottom-2 left-3.5 top-2 w-px bg-hairline" />
                <div className="space-y-4 text-body-sm">
                    {ACTIVITES.map((activite) => (
                        <Activite key={activite.titre} activite={activite} />
                    ))}
                </div>
            </div>
        </section>
    );
}
