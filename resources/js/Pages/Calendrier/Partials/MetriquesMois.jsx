import Icone from '@/Components/Icone';

/**
 * Les quatre indicateurs de synthèse du mois affichés au-dessus du calendrier.
 */
const classesCarte =
    'flex flex-col justify-between overflow-hidden rounded-lg border border-hairline bg-white p-4 md:h-[150px]';

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
    <span className="mt-1 block truncate text-[11px] text-sage" title={texte}>{texte}</span>
);

export default function MetriquesMois({ evenements, annee, mois, jourRepere }) {
    const mariages = evenements.filter(({ type }) => type === 'jour-j');
    const jalons = evenements.filter(({ type }) =>
        ['jalon', 'urgent', 'repetition'].includes(type),
    );
    const invites = mariages.reduce(
        (total, mariage) => total + (mariage.invites ?? 0),
        0,
    );
    const joursPlanifies = evenements
        .map(({ date }) => date)
        .filter((date, index, dates) => dates.indexOf(date) === index);
    const joursDuMois = new Date(annee, mois, 0).getDate();
    const partJoursPlanifies = joursDuMois
        ? Math.min(100, Math.round((joursPlanifies.length / joursDuMois) * 100))
        : 0;
    const debutSemaine = new Date(annee, mois - 1, jourRepere);
    debutSemaine.setDate(debutSemaine.getDate() - ((debutSemaine.getDay() + 6) % 7));
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(finSemaine.getDate() + 7);
    const jalonsCetteSemaine = jalons.filter(({ date }) => {
        const dateJalon = new Date(`${date}T12:00:00`);
        return dateJalon >= debutSemaine && dateJalon < finSemaine;
    }).length;

    return (
        <section
            aria-label="Synthèse du mois"
            className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4"
        >
            <Metrique
                titre="Mariages confirmés"
                valeur={String(mariages.length).padStart(2, '0')}
                note={noteDiscrete(
                    mariages.map(({ couple }) => couple).join(' & ') || 'Aucun mariage ce mois-ci',
                )}
            >
                <span className="flex items-center gap-0.5 text-body-sm text-success">
                    <Icone nom="event_available" className="text-[14px]" />
                    {mariages.length ? 'Dates confirmées' : 'Aucune date'}
                </span>
            </Metrique>

            <Metrique
                titre="Jalons & échéances contractuelles"
                valeur={String(jalons.length).padStart(2, '0')}
                note={noteDiscrete('Échéances et jalons du mois')}
            >
                <span className="flex items-center gap-0.5 text-body-sm text-warning">
                    <Icone nom="schedule" className="text-[14px]" />
                    {jalonsCetteSemaine}{' '}
                    cette semaine
                </span>
            </Metrique>

            <Metrique
                titre="Effectif invité cumulé"
                valeur={invites ? String(invites) : '—'}
                note={noteDiscrete(invites ? 'Invités sur les mariages du mois' : 'Effectifs non renseignés')}
            >
                <span className="text-body-sm text-sage">Pax total</span>
            </Metrique>

            <Metrique
                titre="Jours planifiés"
                valeur={`${joursPlanifies.length} / ${joursDuMois}`}
                note={
                    <div
                        role="progressbar"
                        aria-label="Part des jours ouvrés avec un événement planifié"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={partJoursPlanifies}
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ivory"
                    >
                        <div
                            className="h-full rounded-full bg-ink"
                            style={{ width: `${partJoursPlanifies}%` }}
                        />
                    </div>
                }
            >
                <span className="text-body-sm text-sage">jours du mois avec événement</span>
            </Metrique>
        </section>
    );
}
