import Icone from '@/Components/Icone';
import { nomDuMois } from '@/calendrier';
import { anneauFocus } from '@/charte';

/**
 * Titre de la page et commandes du calendrier : saison, navigation entre les
 * mois, choix de la vue et ajout d'un jalon.
 */
const VUES = ['Mois', 'Semaine', 'Liste chronologique'];

const classesBoutonMois = `${anneauFocus} flex h-8 w-8 items-center justify-center rounded text-sage transition-colors hover:bg-ivory hover:text-ink`;

export default function EnteteCalendrier({
    annee,
    mois,
    vue,
    onAnneeChange,
    onMoisChange,
    onVueChange,
    onAjouterJalon,
}) {
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
                    Calendrier de la Saison {annee}
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
                        value={annee}
                        onChange={(event) => onAnneeChange(Number(event.target.value))}
                        className={`${anneauFocus} cursor-pointer appearance-none rounded-lg border border-hairline bg-white py-2 pl-4 pr-8 text-label text-ink focus:border-ink focus:ring-0`}
                    >
                        <option value="2026">Saison 2026 (Réservations ouvertes)</option>
                        <option value="2027">Saison 2027</option>
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
                        onClick={() => onMoisChange(-1)}
                        className={classesBoutonMois}
                    >
                        <Icone nom="chevron_left" className="text-[18px]" />
                    </button>
                    <span className="w-44 shrink-0 px-2 text-center font-display text-title-sm text-ink">
                        {nomDuMois(annee, mois)}
                    </span>
                    <button
                        type="button"
                        aria-label="Mois suivant"
                        onClick={() => onMoisChange(1)}
                        className={classesBoutonMois}
                    >
                        <Icone nom="chevron_right" className="text-[18px]" />
                    </button>
                </div>

                <div className="inline-flex rounded-lg border border-hairline bg-ivory p-1">
                    {VUES.map((vueLabel) => (
                        <button
                            key={vueLabel}
                            type="button"
                            aria-pressed={vue === vueLabel}
                            onClick={() => onVueChange(vueLabel)}
                            className={`${anneauFocus} rounded-md px-3.5 py-1.5 text-caps uppercase transition-colors ${
                                vue === vueLabel
                                    ? 'bg-ink text-white shadow-sm'
                                    : 'text-sage hover:text-ink'
                            }`}
                        >
                            {vueLabel}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onAjouterJalon}
                    className={`${anneauFocus} inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-body text-white shadow-sm transition-opacity hover:opacity-80`}
                >
                    <Icone nom="add" className="text-[18px]" />
                    <span>Poser un jalon</span>
                </button>
            </div>
        </section>
    );
}
