import Icone from '@/Components/Icone';

/**
 * Les quatre indicateurs de synthèse du mois affichés au-dessus du calendrier.
 */
const classesCarte =
    'flex flex-col justify-between rounded-lg border border-hairline bg-white p-4';

function Metrique({ titre, valeur, children, note }) {
    return (
        <div className={classesCarte}>
            <span className="text-caps uppercase text-sage">{titre}</span>
            <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-kpi text-ink">{valeur}</span>
                {children}
            </div>
            {note}
        </div>
    );
}

const noteDiscrete = (texte) => (
    <span className="mt-1 text-[11px] text-sage">{texte}</span>
);

export default function MetriquesMois() {
    return (
        <section
            aria-label="Synthèse du mois"
            className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4"
        >
            <Metrique
                titre="Mariages célébrés"
                valeur="02"
                note={noteDiscrete('Fonscolombe & Gordes')}
            >
                <span className="flex items-center gap-0.5 text-body-sm text-success">
                    <Icone nom="event_available" className="text-[14px]" />
                    100% bookés
                </span>
            </Metrique>

            <Metrique
                titre="Jalons & Échéances M-1/M-3"
                valeur="05"
                note={noteDiscrete('Soldes & dégustations traiteur')}
            >
                <span className="flex items-center gap-0.5 text-body-sm text-warning">
                    <Icone nom="schedule" className="text-[14px]" />2 cette
                    semaine
                </span>
            </Metrique>

            <Metrique
                titre="Effectif invité cumulé"
                valeur="310"
                note={noteDiscrete('Logistique navettes validée')}
            >
                <span className="text-body-sm text-sage">Pax total</span>
            </Metrique>

            <Metrique
                titre="Disponibilité Jessica"
                valeur="84%"
                note={
                    <div
                        role="progressbar"
                        aria-label="Taux d’occupation"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={84}
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ivory"
                    >
                        <div
                            className="h-full rounded-full bg-ink"
                            style={{ width: '84%' }}
                        />
                    </div>
                }
            >
                <span className="text-body-sm text-sage">Taux d’occupation</span>
            </Metrique>
        </section>
    );
}
