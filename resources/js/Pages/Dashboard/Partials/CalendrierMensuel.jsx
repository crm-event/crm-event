import Icone from '@/Components/Icone';
import { construireCases, nomDuMois } from '@/calendrier';
import { anneauFocus } from '@/charte';
import { EVENEMENTS } from '@/Pages/Calendrier/donnees';
import {
    CLE_MODIFICATIONS,
    CLE_STOCKAGE,
    CLE_SUPPRESSIONS,
    lireEvenementsCalendrier,
} from '@/Pages/Calendrier/stockage';
import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const INDEX_SAMEDI = 5;

function urlCalendrier(date, id = null) {
    const parametres = new URLSearchParams({ date });
    if (id) {
        parametres.set('event', id);
    }

    return `${route('calendrier')}?${parametres.toString()}`;
}

function libelleEvenement(evenement) {
    if (evenement.type === 'jour-j') {
        return `Jour J · ${evenement.couple ?? evenement.titre}`;
    }
    if (evenement.statut === 'en-attente') {
        return `Date souhaitée · ${evenement.couple ?? evenement.titre}`;
    }

    return evenement.titre ?? evenement.libelle ?? evenement.couple ?? evenement.categorie ?? 'Événement';
}

function Case({ jour, mois, annee, horsMois, index, derniereLigne, evenements }) {
    const date = `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
    const evenementsDuJour = horsMois ? [] : evenements.filter((evenement) => evenement.date === date);
    const maintenant = new Date();
    const estAujourdHui = !horsMois && jour === maintenant.getDate()
        && mois === maintenant.getMonth() + 1 && annee === maintenant.getFullYear();
    const estSamedi = index % 7 === INDEX_SAMEDI;
    const estMariage = evenementsDuJour.some((evenement) => evenement.type === 'jour-j');

    const fond = estAujourdHui
        ? 'bg-ivory'
        : estMariage
          ? 'bg-cream-light/70'
          : estSamedi
            ? horsMois ? 'bg-ivory/20' : 'bg-ivory/40'
            : '';
    const couleurNumero = horsMois
        ? 'text-subtle'
        : estSamedi ? 'font-medium text-ink' : 'text-sage';

    return (
        <div
            className={`overflow-hidden p-1.5 ${fond} ${index % 7 === 6 ? '' : 'border-r'} ${derniereLigne ? '' : 'border-b'} border-cream`}
        >
            <Link
                href={urlCalendrier(date)}
                aria-label={`Ouvrir le calendrier du ${new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR')}`}
                className={`${anneauFocus} inline-flex rounded hover:underline ${estAujourdHui ? 'w-full items-center justify-between' : couleurNumero}`}
            >
                {estAujourdHui ? (
                    <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink font-display text-[11px] font-medium text-white">
                            {jour}
                        </span>
                        <span className="text-[8px] uppercase text-sage">Aujourd’hui</span>
                    </>
                ) : jour}
            </Link>

            <div className="mt-0.5 space-y-0.5">
                {evenementsDuJour.slice(0, 2).map((evenement) => (
                    <Link
                        key={evenement.id}
                        href={urlCalendrier(date, evenement.id)}
                        title={libelleEvenement(evenement)}
                        className={`${anneauFocus} flex items-center gap-1 rounded p-1 text-[10px] font-medium leading-none transition-opacity hover:opacity-80 ${evenement.type === 'jour-j' ? 'bg-ink text-white' : 'text-sage hover:bg-ivory'}`}
                    >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${evenement.type === 'jour-j' ? 'bg-white' : 'bg-sage'}`} />
                        <span className="truncate">{libelleEvenement(evenement)}</span>
                    </Link>
                ))}
                {evenementsDuJour.length > 2 && (
                    <Link href={urlCalendrier(date)} className={`${anneauFocus} block truncate text-[10px] text-sage hover:underline`}>
                        + {evenementsDuJour.length - 2} autre{evenementsDuJour.length > 3 ? 's' : ''}
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function CalendrierMensuel() {
    const [moisAffiche, setMoisAffiche] = useState(() => {
        const aujourdHui = new Date();
        return new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);
    });
    const [evenementsTous, setEvenementsTous] = useState(() =>
        typeof window === 'undefined' ? EVENEMENTS : lireEvenementsCalendrier(),
    );

    useEffect(() => {
        const actualiserEvenements = (event) => {
            if (!event.key || [CLE_STOCKAGE, CLE_MODIFICATIONS, CLE_SUPPRESSIONS].includes(event.key)) {
                setEvenementsTous(lireEvenementsCalendrier());
            }
        };

        window.addEventListener('storage', actualiserEvenements);
        return () => window.removeEventListener('storage', actualiserEvenements);
    }, []);

    const annee = moisAffiche.getFullYear();
    const mois = moisAffiche.getMonth() + 1;
    const cases = useMemo(() => construireCases(annee, mois), [annee, mois]);
    const evenements = useMemo(() => evenementsTous
        .filter((evenement) => evenement.date?.startsWith(`${annee}-${String(mois).padStart(2, '0')}-`))
        .sort((a, b) => a.date.localeCompare(b.date)), [annee, mois, evenementsTous]);
    const mariages = evenements.filter((evenement) => evenement.type === 'jour-j');
    const autresEvenements = evenements.length - mariages.length;
    const dateDuMois = `${annee}-${String(mois).padStart(2, '0')}-01`;

    const changerMois = (delta) => {
        setMoisAffiche((date) => new Date(date.getFullYear(), date.getMonth() + delta, 1));
    };

    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-hairline pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-title-md text-ink">{nomDuMois(annee, mois)}</h2>
                        <span className="rounded-full border border-subtle bg-ivory px-2 py-0.5 text-[10px] uppercase text-sage">
                            Planning Atelier
                        </span>
                    </div>
                    <p className="mt-0.5 text-body-sm text-sage">
                        {mariages.length} célébration{mariages.length > 1 ? 's' : ''} Jour J • {autresEvenements} autre{autresEvenements > 1 ? 's' : ''} événement{autresEvenements > 1 ? 's' : ''}
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
                            Autre événement
                        </span>
                    </div>
                    <div className="flex items-center overflow-hidden rounded-lg border border-subtle">
                        <button
                            type="button"
                            aria-label="Mois précédent"
                            onClick={() => changerMois(-1)}
                            className={`${anneauFocus} p-1.5 text-sage transition-colors hover:bg-ivory hover:text-ink`}
                        >
                            <Icone nom="chevron_left" className="text-[18px]" />
                        </button>
                        <div className="h-4 w-px bg-subtle" />
                        <button
                            type="button"
                            aria-label="Mois suivant"
                            onClick={() => changerMois(1)}
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
                        <span key={jour} className={`text-caps uppercase ${index === INDEX_SAMEDI ? 'text-ink' : 'text-sage'}`}>
                            {jour}
                        </span>
                    ))}
                </div>

                <div className="grid auto-rows-[88px] grid-cols-7 text-body-sm">
                    {cases.map((caseJour, index) => (
                        <Case
                            key={`${caseJour.annee}-${caseJour.mois}-${caseJour.jour}`}
                            {...caseJour}
                            index={index}
                            derniereLigne={index >= cases.length - 7}
                            evenements={evenements}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3 text-body-sm">
                <div className="flex items-center gap-2 text-sage">
                    <Icone nom="villa" className="text-[16px] text-sage" />
                    <span>
                        {mariages.length
                            ? mariages.slice(0, 2).map((mariage) => `${mariage.lieu ?? 'Lieu à préciser'} (${new Date(`${mariage.date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' })})`).join(' · ')
                            : 'Aucun mariage confirmé ce mois-ci'}
                    </span>
                </div>
                <Link
                    href={urlCalendrier(dateDuMois)}
                    className={`${anneauFocus} inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-ink underline underline-offset-4 transition-colors hover:text-sage`}
                >
                    Voir le calendrier complet
                    <Icone nom="arrow_forward" className="text-[14px]" />
                </Link>
            </div>
        </section>
    );
}
