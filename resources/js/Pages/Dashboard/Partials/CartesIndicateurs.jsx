import Icone from '@/Components/Icone';
import { formaterEuros } from '@/formats';

/**
 * Les quatre indicateurs du haut du tableau de bord.
 *
 * Les valeurs sont celles de la maquette, en attendant d'être alimentées par
 * les vraies données.
 */
const CA_ENCAISSE = 32400;
const CA_PREVU = 55000;
const SEUIL_VIGILANCE = 37500;
const SEUIL_FRANCHISE_TVA = 41250;

const classesCarte =
    'flex flex-col justify-between rounded-lg border border-hairline bg-white p-6 shadow-sm';
const classesPied =
    'flex items-center justify-between border-t border-cream pt-2 text-body-sm';

function EnTeteCarte({ titre, children }) {
    return (
        <div className="mb-3 flex items-start justify-between">
            <span className="text-caps uppercase text-sage">{titre}</span>
            {children}
        </div>
    );
}

function MariagesEnCours() {
    return (
        <article className={classesCarte}>
            <EnTeteCarte titre="Mariages en cours">
                <Icone nom="favorite" className="text-[18px] text-sage" />
            </EnTeteCarte>
            <div className="my-2 flex items-baseline gap-2">
                <span className="font-display text-kpi text-ink">12</span>
                <span className="text-body-sm text-sage">dossiers confirmés</span>
            </div>
            <div className={`${classesPied} text-success`}>
                <span className="inline-flex items-center gap-1">
                    <Icone nom="trending_up" className="text-[14px]" />
                    +2 par rapport à 2024
                </span>
                <span className="text-[11px] text-sage">Capacité max 14</span>
            </div>
        </article>
    );
}

function ChiffreAffairesEncaisse() {
    const progression = (CA_ENCAISSE / SEUIL_FRANCHISE_TVA) * 100;
    const reperVigilance = (SEUIL_VIGILANCE / SEUIL_FRANCHISE_TVA) * 100;
    const partVigilance = Math.round((CA_ENCAISSE / SEUIL_VIGILANCE) * 100);

    return (
        <article className={classesCarte}>
            <EnTeteCarte titre="CA encaissé cette année">
                <span className="rounded-full border border-subtle bg-ivory px-2 py-0.5 text-[9px] uppercase text-sage">
                    Franchise TVA
                </span>
            </EnTeteCarte>
            <div className="my-2">
                <div className="flex items-baseline justify-between">
                    <span className="font-display text-kpi text-ink">
                        {formaterEuros(CA_ENCAISSE)}
                    </span>
                    <span className="text-body-sm text-sage">
                        sur {formaterEuros(CA_PREVU)} prév.
                    </span>
                </div>

                <div className="mt-2.5 space-y-1">
                    <div
                        role="progressbar"
                        aria-label="Chiffre d'affaires encaissé par rapport au seuil de franchise de TVA"
                        aria-valuemin={0}
                        aria-valuemax={SEUIL_FRANCHISE_TVA}
                        aria-valuenow={CA_ENCAISSE}
                        className="relative h-2 w-full overflow-hidden rounded-full bg-ivory"
                    >
                        <div
                            className="h-full rounded-full bg-ink transition-all duration-500"
                            style={{ width: `${progression}%` }}
                        />
                        <div
                            className="absolute bottom-0 top-0 z-10 w-[1.5px] bg-warning"
                            style={{ left: `${reperVigilance}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] uppercase tracking-tight text-sage">
                        <span>0 €</span>
                        <span className="text-warning">
                            {formaterEuros(SEUIL_VIGILANCE)} (Vigilance)
                        </span>
                        <span>{formaterEuros(SEUIL_FRANCHISE_TVA)} (Seuil)</span>
                    </div>
                </div>
            </div>
            <div className={classesPied}>
                <span className="inline-flex items-center gap-1 text-warning">
                    <Icone nom="shield_with_heart" className="text-[14px]" />
                    {partVigilance}% du seuil de vigilance
                </span>
                <span className="text-[10px] uppercase text-sage">
                    Marge reste {formaterEuros(SEUIL_VIGILANCE - CA_ENCAISSE)}
                </span>
            </div>
        </article>
    );
}

function DemandesEnAttente() {
    return (
        <article className={classesCarte}>
            <EnTeteCarte titre="Demandes en attente">
                <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-warning">
                    À traiter
                </span>
            </EnTeteCarte>
            <div className="my-2 flex items-baseline gap-2">
                <span className="font-display text-kpi text-ink">7</span>
                <span className="text-body-sm text-sage">leads qualifiés</span>
            </div>
            <div className={classesPied}>
                <span className="inline-flex items-center gap-1 text-sage">
                    <Icone nom="schedule" className="text-[15px]" />
                    <span>
                        <strong className="font-medium text-ink">
                            3 à relancer
                        </strong>{' '}
                        cette semaine
                    </span>
                </span>
                <span className="text-[10px] uppercase text-sage">
                    Marseille / Aix
                </span>
            </div>
        </article>
    );
}

function ProchainJalon() {
    return (
        <article className={classesCarte}>
            <EnTeteCarte titre="Prochain jalon">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ivory font-display text-[12px] font-medium text-ink">
                    !
                </span>
            </EnTeteCarte>
            <div className="my-2">
                <div className="font-display text-[22px] leading-7 tracking-tight text-ink">
                    J-18 • Clémence &amp; Alex.
                </div>
                <p className="mt-0.5 line-clamp-1 text-body-sm text-sage">
                    Solde M-1 et calage traiteur
                </p>
            </div>
            <div className={`${classesPied} text-sage`}>
                <span className="inline-flex items-center gap-1">
                    <Icone nom="pin_drop" className="text-[14px]" />
                    Domaine de Canaille
                </span>
                <span className="text-[10px] font-medium uppercase text-ink">
                    3 Mai 2025
                </span>
            </div>
        </article>
    );
}

export default function CartesIndicateurs() {
    return (
        <section
            aria-label="Indicateurs clés"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            <MariagesEnCours />
            <ChiffreAffairesEncaisse />
            <DemandesEnAttente />
            <ProchainJalon />
        </section>
    );
}
