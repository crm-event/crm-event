import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function VueSemaine({ dateRepere, evenements, onSemaineChange, onOuvrir }) {
    const lundi = new Date(dateRepere);
    lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
    const cases = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(lundi);
        date.setDate(lundi.getDate() + index);
        return date;
    });
    const periode = `${cases[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ${cases[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    return (
        <section aria-label="Vue semaine" className="overflow-x-auto rounded-lg border border-hairline bg-white shadow-sm">
            <div className="flex min-w-[840px] items-center justify-between border-b border-hairline px-4 py-3">
                <h2 className="font-display text-title-sm text-ink">Semaine du {periode}</h2>
                <div className="flex items-center gap-2">
                    <button type="button" aria-label="Afficher la semaine précédente" onClick={() => onSemaineChange(-1)} className={`${anneauFocus} inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1.5 text-[11px] text-sage transition-colors hover:bg-ivory hover:text-ink`}>
                        <Icone nom="chevron_left" className="text-[16px]" />
                        Précédente
                    </button>
                    <button type="button" aria-label="Afficher la semaine suivante" onClick={() => onSemaineChange(1)} className={`${anneauFocus} inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1.5 text-[11px] text-sage transition-colors hover:bg-ivory hover:text-ink`}>
                        Suivante
                        <Icone nom="chevron_right" className="text-[16px]" />
                    </button>
                </div>
            </div>
            <div className="grid min-w-[840px] grid-cols-7">
                {cases.map((date, index) => {
                    const cleDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const evenementsDuJour = evenements.filter((evenement) => evenement.date === cleDate);

                    return (
                        <div key={cleDate} className={`min-h-64 border-hairline p-3 ${index < 6 ? 'border-r' : ''}`}>
                            <div className="mb-3 border-b border-hairline pb-2">
                                <span className="block text-[10px] uppercase tracking-wider text-sage">{JOURS[index]}</span>
                                <span className="font-display text-title-sm text-ink">{date.getDate()}</span>
                                <span className="ml-1 text-[10px] text-sage">{date.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                            </div>
                            <div className="space-y-2">
                                {evenementsDuJour.map((evenement) => (
                                    <button key={evenement.id} type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} w-full rounded-md border border-hairline bg-ivory/70 p-2 text-left hover:border-sage`}>
                                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-sage">
                                            <Icone nom={evenement.type === 'jour-j' ? 'favorite' : 'event'} className="text-[13px]" />
                                            {evenement.heure ?? (evenement.type === 'jour-j' ? 'Jour J' : 'Jalon')}
                                        </span>
                                        <span className="mt-1 block text-[11px] font-medium leading-snug text-ink">{evenement.couple ?? evenement.titre ?? evenement.libelle ?? evenement.categorie}</span>
                                    </button>
                                ))}
                                {evenementsDuJour.length === 0 && <span className="text-[11px] text-sage">Aucun événement</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
