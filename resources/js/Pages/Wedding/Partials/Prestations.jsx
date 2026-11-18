
import Icone from '@/Components/Icone';
import { formaterEuros } from '@/formats.js';

function Statut({ children }) {
    return (
        <span className="inline-flex items-center rounded-full bg-blush px-2 py-1 text-[9px] font-medium text-sage">
            {children}
        </span>
    );
}

function formaterDate(date) {
    if (!date) return 'Non renseignée';

    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function obtenirStatut(prestation) {
    if (prestation.contract_signed_at) {
        return 'Contrat signé';
    }

    if (prestation.quote_accepted_at) {
        return 'Devis accepté';
    }

    if (prestation.quote_sent_at) {
        return 'Devis envoyé';
    }

    return 'À préparer';
}

function Information({ label, valeur }) {
    return (
        <div className="flex items-start justify-between gap-3 text-[10px]">
            <span className="text-sage">{label}</span>
            <span className="text-right font-medium text-ink">
                {valeur || 'Non renseigné'}
            </span>
        </div>
    );
}

export default function Prestations({ prestation }) {
    if (!prestation) return null;

    const montant = Number(prestation.amount ?? 0);
    const statut = obtenirStatut(prestation);

    return (
        <article className="flex min-h-[205px] flex-col rounded-xl border border-hairline bg-white p-4">
            <div className="mb-4 flex items-start justify-between gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ivory text-ink">
                    <Icone nom="event" className="text-[16px]" />
                </span>

                <Statut>{statut}</Statut>
            </div>

            <h3 className="font-display text-[13px] leading-5 text-ink">
                {prestation.service?.name || 'Prestation sans nom'}
            </h3>

            <p className="mt-1 text-[10px] leading-[1.55] text-sage">
                {'Aucune description renseignée.'}
            </p>

            <div className="mt-auto border-t border-hairline pt-3">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.12em] text-sage">
                        Montant prestation
                    </span>

                    <strong className="font-display text-[13px] font-normal text-ink">
                        {formaterEuros(montant)}
                    </strong>
                </div>

                <div className="space-y-2">
                    <Information
                        label="Numéro du devis"
                        valeur={prestation.quote_number}
                    />

                    <Information
                        label="Devis envoyé"
                        valeur={formaterDate(prestation.quote_sent_at)}
                    />

                    <Information
                        label="Valide jusqu'au"
                        valeur={formaterDate(prestation.quote_valid_until)}
                    />

                    <Information
                        label="Devis accepté"
                        valeur={formaterDate(prestation.quote_accepted_at)}
                    />

                    <Information
                        label="Contrat signé"
                        valeur={formaterDate(prestation.contract_signed_at)}
                    />
                </div>
            </div>
        </article>
    );
}
