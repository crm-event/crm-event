import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { construireCases } from '@/calendrier';

/**
 * Grille du mois avec les événements de chaque jour. Les cartes qui portent une
 * fiche régie appellent `onOuvrir` avec l'identifiant de cette fiche.
 */
const JOURS_SEMAINE = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
];
const INDEX_SAMEDI = 5;

const classesCarte = `${anneauFocus} w-full rounded-md border p-2 text-left transition-all hover:border-sage`;

function Point({ classes }) {
    return <span className={`shrink-0 rounded-full ${classes}`} />;
}

function CarteJourJ({ evenement, onOuvrir }) {
    return (
        <>
            <button
                type="button"
                onClick={() => onOuvrir(evenement)}
                className={`${anneauFocus} w-full rounded-md bg-ink p-2.5 text-left text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-ink/90`}
            >
                <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-blush">
                        <Icone nom="star" className="text-[13px] text-blush" />
                    {evenement.statut === 'en-attente' ? 'Date souhaitée' : 'Mariage confirmé'}
                    </span>
                    <span className="text-[11px] font-medium text-blush">
                        {evenement.heure ?? ''}
                    </span>
                </div>
                <div className="font-display text-[14px] leading-tight text-white">
                    {evenement.couple}
                </div>
                <p className="mt-1 truncate text-[11px] text-blush">
                    {evenement.lieu}
                </p>
            </button>
        </>
    );
}

function CarteDetaillee({ evenement, onOuvrir }) {
    const fond =
        evenement.fond === 'blanc'
            ? 'border-hairline bg-white'
            : 'border-subtle bg-ivory';

    return (
        <button
            type="button"
            onClick={() => onOuvrir(evenement)}
            className={`${classesCarte} ${fond}`}
        >
            <div className="mb-1 flex items-center gap-1.5">
                <Point classes="h-2 w-2 bg-sage" />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-sage">
                    {evenement.categorie}
                </span>
            </div>
            <div className="truncate font-display text-[12px] text-ink">
                {evenement.titre}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-sage">
                <span>{evenement.gauche}</span>
                {evenement.droite && <span>{evenement.droite}</span>}
                {evenement.fleche && (
                    <Icone nom="arrow_forward" className="text-[13px] text-sage" />
                )}
            </div>
        </button>
    );
}

function Evenement({ evenement, onOuvrir }) {
    switch (evenement.type) {
        case 'rdv':
            return (
                <button type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} flex w-full items-center gap-1.5 rounded border border-subtle bg-white px-2 py-1 text-left hover:border-sage`}>
                    <Point classes="h-1.5 w-1.5 border border-ink" />
                    <span className="truncate text-[11px] text-ink">
                    {evenement.libelle ?? evenement.titre}
                    </span>
                </button>
            );
        case 'jalon':
            return (
                <button type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} flex w-full items-center gap-1.5 rounded border border-hairline bg-ivory px-2 py-1 text-left text-sage hover:border-sage`}>
                    <Point classes="h-1.5 w-1.5 bg-sage" />
                    <span className="truncate text-[11px]">
                        {evenement.libelle ?? evenement.titre}
                    </span>
                </button>
            );
        case 'urgent':
            return (
                <button type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} w-full rounded border border-hairline bg-white p-1.5 text-left shadow-2xs hover:border-sage`}>
                    <span className="block text-[9px] uppercase text-warning">
                        {evenement.categorie}
                    </span>
                    <span className="text-[11px] font-medium text-ink">
                        {evenement.libelle}
                    </span>
                </button>
            );
        case 'repetition':
            return (
                <button type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} w-full rounded border border-hairline bg-ivory p-1.5 text-left text-ink hover:border-sage`}>
                    <div className="flex items-center gap-1.5">
                        <Point classes="h-2 w-2 bg-sage" />
                        <span className="truncate text-[11px] font-medium">
                            {evenement.libelle}
                        </span>
                    </div>
                    <span className="mt-0.5 block text-[10px] font-medium text-sage">
                        {evenement.pied}
                    </span>
                </button>
            );
        case 'note':
            return (
                <button type="button" onClick={() => onOuvrir(evenement)} className={`${anneauFocus} w-full rounded border border-hairline bg-ivory px-2 py-1 text-left text-sage hover:border-sage`}>
                    <span className="block truncate text-[11px]">
                        {evenement.libelle}
                    </span>
                    <span className="text-[10px]">{evenement.pied}</span>
                </button>
            );
        case 'carte':
            return <CarteDetaillee evenement={evenement} onOuvrir={onOuvrir} />;
        case 'jour-j':
            return <CarteJourJ evenement={evenement} onOuvrir={onOuvrir} />;
        default:
            return null;
    }
}

function Case({ jour, mois, annee, horsMois, index, derniereLigne, jours, onOuvrir, onAjouter }) {
    const donnees = horsMois ? undefined : jours[jour];
    const evenements = donnees?.evenements ?? [];
    const maintenant = new Date();
    const estAujourdHui =
        !horsMois &&
        jour === maintenant.getDate() &&
        mois === maintenant.getMonth() + 1 &&
        annee === maintenant.getFullYear();
    const estJourJ = evenements.some(({ type }) => type === 'jour-j');
    const estSamedi = index % 7 === INDEX_SAMEDI;
    const numero = String(jour).padStart(2, '0');

    const fond = horsMois
        ? 'bg-blush/30 text-sage/50'
        : estAujourdHui
          ? 'bg-ivory/30'
          : estJourJ
            ? 'bg-ivory/15'
            : estSamedi
              ? 'bg-ivory/20 hover:bg-ivory/40'
              : 'hover:bg-ivory/40';

    return (
        <div
            className={`flex min-h-[140px] flex-col p-2 transition-colors ${fond} ${
                index % 7 === 6 ? '' : 'border-r'
            } ${derniereLigne ? '' : 'border-b'} border-hairline`}
        >
            <div className="flex items-center justify-between">
                {estAujourdHui ? (
                    <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-display text-body-sm text-white">
                            {jour}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-sage">
                            Aujourd’hui
                        </span>
                    </div>
                ) : (
                    <span
                        className={
                            horsMois
                                ? 'font-display text-[13px]'
                                : `font-display text-ink ${
                                      estJourJ
                                          ? 'text-title-sm font-semibold'
                                          : `text-body ${estSamedi ? 'font-semibold' : ''}`
                                  }`
                        }
                    >
                        {numero}
                        {horsMois && jour === 1 && ` ${new Date(annee, mois - 1, 1).toLocaleDateString('fr-FR', { month: 'short' })}`}
                    </span>
                )}

                {estJourJ && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-blush" />
                        Jour J
                    </span>
                )}

                {!estJourJ && donnees?.etiquette && (
                    <span
                        className={`text-[9px] uppercase ${
                            donnees.alerte ? 'text-warning' : 'text-sage'
                        }`}
                    >
                        {donnees.etiquette}
                    </span>
                )}
            </div>

            {!horsMois && (
                <button
                    type="button"
                    aria-label={`Ajouter un jalon le ${jour}/${mois}/${annee}`}
                    onClick={() => onAjouter(`${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`)}
                    className={`${anneauFocus} mt-1 self-start rounded px-1 text-[10px] text-sage hover:bg-ivory hover:text-ink`}
                >
                    + Ajouter
                </button>
            )}

            {evenements.length > 0 && (
                <div className="mt-1.5 space-y-1">
                    {evenements.map((evenement, position) => (
                        <Evenement
                            key={position}
                            evenement={evenement}
                            onOuvrir={onOuvrir}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GrilleMensuelle({ annee, mois, jours, onOuvrir, onAjouter }) {
    const cases = construireCases(annee, mois);

    return (
        <div className="overflow-x-auto rounded-lg border border-hairline bg-white shadow-sm">
            <div className="min-w-[860px]">
                <div className="grid grid-cols-7 border-b border-hairline bg-ivory">
                    {JOURS_SEMAINE.map((jour, index) => (
                        <div
                            key={jour}
                            className={`py-2.5 text-center text-caps uppercase tracking-wider ${
                                index === INDEX_SAMEDI ? 'text-ink' : 'text-sage'
                            } ${index === 6 ? '' : 'border-r border-hairline'}`}
                        >
                            {jour}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 bg-white">
                    {cases.map((caseJour, index) => (
                        <Case
                            key={index}
                            {...caseJour}
                            index={index}
                            derniereLigne={index >= cases.length - 7}
                            jours={jours}
                            onOuvrir={onOuvrir}
                            onAjouter={onAjouter}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
