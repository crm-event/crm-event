import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

/**
 * Les trois encarts sous le calendrier : Jour J imminent, jalons et soldes du
 * mois, notes logistiques.
 */
const classesCarte = 'rounded-lg border border-hairline bg-white p-6';

function EnTeteCarte({ pastille, titre, etiquette, classesEtiquette }) {
    return (
        <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${pastille}`} />
                <h2 className="font-display text-title-sm text-ink">{titre}</h2>
            </div>
            <span className={`text-caps uppercase ${classesEtiquette}`}>
                {etiquette}
            </span>
        </div>
    );
}

export default function ApercuQuinzaine({ evenements }) {
    const mariage = evenements.find(({ type }) => type === 'jour-j');
    const demandeEnAttente = evenements.find(({ statut }) => statut === 'en-attente');
    const jalons = evenements
        .filter(({ type, statut }) => !['jour-j', 'rdv', 'note'].includes(type) && statut !== 'en-attente')
        .slice(0, 3);
    const notes = evenements.filter(({ type }) => type === 'note');

    return (
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className={classesCarte}>
                <EnTeteCarte
                    pastille="bg-ink"
                    titre={mariage ? `Jour J : ${mariage.couple}` : demandeEnAttente ? 'Date souhaitée' : 'Jour J du mois'}
                    etiquette={mariage ? 'Confirmé' : demandeEnAttente ? 'En attente' : 'Aucun'}
                    classesEtiquette="text-warning"
                />
                <p className="mb-4 text-body leading-relaxed text-sage">
                    {mariage
                        ? `${mariage.lieu} · ${mariage.prestation}.`
                        : demandeEnAttente
                          ? `${demandeEnAttente.couple} · ${demandeEnAttente.lieu}. Cette date n’est pas confirmée.`
                          : 'Aucun mariage confirmé dans ce mois.'}
                </p>
                <div className="space-y-2 border-t border-hairline pt-4">
                    <div className="flex items-center justify-between text-body-sm">
                        <span className="text-sage">Date du mariage</span>
                        <span className="font-medium text-ink">{mariage || demandeEnAttente ? new Date(`${(mariage ?? demandeEnAttente).date}T12:00:00`).toLocaleDateString('fr-FR') : '—'}</span>
                    </div>
                </div>
            </div>

            <div className={classesCarte}>
                <EnTeteCarte
                    pastille="bg-sage"
                    titre="Jalons & Soldes du mois"
                    etiquette="Contrats"
                    classesEtiquette="text-sage"
                />
                <ul className="space-y-3">
                    {jalons.map((jalon, index) => (
                        <li
                            key={jalon.id}
                            className={`flex items-start justify-between gap-2 ${
                                index < jalons.length - 1
                                    ? 'border-b border-hairline/60 pb-2'
                                    : ''
                            }`}
                        >
                            <div>
                                <span className="block text-body font-medium text-ink">{jalon.couple ?? jalon.titre ?? jalon.libelle ?? jalon.categorie}</span>
                                <span className="text-[11px] text-sage">
                                    {jalon.notes ?? jalon.gauche ?? jalon.libelle ?? 'Jalon opérationnel'}
                                </span>
                            </div>
                            <span className="shrink-0 font-display text-label text-ink">{new Date(`${jalon.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </li>
                    ))}
                    {jalons.length === 0 && <li className="text-body-sm text-sage">Aucun jalon ce mois-ci.</li>}
                </ul>
            </div>

            <div className={`${classesCarte} flex flex-col justify-between`}>
                <div>
                    <EnTeteCarte
                        pastille="border border-ink"
                        titre="Notes logistiques"
                        etiquette="Météo & Accès"
                        classesEtiquette="text-sage"
                    />
                    <p className="text-body leading-relaxed text-sage">
                        {notes.length ? notes.map(({ libelle, pied }) => [libelle, pied].filter(Boolean).join(' · ')).join(' — ') : 'Aucune note logistique renseignée pour ce mois.'}
                    </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-sage">
                        Feuille de route PDF
                    </span>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className={`${anneauFocus} inline-flex items-center gap-1 text-caps uppercase text-ink hover:underline`}
                    >
                        <span>Exporter le déroulé</span>
                        <Icone nom="download" className="text-[15px]" />
                    </button>
                </div>
            </div>
        </section>
    );
}
