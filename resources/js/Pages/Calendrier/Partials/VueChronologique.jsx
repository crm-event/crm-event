import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

function libelleEvenement(evenement) {
    return evenement.titre ?? evenement.libelle ?? evenement.categorie ?? 'Événement';
}

export default function VueChronologique({ evenements, onOuvrir }) {
    if (evenements.length === 0) {
        return <div className="rounded-lg border border-hairline bg-white p-10 text-center text-body text-sage">Aucun événement pour cette période.</div>;
    }

    return (
        <section aria-label="Liste chronologique" className="rounded-lg border border-hairline bg-white p-5 shadow-sm">
            <ol className="relative space-y-3 border-l border-subtle pl-6">
                {evenements.map((evenement) => {
                    const date = new Date(`${evenement.date}T12:00:00`);
                    return (
                        <li key={evenement.id} className="relative">
                            <span className="absolute -left-[30px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sage ring-1 ring-subtle">
                                <Icone nom={evenement.type === 'jour-j' ? 'favorite' : 'event'} className="text-[12px]" />
                            </span>
                            <button type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} flex w-full flex-col gap-1 rounded-lg border border-hairline p-3 text-left transition-colors hover:bg-ivory/60 sm:flex-row sm:items-center sm:justify-between`}>
                                <span>
                                    <span className="block text-[10px] uppercase tracking-wider text-sage">{date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}{evenement.heure ? ` · ${evenement.heure}` : ''}</span>
                                    <span className="mt-1 block font-medium text-ink">{libelleEvenement(evenement)}</span>
                                    {(evenement.couple || evenement.titre) && <span className="block text-body-sm text-sage">{evenement.couple ?? evenement.titre}</span>}
                                </span>
                                <Icone nom="chevron_right" className="hidden text-sage sm:block" />
                            </button>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
