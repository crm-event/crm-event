import Icone from '@/Components/Icone';
import { nomDuMois } from '@/calendrier';
import { anneauFocus } from '@/charte';
import { ANNEE, MOIS } from '@/Pages/Calendrier/donnees';

/**
 * Titre de la page et commandes du calendrier : saison, navigation entre les
 * mois, choix de la vue et ajout d'un jalon.
 */
const VUES = ['Mois', 'Semaine', 'Liste chronologique'];
const VUE_ACTIVE = 'Mois';

const classesBoutonMois = `${anneauFocus} flex h-8 w-8 items-center justify-center rounded text-sage transition-colors hover:bg-ivory hover:text-ink`;

export default function EnteteCalendrier() {
    return (
        <section className="mb-6 flex flex-col justify-between gap-6 border-b border-hairline pb-6 xl:flex-row xl:items-end">
            <div>
                <div className="mb-1 flex items-center gap-2">
                    <span className="text-caps uppercase tracking-widest text-sage">
                        Planning Opérationnel
                    </span>
                    <span className="text-body-sm text-subtle">•</span>
                    <span className="text-caps uppercase tracking-widest text-warning">
                        Haute Saison
                    </span>
                </div>
                <h1 className="font-display text-[22px] leading-7 tracking-tight text-ink sm:text-title-lg">
                    Calendrier de la Saison {ANNEE}
                </h1>
                <p className="mt-1 text-body text-sage">
                    Ordonnancement des célébrations en Provence, jalons
                    préparatoires et repérages techniques.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                    <select
                        aria-label="Saison"
                        defaultValue="2025"
                        className={`${anneauFocus} cursor-pointer appearance-none rounded-lg border border-hairline bg-white py-2 pl-4 pr-8 text-label text-ink focus:border-ink focus:ring-0`}
                    >
                        <option value="2025">Saison 2025 (Provence &amp; Côte)</option>
                        <option value="2026">Saison 2026 (Réservations ouvertes)</option>
                    </select>
                    <Icone
                        nom="expand_more"
                        className="pointer-events-none absolute right-2.5 top-2.5 text-[16px] text-sage"
                    />
                </div>

                <div className="flex items-center rounded-lg border border-hairline bg-white p-0.5">
                    <button
                        type="button"
                        aria-label="Mois précédent"
                        className={classesBoutonMois}
                    >
                        <Icone nom="chevron_left" className="text-[18px]" />
                    </button>
                    <span className="min-w-[128px] px-4 text-center font-display text-title-sm text-ink">
                        {nomDuMois(ANNEE, MOIS)}
                    </span>
                    <button
                        type="button"
                        aria-label="Mois suivant"
                        className={classesBoutonMois}
                    >
                        <Icone nom="chevron_right" className="text-[18px]" />
                    </button>
                </div>

                <div className="inline-flex rounded-lg border border-hairline bg-ivory p-1">
                    {VUES.map((vue) => (
                        <button
                            key={vue}
                            type="button"
                            aria-pressed={vue === VUE_ACTIVE}
                            className={`${anneauFocus} rounded-md px-3.5 py-1.5 text-caps uppercase transition-colors ${
                                vue === VUE_ACTIVE
                                    ? 'bg-ink text-white shadow-sm'
                                    : 'text-sage hover:text-ink'
                            }`}
                        >
                            {vue}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className={`${anneauFocus} inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-body text-white shadow-sm transition-opacity hover:opacity-80`}
                >
                    <Icone nom="add" className="text-[18px]" />
                    <span>Poser un jalon</span>
                </button>
            </div>
        </section>
    );
}
