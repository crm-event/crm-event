import Icone from '@/Components/Icone';

/**
 * Légende des pastilles de couleur utilisées dans la grille du calendrier.
 */
const ENTREES = [
    {
        pastille: 'bg-ink ring-2 ring-ink/20',
        libelle: 'Jour J / Célébration mariage',
        classes: 'font-medium text-ink',
    },
    {
        pastille: 'bg-sage',
        libelle: 'Jalons contractuels (M-6, M-3, Solde M-1, Répétitions)',
        classes: 'text-sage',
    },
    {
        pastille: 'border border-ink bg-white',
        libelle: 'Rendez-vous découverte & repérages techniques',
        classes: 'text-sage',
    },
];

export default function LegendeCalendrier() {
    return (
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-ivory/70 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-6 text-body-sm">
                <span className="text-caps uppercase text-sage">
                    Légende opérationnelle :
                </span>
                {ENTREES.map(({ pastille, libelle, classes }) => (
                    <div key={libelle} className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${pastille}`} />
                        <span className={classes}>{libelle}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-sage">
                <Icone nom="info" className="text-[16px]" />
                <span>Cliquez sur une carte pour déployer la fiche régie</span>
            </div>
        </section>
    );
}
