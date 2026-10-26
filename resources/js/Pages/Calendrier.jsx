import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ApercuQuinzaine from '@/Pages/Calendrier/Partials/ApercuQuinzaine';
import EnteteCalendrier from '@/Pages/Calendrier/Partials/EnteteCalendrier';
import FormulaireJalon from '@/Pages/Calendrier/Partials/FormulaireJalon';
import GrilleMensuelle from '@/Pages/Calendrier/Partials/GrilleMensuelle';
import MetriquesMois from '@/Pages/Calendrier/Partials/MetriquesMois';
import TiroirFiche from '@/Pages/Calendrier/Partials/TiroirFiche';
import VueChronologique from '@/Pages/Calendrier/Partials/VueChronologique';
import VueSemaine from '@/Pages/Calendrier/Partials/VueSemaine';
import { ANNEE, AUJOURD_HUI, EVENEMENTS, FICHES, MOIS } from '@/Pages/Calendrier/donnees';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const CLE_STOCKAGE = 'crm-event.calendrier.jalons.v1';

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

function construireFiche(evenement) {
    if (FICHES[evenement.detail]) {
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
        badge: evenement.type === 'rdv' ? 'Rendez-vous' : 'Jalon opérationnel',
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
    const [dateActive, setDateActive] = useState(
        () => new Date(ANNEE, MOIS - 1, AUJOURD_HUI),
    );
    const [vue, setVue] = useState('Mois');
    const [fiche, setFiche] = useState(null);
    const [jalonOuvert, setJalonOuvert] = useState(false);
    const [jalonsEnregistres, setJalonsEnregistres] = useState(() =>
        typeof window === 'undefined' ? [] : lireJalonsEnregistres(),
    );

    const annee = dateActive.getFullYear();
    const mois = dateActive.getMonth() + 1;
    const evenementsTous = useMemo(
        () => [...EVENEMENTS, ...jalonsEnregistres],
        [jalonsEnregistres],
    );

    useEffect(() => {
        try {
            window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(jalonsEnregistres));
        } catch {
            // Le jalon reste visible jusqu'au prochain rechargement si le stockage est indisponible.
        }
    }, [jalonsEnregistres]);

    const evenements = useMemo(
        () =>
            [...EVENEMENTS, ...jalonsEnregistres]
                .filter((evenement) => {
                    const date = new Date(`${evenement.date}T12:00:00`);
                    return date.getFullYear() === annee && date.getMonth() + 1 === mois;
                })
                .sort((a, b) => a.date.localeCompare(b.date)),
        [annee, jalonsEnregistres, mois],
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
        setDateActive((date) => new Date(date.getFullYear(), date.getMonth() + delta, 1));
    }, []);

    const changerAnnee = useCallback((nouvelleAnnee) => {
        setDateActive((date) => new Date(nouvelleAnnee, date.getMonth(), 1));
    }, []);

    const changerSemaine = useCallback((delta) => {
        setDateActive((date) => {
            const nouvelleDate = new Date(date);
            nouvelleDate.setDate(nouvelleDate.getDate() + delta * 7);
            return nouvelleDate;
        });
    }, []);

    const ouvrirFiche = useCallback((evenement) => {
        setFiche(construireFiche(evenement));
    }, []);

    const enregistrerJalon = useCallback((donnees) => {
        const id = `jalon-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
        setJalonsEnregistres((actuels) => [
            ...actuels,
            { ...donnees, id, detail: id, type: 'jalon', custom: true },
        ]);
        setJalonOuvert(false);
    }, []);

    const dateParDefaut = formaterDate(dateActive);

    return (
        <BackOfficeLayout actif="calendrier" filAriane="Planning Opérationnel">
            <Head title="Calendrier" />

            <div className="w-full">
                <EnteteCalendrier
                    annee={annee}
                    mois={mois}
                    vue={vue}
                    onAnneeChange={changerAnnee}
                    onMoisChange={changerMois}
                    onVueChange={setVue}
                    onAjouterJalon={() => setJalonOuvert(true)}
                />
                <MetriquesMois
                    evenements={evenements}
                    annee={annee}
                    mois={mois}
                    jourRepere={dateActive.getDate()}
                />
                {vue === 'Mois' && (
                    <GrilleMensuelle
                        annee={annee}
                        mois={mois}
                        jours={jours}
                        onOuvrir={ouvrirFiche}
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
                    />
                )}
                {vue === 'Liste chronologique' && (
                    <VueChronologique evenements={evenements} onOuvrir={ouvrirFiche} />
                )}
                <ApercuQuinzaine evenements={evenements} />
            </div>

            <TiroirFiche
                fiche={fiche}
                ouvert={Boolean(fiche)}
                onFermer={() => setFiche(null)}
            />
            <FormulaireJalon
                ouvert={jalonOuvert}
                dateParDefaut={dateParDefaut}
                onFermer={() => setJalonOuvert(false)}
                onEnregistrer={enregistrerJalon}
            />
        </BackOfficeLayout>
    );
}
