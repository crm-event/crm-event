import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ApercuQuinzaine from '@/Pages/Calendrier/Partials/ApercuQuinzaine';
import EnteteCalendrier, { CommandesCalendrier } from '@/Pages/Calendrier/Partials/EnteteCalendrier';
import FormulaireJalon from '@/Pages/Calendrier/Partials/FormulaireJalon';
import GrilleMensuelle from '@/Pages/Calendrier/Partials/GrilleMensuelle';
import MetriquesMois from '@/Pages/Calendrier/Partials/MetriquesMois';
import TiroirFiche from '@/Pages/Calendrier/Partials/TiroirFiche';
import VueChronologique from '@/Pages/Calendrier/Partials/VueChronologique';
import VueSemaine from '@/Pages/Calendrier/Partials/VueSemaine';
import { ANNEE, AUJOURD_HUI, EVENEMENTS, FICHES, MOIS } from '@/Pages/Calendrier/donnees';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const CLE_STOCKAGE = 'crm-event.calendrier.jalons.v1';
const CLE_MODIFICATIONS = 'crm-event.calendrier.modifications.v1';
const CLE_SUPPRESSIONS = 'crm-event.calendrier.suppressions.v1';

function lireJalonsEnregistres() {
    try {
        const jalons = JSON.parse(window.localStorage.getItem(CLE_STOCKAGE) ?? '[]');
        return Array.isArray(jalons)
            ? jalons.filter((jalon) => jalon?.id && jalon?.date && jalon?.titre)
            : [];
    } catch {
        return [];
    }
}

function lireModifications() {
    try {
        const modifications = JSON.parse(window.localStorage.getItem(CLE_MODIFICATIONS) ?? '{}');
        return modifications && typeof modifications === 'object' && !Array.isArray(modifications)
            ? modifications
            : {};
    } catch {
        return {};
    }
}

function lireSuppressions() {
    try {
        const suppressions = JSON.parse(window.localStorage.getItem(CLE_SUPPRESSIONS) ?? '[]');
        return Array.isArray(suppressions)
            ? suppressions.filter((id) => typeof id === 'string')
            : [];
    } catch {
        return [];
    }
}

function construireFiche(evenement) {
    if (!evenement.modifie && FICHES[evenement.detail]) {
        return FICHES[evenement.detail];
    }

    const date = new Date(`${evenement.date}T12:00:00`).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const titre = evenement.titre ?? evenement.libelle ?? evenement.categorie;

    return {
        badge: evenement.type === 'jour-j' ? 'Mariage confirmé' : evenement.type === 'rdv' ? 'Rendez-vous' : 'Événement du calendrier',
        titre,
        sousTitre: date,
        lieu: evenement.lieu ?? 'Lieu à préciser',
        adresse: evenement.notes ?? 'Aucune note complémentaire.',
        chiffres: [
            { libelle: 'Horaire', valeur: evenement.heure ?? 'À définir', note: 'Heure locale' },
            { libelle: 'Catégorie', valeur: evenement.type === 'rdv' ? 'Rendez-vous' : 'Jalon', note: 'Planning opérationnel' },
        ],
        deroule: [
            {
                heure: evenement.heure ?? '—',
                titre,
                description: evenement.notes ?? 'Aucun détail renseigné.',
            },
        ],
    };
}

function formaterDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function Calendrier() {
    const positionDefilement = useRef(null);
    const [dateActive, setDateActive] = useState(
        () => new Date(ANNEE, MOIS - 1, AUJOURD_HUI),
    );
    const [vue, setVue] = useState('Mois');
    const [evenementSelectionne, setEvenementSelectionne] = useState(null);
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [dateAjout, setDateAjout] = useState(null);
    const [evenementEnEdition, setEvenementEnEdition] = useState(null);
    const [jalonsEnregistres, setJalonsEnregistres] = useState(() =>
        typeof window === 'undefined' ? [] : lireJalonsEnregistres(),
    );
    const [modifications, setModifications] = useState(() =>
        typeof window === 'undefined' ? {} : lireModifications(),
    );
    const [suppressions, setSuppressions] = useState(() =>
        typeof window === 'undefined' ? [] : lireSuppressions(),
    );

    useEffect(() => {
        const gouttiereInitiale = document.documentElement.style.scrollbarGutter;
        document.documentElement.style.scrollbarGutter = 'stable';

        return () => {
            document.documentElement.style.scrollbarGutter = gouttiereInitiale;
        };
    }, []);

    useLayoutEffect(() => {
        if (positionDefilement.current !== null) {
            window.scrollTo(0, positionDefilement.current);
            positionDefilement.current = null;
        }
    }, [dateActive, vue]);

    const memoriserDefilement = useCallback(() => {
        positionDefilement.current = window.scrollY;
    }, []);

    const annee = dateActive.getFullYear();
    const mois = dateActive.getMonth() + 1;
    const evenementsTous = useMemo(
        () => [...EVENEMENTS.map((evenement) => modifications[evenement.id]
            ? { ...evenement, ...modifications[evenement.id], modifie: true }
            : evenement), ...jalonsEnregistres].filter((evenement) => !suppressions.includes(evenement.id)),
        [jalonsEnregistres, modifications, suppressions],
    );

    useEffect(() => {
        try {
            window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(jalonsEnregistres));
        } catch {
            // Le jalon reste visible jusqu'au prochain rechargement si le stockage est indisponible.
        }
    }, [jalonsEnregistres]);

    useEffect(() => {
        try {
            window.localStorage.setItem(CLE_MODIFICATIONS, JSON.stringify(modifications));
        } catch {
            // Les modifications restent visibles jusqu'au prochain rechargement si le stockage est indisponible.
        }
    }, [modifications]);

    useEffect(() => {
        try {
            window.localStorage.setItem(CLE_SUPPRESSIONS, JSON.stringify(suppressions));
        } catch {
            // Les suppressions restent visibles jusqu'au prochain rechargement si le stockage est indisponible.
        }
    }, [suppressions]);

    const evenements = useMemo(
        () =>
            evenementsTous
                .filter((evenement) => {
                    const date = new Date(`${evenement.date}T12:00:00`);
                    return date.getFullYear() === annee && date.getMonth() + 1 === mois;
                })
                .sort((a, b) => a.date.localeCompare(b.date)),
        [annee, evenementsTous, mois],
    );

    const jours = useMemo(
        () =>
            evenements.reduce((resultat, evenement) => {
                const jour = Number(evenement.date.slice(-2));
                if (!resultat[jour]) {
                    resultat[jour] = { evenements: [] };
                }
                resultat[jour].evenements.push(evenement);
                if (evenement.etiquette && !resultat[jour].etiquette) {
                    resultat[jour].etiquette = evenement.etiquette;
                }
                if (evenement.alerte) {
                    resultat[jour].alerte = true;
                }
                return resultat;
            }, {}),
        [evenements],
    );

    const changerMois = useCallback((delta) => {
        memoriserDefilement();
        setDateActive((date) => new Date(date.getFullYear(), date.getMonth() + delta, 1));
    }, [memoriserDefilement]);

    const changerAnnee = useCallback((nouvelleAnnee) => {
        memoriserDefilement();
        setDateActive((date) => new Date(nouvelleAnnee, date.getMonth(), 1));
    }, [memoriserDefilement]);

    const changerSemaine = useCallback((delta) => {
        memoriserDefilement();
        setDateActive((date) => {
            const nouvelleDate = new Date(date);
            nouvelleDate.setDate(nouvelleDate.getDate() + delta * 7);
            return nouvelleDate;
        });
    }, [memoriserDefilement]);

    const changerVue = useCallback((nouvelleVue) => {
        memoriserDefilement();
        setVue(nouvelleVue);
    }, [memoriserDefilement]);

    const allerAujourdHui = useCallback(() => {
        memoriserDefilement();
        setDateActive(new Date());
    }, [memoriserDefilement]);

    const ouvrirFiche = useCallback((evenement) => {
        setEvenementSelectionne(evenement);
    }, []);

    const ouvrirAjout = useCallback((date = null) => {
        setEvenementEnEdition(null);
        setDateAjout(date);
        setFormulaireOuvert(true);
    }, []);

    const ouvrirEdition = useCallback(() => {
        setEvenementEnEdition(evenementSelectionne);
        setEvenementSelectionne(null);
        setFormulaireOuvert(true);
    }, [evenementSelectionne]);

    const supprimerEvenement = useCallback(() => {
        if (!evenementSelectionne) {
            return;
        }

        const { id, custom } = evenementSelectionne;
        if (custom) {
            setJalonsEnregistres((actuels) => actuels.filter((jalon) => jalon.id !== id));
        } else {
            setSuppressions((actuelles) => actuelles.includes(id) ? actuelles : [...actuelles, id]);
            setModifications((actuelles) => {
                const prochaines = { ...actuelles };
                delete prochaines[id];
                return prochaines;
            });
        }
        setEvenementSelectionne(null);
    }, [evenementSelectionne]);

    const enregistrerJalon = useCallback((donnees) => {
        if (evenementEnEdition) {
            if (evenementEnEdition.custom) {
                setJalonsEnregistres((actuels) => actuels.map((jalon) => jalon.id === evenementEnEdition.id
                    ? { ...jalon, ...donnees }
                    : jalon));
            } else {
                setModifications((actuelles) => ({
                    ...actuelles,
                    [evenementEnEdition.id]: donnees,
                }));
            }
            setEvenementEnEdition(null);
            setFormulaireOuvert(false);
            return;
        }
        const id = `jalon-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
        setJalonsEnregistres((actuels) => [
            ...actuels,
            { ...donnees, id, detail: id, type: 'jalon', custom: true },
        ]);
        setFormulaireOuvert(false);
    }, [evenementEnEdition]);

    const dateParDefaut = dateAjout ?? formaterDate(dateActive);
    const fiche = evenementSelectionne ? construireFiche(evenementSelectionne) : null;

    return (
        <BackOfficeLayout actif="calendrier" filAriane="Planning Opérationnel">
            <Head title="Calendrier" />

            <div className="w-full" style={{ overflowAnchor: 'none' }}>
                <EnteteCalendrier
                    annee={annee}
                />
                <MetriquesMois
                    evenements={evenements}
                    annee={annee}
                    mois={mois}
                    jourRepere={dateActive.getDate()}
                />
                <CommandesCalendrier
                    annee={annee}
                    mois={mois}
                    vue={vue}
                    onAnneeChange={changerAnnee}
                    onMoisChange={changerMois}
                    onVueChange={changerVue}
                    onAjouterJalon={() => ouvrirAjout()}
                    onAujourdHui={allerAujourdHui}
                />
                {vue === 'Mois' && (
                    <GrilleMensuelle
                        annee={annee}
                        mois={mois}
                        jours={jours}
                        onOuvrir={ouvrirFiche}
                        onAjouter={ouvrirAjout}
                    />
                )}
                {vue === 'Semaine' && (
                    <VueSemaine
                        annee={annee}
                        mois={mois}
                        dateRepere={dateActive}
                        evenements={evenementsTous}
                        onSemaineChange={changerSemaine}
                        onOuvrir={ouvrirFiche}
                        onAjouter={ouvrirAjout}
                    />
                )}
                {vue === 'Liste chronologique' && (
                    <VueChronologique evenements={evenements} onOuvrir={ouvrirFiche} />
                )}
                <ApercuQuinzaine evenements={evenements} />
            </div>

            <TiroirFiche
                fiche={fiche}
                ouvert={Boolean(evenementSelectionne)}
                onFermer={() => setEvenementSelectionne(null)}
                onModifier={ouvrirEdition}
                onSupprimer={supprimerEvenement}
            />
            <FormulaireJalon
                ouvert={formulaireOuvert}
                dateParDefaut={dateParDefaut}
                evenement={evenementEnEdition}
                onFermer={() => setFormulaireOuvert(false)}
                onEnregistrer={enregistrerJalon}
            />
        </BackOfficeLayout>
    );
}
