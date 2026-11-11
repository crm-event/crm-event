import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ApercuQuinzaine from '@/Pages/Calendrier/Partials/ApercuQuinzaine';
import EnteteCalendrier, { CommandesCalendrier } from '@/Pages/Calendrier/Partials/EnteteCalendrier';
import FormulaireJalon from '@/Pages/Calendrier/Partials/FormulaireJalon';
import GrilleMensuelle from '@/Pages/Calendrier/Partials/GrilleMensuelle';
import MetriquesMois from '@/Pages/Calendrier/Partials/MetriquesMois';
import TiroirFiche from '@/Pages/Calendrier/Partials/TiroirFiche';
import VueChronologique from '@/Pages/Calendrier/Partials/VueChronologique';
import VueSemaine from '@/Pages/Calendrier/Partials/VueSemaine';
import { lireJalonsEnregistres } from '@/Pages/Calendrier/stockage';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function construireFiche(evenement) {
    const date = new Date(`${evenement.date}T12:00:00`).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const titre = evenement.titre ?? evenement.couple ?? evenement.libelle ?? evenement.categorie;

    return {
        badge: evenement.type === 'jour-j' ? 'Mariage confirmé' : evenement.type === 'rdv' ? 'Rendez-vous' : evenement.statut === 'en-attente' ? 'Date souhaitée' : 'Événement du calendrier',
        titre,
        sousTitre: date,
        lieu: evenement.lieu ?? 'Lieu à préciser',
        adresse: evenement.notes ?? 'Aucune note complémentaire.',
        chiffres: [
            { libelle: 'Horaire', valeur: evenement.heure ?? 'À définir', note: 'Heure locale' },
            { libelle: 'Catégorie', valeur: evenement.type === 'jour-j' ? 'Mariage' : evenement.type === 'rdv' ? 'Rendez-vous' : 'Jalon', note: 'Planning opérationnel' },
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

function lireDateNavigation() {
    if (typeof window === 'undefined') {
        return null;
    }

    const valeur = new URLSearchParams(window.location.search).get('date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur ?? '')) {
        return null;
    }

    const date = new Date(`${valeur}T12:00:00`);
    return !Number.isNaN(date.getTime()) && formaterDate(date) === valeur ? date : null;
}

function donneesEvenement(evenement, type) {
    return {
        type,
        title: evenement.titre,
        event_date: evenement.date,
        event_time: evenement.heure || null,
        location: evenement.lieu || null,
        notes: evenement.notes || null,
    };
}

export default function Calendrier({ evenementsTous, importedIds }) {
    const positionDefilement = useRef(null);
    const [dateActive, setDateActive] = useState(
        () => lireDateNavigation() ?? new Date(),
    );
    const [vue, setVue] = useState('Mois');
    const [evenementSelectionne, setEvenementSelectionne] = useState(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        const id = new URLSearchParams(window.location.search).get('event');
        return id ? evenementsTous.find((evenement) => evenement.id === id) ?? null : null;
    });
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [dateAjout, setDateAjout] = useState(null);
    const [typeAjout, setTypeAjout] = useState('jalon');
    const [evenementEnEdition, setEvenementEnEdition] = useState(null);
    const [jalonsLocaux] = useState(lireJalonsEnregistres);
    const [enCours, setEnCours] = useState(false);
    const [erreur, setErreur] = useState(null);
    const aImporter = jalonsLocaux.filter((jalon) => !importedIds.includes(jalon.id));

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
    const annees = [...new Set([annee, annee + 1, ...evenementsTous.map((evenement) => Number(evenement.date.slice(0, 4)))])].sort((a, b) => a - b);
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
        setTypeAjout('jalon');
        setDateAjout(date);
        setErreur(null);
        setFormulaireOuvert(true);
    }, []);

    const ouvrirAjoutMariage = useCallback(() => {
        setEvenementEnEdition(null);
        setTypeAjout('jour-j');
        setDateAjout(null);
        setErreur(null);
        setFormulaireOuvert(true);
    }, []);

    const ouvrirEdition = useCallback(() => {
        setEvenementEnEdition(evenementSelectionne);
        setEvenementSelectionne(null);
        setErreur(null);
        setFormulaireOuvert(true);
    }, [evenementSelectionne]);

    const optionsEnregistrement = (onSuccess) => {
        setEnCours(true);
        setErreur(null);
        return {
            preserveScroll: true,
            onSuccess,
            onError: (errors) => setErreur(Object.values(errors)[0]),
            onFinish: () => setEnCours(false),
        };
    };

    const supprimerEvenement = () => {
        if (!evenementSelectionne?.editableId || enCours) {
            return;
        }
        router.delete(
            route('calendrier.events.destroy', evenementSelectionne.editableId),
            optionsEnregistrement(() => setEvenementSelectionne(null)),
        );
    };

    const enregistrerJalon = (donnees) => {
        if (enCours) {
            return;
        }
        const payload = donneesEvenement(donnees, evenementEnEdition?.type ?? typeAjout);
        const options = optionsEnregistrement(() => {
            setEvenementEnEdition(null);
            setFormulaireOuvert(false);
        });
        if (evenementEnEdition) {
            router.patch(route('calendrier.events.update', evenementEnEdition.editableId), payload, options);
        } else {
            router.post(route('calendrier.events.store'), payload, options);
        }
    };

    const importerJalons = () => {
        const events = aImporter.slice(0, 500).map((jalon) => ({
            ...donneesEvenement(jalon, jalon.type ?? 'jalon'),
            legacy_id: jalon.id,
        }));
        router.post(route('calendrier.import'), { events }, optionsEnregistrement());
    };

    const dateParDefaut = dateAjout ?? formaterDate(dateActive);
    const fiche = evenementSelectionne ? construireFiche(evenementSelectionne) : null;

    return (
        <BackOfficeLayout actif="calendrier" filAriane="Planning Opérationnel">
            <Head title="Calendrier" />

            <div className="w-full" style={{ overflowAnchor: 'none' }}>
                <EnteteCalendrier
                    annee={annee}
                />
                {erreur && !formulaireOuvert && <p role="alert" className="mb-4 text-body text-warning">{erreur}</p>}
                {aImporter.length > 0 && (
                    <button type="button" disabled={enCours} onClick={importerJalons} className="mb-4 rounded-lg border border-hairline bg-white px-4 py-2 text-label disabled:opacity-50">
                        Importer les événements de ce navigateur ({aImporter.length})
                    </button>
                )}
                <MetriquesMois
                    evenements={evenements}
                    annee={annee}
                    mois={mois}
                    jourRepere={dateActive.getDate()}
                />
                <CommandesCalendrier
                    annees={annees}
                    annee={annee}
                    mois={mois}
                    vue={vue}
                    onAnneeChange={changerAnnee}
                    onMoisChange={changerMois}
                    onVueChange={changerVue}
                    onAjouterJalon={() => ouvrirAjout()}
                    onAjouterMariage={ouvrirAjoutMariage}
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
                onModifier={evenementSelectionne?.editableId ? ouvrirEdition : undefined}
                onSupprimer={evenementSelectionne?.editableId ? supprimerEvenement : undefined}
                enCours={enCours}
                erreur={erreur}
            />
            <FormulaireJalon
                ouvert={formulaireOuvert}
                dateParDefaut={dateParDefaut}
                evenement={evenementEnEdition}
                typeAjout={typeAjout}
                onFermer={() => setFormulaireOuvert(false)}
                onEnregistrer={enregistrerJalon}
                enCours={enCours}
                erreur={erreur}
            />
        </BackOfficeLayout>
    );
}
