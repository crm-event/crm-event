
import Icone from '@/Components/Icone';
import { formaterEuros } from '@/formats.js';

function Statut({ children }) {
    return (
        <span className="inline-flex items-center rounded-full bg-blush px-2 py-1 text-[9px] font-medium text-sage">
            {children}
        </span>
    );
}

export default function Prestations({ prestation }) {
    if (!prestation) return null;

    const montant = Number(prestation.montant ?? prestation.amount ?? 0);
    const acompte = Number(prestation.acompte ?? prestation.deposit ?? 0);
    const solde = Number(
        prestation.solde ?? prestation.balance ?? Math.max(0, montant - acompte)
    );

    const progression = montant > 0
        ? Math.min(100, (acompte / montant) * 100)
        : 0;

    return (
        <article className="flex min-h-[205px] flex-col rounded-xl border border-hairline bg-white p-4">
            <div className="mb-4 flex items-start justify-between gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ivory text-ink">
                    <Icone
                        nom={prestation.icon || 'event'}
                        className="text-[16px]"
                    />
                </span>

                <Statut>
                    {prestation.statut || prestation.status || 'À définir'}
                </Statut>
            </div>

            <h3 className="font-display text-[13px] leading-5 text-ink">
                {prestation.nom || prestation.name || 'Prestation sans nom'}
            </h3>

            <p className="mt-1 min-h-10 text-[10px] leading-[1.55] text-sage">
                {prestation.description || 'Aucune description renseignée.'}
            </p>

            <div className="mt-auto border-t border-hairline pt-3">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.12em] text-sage">
                    <span>Montant prestation</span>

                    <strong className="font-display text-[13px] font-normal tracking-normal text-ink">
                        {formaterEuros(montant)}
                    </strong>
                </div>

                <div className="mt-3 flex items-center justify-between text-[9px] text-sage">
                    <span className="flex items-center gap-1">
                        <Icone
                            nom="check_circle"
                            className="text-[11px] text-success"
                        />
                        Acompte {Math.round(progression)}% réglé
                    </span>

                    <strong className="font-medium text-ink">
                        {formaterEuros(acompte)}
                    </strong>
                </div>

                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cream">
                    <div
                        className="h-full rounded-full bg-ink"
                        style={{ width: `${progression}%` }}
                    />
                </div>

                <div className="mt-1.5 flex justify-between text-[9px] text-sage">
                    <span>Solde à venir</span>

                    <span className="font-medium text-ink">
                        {formaterEuros(solde)}
                    </span>
                </div>
            </div>
        </article>
    );
}
