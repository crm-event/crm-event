import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

/**
 * Les trois encarts sous le calendrier : Jour J imminent, jalons et soldes du
 * mois, notes logistiques.
 */
const HORAIRES_JOUR_J = [
    { libelle: 'Briefing équipe régie :', heure: 'Samedi 10:00' },
    { libelle: 'Cérémonie Parc Sud :', heure: '15:30' },
    { libelle: 'Dîner aux chandelles :', heure: '20:00' },
];

const JALONS = [
    {
        couple: 'Clémence & Alexandre',
        detail: 'Appel de fonds solde (M-1) — 4 200 €',
        date: '28 Avr.',
    },
    {
        couple: 'Camille & Thomas',
        detail: 'Test menu de mariage 4 plats traiteur',
        date: '30 Avr.',
    },
    {
        couple: 'Juliette & Marc',
        detail: 'Avenant scénographie lumineuse',
        date: '05 Mai',
    },
];

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

export default function ApercuQuinzaine() {
    return (
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className={classesCarte}>
                <EnTeteCarte
                    pastille="bg-ink"
                    titre="Jour J Imminent : Fonscolombe"
                    etiquette="J-4"
                    classesEtiquette="text-warning"
                />
                <p className="mb-4 text-body leading-relaxed text-sage">
                    Installation technique sous barnum cristal dès vendredi
                    14:00. Coordination de 12 prestataires confirmée avec
                    l’intendant du domaine.
                </p>
                <div className="space-y-2 border-t border-hairline pt-4">
                    {HORAIRES_JOUR_J.map(({ libelle, heure }) => (
                        <div
                            key={libelle}
                            className="flex items-center justify-between text-body-sm"
                        >
                            <span className="text-sage">{libelle}</span>
                            <span className="font-medium text-ink">{heure}</span>
                        </div>
                    ))}
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
                    {JALONS.map(({ couple, detail, date }, index) => (
                        <li
                            key={couple}
                            className={`flex items-start justify-between gap-2 ${
                                index < JALONS.length - 1
                                    ? 'border-b border-hairline/60 pb-2'
                                    : ''
                            }`}
                        >
                            <div>
                                <span className="block text-body font-medium text-ink">
                                    {couple}
                                </span>
                                <span className="text-[11px] text-sage">
                                    {detail}
                                </span>
                            </div>
                            <span className="shrink-0 font-display text-label text-ink">
                                {date}
                            </span>
                        </li>
                    ))}
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
                        Prévisions ensoleillées (23°C) pour le week-end du 19
                        avril. Accès semi-remorques traiteur autorisé par le
                        portail nord du Domaine de Fonscolombe dès vendredi
                        matin.
                    </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-sage">
                        Feuille de route PDF
                    </span>
                    <button
                        type="button"
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
