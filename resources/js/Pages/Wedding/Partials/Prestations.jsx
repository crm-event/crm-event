import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import {formaterEuros} from "@/formats.js";

/**
 * Fil de prestation qui se trouvera sur la page marriage
 *
 * Les données sont par défaults en attendant les données du client
 */

const PRESTATIONS_PAR_DEFAUT = [
    {
        id: 1,
        icon: 'celebration',
        nom: 'Décoration & Wedding design',
        description: 'Conception du moodboard, art de la table, mobilier chiné et direction artistique florale.',
        montant: 4800,
        acompte: 1440,
        solde: 3360,
        statut: 'En cours',
    },
    {
        id: 2,
        icon: 'event',
        nom: 'Coordination du jour J',
        description: 'Feuille de route globale, régie des prestataires, accueil invités et gestion des timings.',
        montant: 2600,
        acompte: 780,
        solde: 1820,
        statut: 'En cours',
    },
    {
        id: 3,
        icon: 'diamond',
        nom: 'Officiante de cérémonie laïque',
        description: 'Écriture sur-mesure de l’histoire des mariés, rituels symboliques et accompagnement des témoins.',
        montant: 1500,
        acompte: 450,
        solde: 1050,
        statut: 'En cours',
    },
];

function Prestation({prestations}){
    const progression = prestations.montant > 0 ? Math.min(100, (prestations.acompte / prestations.montant) * 100) : 0;
    return (
        <article className="flex min-h-[205px] flex-col rounded-xl border border-hairline bg-white p-4">
            <div className="mb-4 flex items-start justify-between gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ivory text-ink">
                    <Icone nom={prestations.icon || 'event'} className="text-[16px]" />
                </span>
                <Statut>{prestations.statut || 'En cours'}</Statut>
            </div>

            <h3 className="font-display text-[13px] leading-5 text-ink">
                {prestations.nom || prestations.name}
            </h3>
            <p className="mt-1 min-h-10 text-[10px] leading-[1.55] text-sage">
                {prestations.description}
            </p>

            <div className="mt-auto border-t border-hairline pt-3">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.12em] text-sage">
                    <span>Montant prestation</span>
                    <strong className="font-display text-[13px] font-normal tracking-normal text-ink">
                        {formaterEuros(prestations.montant)}
                    </strong>
                </div>
                <div className="mt-3 flex items-center justify-between text-[9px] text-sage">
                    <span className="flex items-center gap-1">
                        <Icone nom="check_circle" className="text-[11px] text-success" />
                        Acompte {prestations.montant ? Math.round((prestations.acompte / prestations.montant) * 100) : 0}% réglé
                    </span>
                    <strong className="font-medium text-ink">{formaterEuros(prestations.acompte)}</strong>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cream">
                    <div
                        className="h-full rounded-full bg-ink"
                        style={{ width: `${progression}%` }}
                    />
                </div>
                <div className="mt-1.5 flex justify-between text-[9px] text-sage">
                    <span>Solde à venir</span>
                    <span className="font-medium text-ink">{formaterEuros(prestations.solde)}</span>
                </div>
            </div>
        </article>
    );
}

export default function Prestations(){
    return (
        <>
            <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <div>
                        <span className="text-caps uppercase text-sage">
                            Temps réel
                        </span>
                        <h2 className="font-display text-title-sm text-ink">
                            Prestations récentes
                        </h2>
                    </div>
                    <Icone nom="history" className="text-[18px] text-sage" />
                </div>

                <div className="relative mt-4">
                    <div className="absolute bottom-2 left-3.5 top-2 w-px bg-hairline" />
                    <div className="space-y-4 text-body-sm">
                        {PRESTATIONS_PAR_DEFAUT.map((prestations) => (
                            <Prestation key={prestations.nom} prestations={prestations} />
                        ))}
                    </div>
                </div>
            </section>

        </>
    );
}
