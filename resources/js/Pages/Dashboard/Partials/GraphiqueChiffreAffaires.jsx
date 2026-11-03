import Icone from '@/Components/Icone';
import { formaterEuros } from '@/formats';

/**
 * Histogramme mensuel du chiffre d'affaires 2025 : encaissé, signé à venir et
 * prévisionnel. Les montants sont ceux de la maquette.
 */
const PLAFOND = 10000;
const REPERES = [10000, 7500, 5000, 2500];
const MOIS_COURANT = 'Avr';

/** De haut en bas dans la barre : prévisionnel, signé, puis encaissé. */
const SEGMENTS = [
    { cle: 'previsionnel', classes: 'bg-hairline group-hover:bg-sage/60' },
    { cle: 'signe', classes: 'bg-sage group-hover:brightness-110' },
    { cle: 'encaisse', classes: 'bg-ink group-hover:brightness-125' },
];

const MOIS = [
    { libelle: 'Jan', encaisse: 4200 },
    { libelle: 'Fév', encaisse: 5800 },
    { libelle: 'Mar', encaisse: 8400 },
    { libelle: 'Avr', encaisse: 7600, signe: 2000 },
    { libelle: 'Mai', signe: 6400 },
    { libelle: 'Juin', signe: 7900 },
    { libelle: 'Juil', previsionnel: 4500 },
    { libelle: 'Aoû', previsionnel: 3000 },
    { libelle: 'Sep', signe: 5200 },
    { libelle: 'Oct', signe: 3800 },
    { libelle: 'Nov', previsionnel: 1500 },
    { libelle: 'Déc', previsionnel: 2000 },
];

const LEGENDE = [
    { libelle: 'Encaissé', classes: 'bg-ink' },
    { libelle: 'Signé à venir', classes: 'bg-sage' },
    { libelle: 'Prévisionnel', classes: 'bg-hairline' },
];

function Barre({ mois }) {
    const total = SEGMENTS.reduce((somme, { cle }) => somme + (mois[cle] ?? 0), 0);
    const estCourant = mois.libelle === MOIS_COURANT;

    return (
        <div
            tabIndex={0}
            aria-label={`${mois.libelle} : ${formaterEuros(total)}`}
            className="group relative flex h-full cursor-pointer flex-col items-center justify-end outline-none"
        >
            <div className="pointer-events-none absolute -top-7 rounded bg-ink px-1.5 py-0.5 font-display text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {formaterEuros(total)}
            </div>

            <div
                className="flex w-full max-w-[28px] flex-col overflow-hidden rounded-t-sm"
                style={{ height: `${(total / PLAFOND) * 100}%` }}
            >
                {SEGMENTS.map(({ cle, classes }) =>
                    mois[cle] ? (
                        <div
                            key={cle}
                            className={`w-full transition-all ${classes}`}
                            style={{ height: `${(mois[cle] / total) * 100}%` }}
                        />
                    ) : null,
                )}
            </div>

            <span
                className={`mt-2 text-[10px] uppercase ${
                    estCourant ? 'font-semibold text-ink' : 'text-sage'
                }`}
            >
                {mois.libelle}
            </span>
        </div>
    );
}

export default function GraphiqueChiffreAffaires() {
    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-hairline pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-title-md text-ink">
                            Chiffre d’Affaires Encaissé 2025
                        </h2>
                        <span className="rounded-full border border-subtle bg-ivory px-2 py-0.5 text-[10px] uppercase text-ink">
                            Mensuel Réel
                        </span>
                    </div>
                    <p className="mt-0.5 text-body-sm text-sage">
                        Ventilation des acomptes reçus et prévisionnels
                        d’honoraires de scénographie
                    </p>
                </div>

                <div className="flex items-center gap-3 text-label text-sage">
                    {LEGENDE.map(({ libelle, classes }) => (
                        <span
                            key={libelle}
                            className="inline-flex items-center gap-1.5"
                        >
                            <span className={`h-2.5 w-2.5 rounded-sm ${classes}`} />
                            {libelle}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pt-6">
                <div className="relative flex h-56 w-full items-end">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex flex-col justify-between"
                    >
                        {REPERES.map((montant) => (
                            <div
                                key={montant}
                                className="flex w-full justify-end border-b border-dashed border-hairline"
                            >
                                <span className="-mt-3 bg-white pl-1 text-[9px] uppercase text-sage">
                                    {formaterEuros(montant)}
                                </span>
                            </div>
                        ))}
                        <div className="w-full border-b border-hairline" />
                    </div>

                    <div className="z-10 grid h-48 w-full grid-cols-12 items-end gap-2 pl-2 pr-[4.5rem]">
                        {MOIS.map((mois) => (
                            <Barre key={mois.libelle} mois={mois} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-hairline pt-3 text-body-sm text-sage sm:flex-row">
                <div className="flex items-center gap-2">
                    <Icone nom="account_balance" className="text-[16px] text-sage" />
                    <span>
                        Encaissement moyen par dossier :{' '}
                        <strong className="font-display font-medium text-ink">
                            4 580 €
                        </strong>
                    </span>
                </div>
                <span className="text-[10px] uppercase text-sage">
                    Rapprochement bancaire à jour au 14/04
                </span>
            </div>
        </section>
    );
}
