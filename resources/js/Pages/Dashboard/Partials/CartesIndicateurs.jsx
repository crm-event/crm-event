import Icone from '@/Components/Icone';
import { dateCourte, euros } from '@/Pages/Dashboard/presentation';

function Carte({ titre, icone, children, pied }) {
    return (
        <article className="flex flex-col justify-between rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="text-caps uppercase text-sage">{titre}</h2>
                <Icone nom={icone} className="text-[18px] text-sage" />
            </div>
            <div className="my-2">{children}</div>
            {pied && <div className="border-t border-cream pt-2 text-body-sm text-sage">{pied}</div>}
        </article>
    );
}

export default function CartesIndicateurs({ suivi, finances }) {
    const { prochainJalon } = suivi;
    const plafond = finances.seuilMajore ?? finances.seuil;
    const progression = plafond ? Math.max(0, Math.min(100, 100 * finances.encaisse / plafond)) : 0;

    return (
        <section aria-label="Indicateurs clés" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Carte titre="Mariages en cours" icone="favorite" pied="Dossiers confirmés en préparation">
                <span className="font-display text-[48px] leading-none text-ink">{suivi.mariages}</span>
            </Carte>
            <Carte titre="CA encaissé cette année" icone="euro" pied={'Échéances signées à encaisser : ' + euros(finances.reste)}>
                <span className="font-display text-kpi text-ink">{euros(finances.encaisse)}</span>
                {plafond !== null && (
                    <div className="mt-2 space-y-1">
                        <div role="progressbar" aria-label="Encaissements par rapport au seuil de TVA paramétré" aria-valuenow={Math.round(progression)} className="h-2 overflow-hidden rounded-full bg-ivory">
                            <div className="h-full rounded-full bg-ink" style={{ width: progression + '%' }} />
                        </div>
                        {finances.seuil !== null && <p className="text-body-sm text-sage">Seuil de base · {euros(finances.seuil)}</p>}
                        {finances.seuilMajore !== null && <p className="text-body-sm text-sage">Seuil majoré · {euros(finances.seuilMajore)}</p>}
                    </div>
                )}
            </Carte>
            <Carte titre="Demandes en attente" icone="schedule" pied="Dossiers en demande ou avec devis envoyé">
                <span className="font-display text-[48px] leading-none text-ink">{suivi.demandes}</span>
            </Carte>
            <Carte titre="Prochain jalon" icone="event_note" pied={prochainJalon && dateCourte(prochainJalon.date)}>
                <div className="font-display text-[22px] leading-7 text-ink">{prochainJalon?.libelle ?? 'Aucun jalon à venir'}</div>
                {prochainJalon?.lieu && <p className="mt-1 text-body-sm text-sage">{prochainJalon.lieu}</p>}
            </Carte>
        </section>
    );
}
