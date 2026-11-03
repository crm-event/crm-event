import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

/**
 * Fil de resume qui se trouvera sur la page marriage
 *
 * Les données sont par défaults en attendant les données du client
 */


// Données par défaut
const ETAPE_PAR_DEFAUT = [
    {
        id: 1,
        statut: 'valide',
        date: '28 déc. 2024',
        titre: 'M-6 — Validation prestataires clés',
        description: 'Sélection traiteur gastronomique, photographe éditorial & régisseur musical.',
    },
    {
        id: 2,
        statut: 'valide',
        date: '28 mars 2025',
        titre: 'M-3 — Fleurs & dégustation traiteur',
        description: 'Essai menu château, choix du linge de table & prototype scénographique florale.',
    },
    {
        id: 3,
        statut: 'actif',
        date: '28 mai 2025',
        titre: 'M-1 — Solde & casting timing jour J',
        description: 'Échéance : 28 mai 2025. Réunion technique minute par minute et collecte solde.',
    },
    {
        id: 4,
        statut: 'a-venir',
        date: '28 juin 2025',
        titre: 'Jour J — Orchestration & célébration',
        description: 'Supervision dès 08h00 : installations, accueil invités, cérémonial et soirée.',
    },
];

// Affichage d'une étape
function Etape({ etape, derniere }) {
    const valide = etape.statut === 'valide';
    const active = etape.statut === 'actif';

    return (
        <div className="relative min-w-0 flex-1">
            <div className="relative z-10 flex h-6 items-center">
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        valide || active ? 'bg-ink text-white' : 'bg-blush text-sage'
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
                    {valide ? 'Validé' : active ? 'Échéance active' : 'À venir'} · {etape.date}
                </p>
                <h3 className="mt-1 font-display text-[11px] leading-[1.5] text-ink">
                    {etape.titre}
                </h3>
                <p className="mt-1 text-[9px] leading-[1.5] text-sage">
                    {etape.description}
                </p>
            </div>
        </div>
    );
}
// Composant principal
export default function ResumeMariage() {
    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">

            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                    <span className="text-caps uppercase tracking-brand text-sage">
                        Planning
                    </span>

                    <h2 className="font-display text-title-sm text-ink">
                        Résumé du mariage
                    </h2>
                </div>
                <Icone
                    nom="event_note"
                    className="text-[18px] text-sage"
                />
            </div>

            {/* Liste des étapes */}
            <div className="relative mt-4">

                {/* Ligne verticale */}
                <div className="absolute bottom-2 left-3.5 top-2 w-px bg-hairline" />

                <div className="space-y-4 text-body-sm">
                    {ETAPE_PAR_DEFAUT.map((etape) => (
                        <Etape
                            key={etape.id}
                            etape={etape}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
