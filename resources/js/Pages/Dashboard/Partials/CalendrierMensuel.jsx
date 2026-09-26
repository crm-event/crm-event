import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { construireCases, nomDuMois } from '@/calendrier';

/**
 * Calendrier du mois : mariages (Jour J) et jalons de production.
 *
 * La grille est calculée à partir de l'année et du mois ; les événements de la
 * maquette (avril 2025) sont fournis en attendant les vraies données.
 */
const ANNEE = 2025;
const MOIS = 4;
const AUJOURD_HUI = 15;
const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const INDEX_SAMEDI = 5;

const EVENEMENTS = {
    4: { type: 'jalon', libelle: 'Point fleuriste' },
    10: { type: 'jalon', libelle: 'Jalon M-3 Léa' },
    15: { type: 'jalon', libelle: 'Calage Traiteur' },
    19: { type: 'mariage', libelle: 'Jour J • Camille & M.' },
    23: { type: 'jalon', libelle: 'Solde M-1' },
    26: { type: 'mariage', libelle: 'Jour J • Élodie & R.' },
};

function Case({ jour, horsMois, index, derniereLigne }) {
    const evenement = horsMois ? undefined : EVENEMENTS[jour];
    const estAujourdHui = !horsMois && jour === AUJOURD_HUI;
    const estSamedi = index % 7 === INDEX_SAMEDI;
    const estMariage = evenement?.type === 'mariage';

    const fond = estAujourdHui
        ? 'bg-ivory'
        : estMariage
          ? 'bg-cream-light/70'
          : estSamedi
            ? horsMois
                ? 'bg-ivory/20'
                : 'bg-ivory/40'
            : '';
    const couleurNumero = horsMois
        ? 'text-subtle'
        : estSamedi
          ? 'font-medium text-ink'
          : 'text-sage';

    return (
        <div
            className={`overflow-hidden p-1.5 ${fond} ${
                index % 7 === 6 ? '' : 'border-r'
            } ${derniereLigne ? '' : 'border-b'} border-cream`}
        >
            {estAujourdHui ? (
                <div className="flex items-center justify-between">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink font-display text-[11px] font-medium text-white">
                        {jour}
                    </span>
                    <span className="text-[8px] uppercase text-sage">
                        Aujourd’hui
                    </span>
                </div>
            ) : (
                <span className={couleurNumero}>{jour}</span>
            )}

            {estMariage && (
                <div className="mt-0.5 flex items-center gap-1 rounded bg-ink p-1 text-[10px] font-medium leading-none text-white shadow-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                    <span className="truncate">{evenement.libelle}</span>
                </div>
            )}

            {evenement?.type === 'jalon' && (
                <div className="mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                    <span
                        className={`truncate text-[10px] font-medium ${
                            estAujourdHui ? 'text-ink' : 'text-sage'
                        }`}
                    >
                        {evenement.libelle}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function CalendrierMensuel() {
    const cases = construireCases(ANNEE, MOIS);
    const evenements = Object.values(EVENEMENTS);
    const nombreDeMariages = evenements.filter((e) => e.type === 'mariage').length;
    const nombreDeJalons = evenements.length - nombreDeMariages;

    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-hairline pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-title-md text-ink">
                            {nomDuMois(ANNEE, MOIS)}
                        </h2>
                        <span className="rounded-full border border-subtle bg-ivory px-2 py-0.5 text-[10px] uppercase text-sage">
                            Planning Atelier
                        </span>
                    </div>
                    <p className="mt-0.5 text-body-sm text-sage">
                        {nombreDeMariages} célébrations Jour J • {nombreDeJalons}{' '}
                        jalons contractuels et logistiques
                    </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-4 text-label text-sage">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink" />
                            Mariage Jour J
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sage" />
                            Jalon de production
                        </span>
                    </div>
                    <div className="flex items-center overflow-hidden rounded-lg border border-subtle">
                        <button
                            type="button"
                            aria-label="Mois précédent"
                            className={`${anneauFocus} p-1.5 text-sage transition-colors hover:bg-ivory hover:text-ink`}
                        >
                            <Icone nom="chevron_left" className="text-[18px]" />
                        </button>
                        <div className="h-4 w-px bg-subtle" />
                        <button
                            type="button"
                            aria-label="Mois suivant"
                            className={`${anneauFocus} p-1.5 text-sage transition-colors hover:bg-ivory hover:text-ink`}
                        >
                            <Icone nom="chevron_right" className="text-[18px]" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <div className="grid grid-cols-7 border-b border-cream pb-2 text-center">
                    {JOURS_SEMAINE.map((jour, index) => (
                        <span
                            key={jour}
                            className={`text-caps uppercase ${
                                index === INDEX_SAMEDI ? 'text-ink' : 'text-sage'
                            }`}
                        >
                            {jour}
                        </span>
                    ))}
                </div>

                <div className="grid auto-rows-[64px] grid-cols-7 text-body-sm">
                    {cases.map((caseJour, index) => (
                        <Case
                            key={index}
                            {...caseJour}
                            index={index}
                            derniereLigne={index >= cases.length - 7}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3 text-body-sm">
                <div className="flex items-center gap-2 text-sage">
                    <Icone nom="villa" className="text-[16px] text-sage" />
                    <span>
                        Domaine des Grottes (19/04) &amp; Bastide de Gordes
                        (26/04)
                    </span>
                </div>
                <a
                    href="#"
                    className={`${anneauFocus} inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-ink underline underline-offset-4 transition-colors hover:text-sage`}
                >
                    Consulter la feuille de route du Jour J
                    <Icone nom="arrow_forward" className="text-[14px]" />
                </a>
            </div>
        </section>
    );
}
