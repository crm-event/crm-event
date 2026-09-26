import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ApercuQuinzaine from '@/Pages/Calendrier/Partials/ApercuQuinzaine';
import EnteteCalendrier from '@/Pages/Calendrier/Partials/EnteteCalendrier';
import GrilleMensuelle from '@/Pages/Calendrier/Partials/GrilleMensuelle';
import LegendeCalendrier from '@/Pages/Calendrier/Partials/LegendeCalendrier';
import MetriquesMois from '@/Pages/Calendrier/Partials/MetriquesMois';
import TiroirFiche from '@/Pages/Calendrier/Partials/TiroirFiche';
import { FICHES } from '@/Pages/Calendrier/donnees';
import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';

/**
 * Calendrier de la saison de Jessica (maquette Figma « Calendrier »).
 *
 * Les événements et les fiches régie affichés sont ceux de la maquette : ils
 * seront remplacés par les données de la base au fil des prochaines pages.
 */
export default function Calendrier() {
    const [idFiche, setIdFiche] = useState(null);
    const [ficheOuverte, setFicheOuverte] = useState(false);

    const ouvrirFiche = useCallback((id) => {
        setIdFiche(id);
        setFicheOuverte(true);
    }, []);
    const fermerFiche = useCallback(() => setFicheOuverte(false), []);

    return (
        <BackOfficeLayout actif="calendrier" filAriane="Planning Opérationnel">
            <Head title="Calendrier" />

            <div className="w-full">
                <EnteteCalendrier />
                <MetriquesMois />
                <LegendeCalendrier />
                <GrilleMensuelle onOuvrir={ouvrirFiche} />
                <ApercuQuinzaine />
            </div>

            <TiroirFiche
                fiche={FICHES[idFiche]}
                ouvert={ficheOuverte}
                onFermer={fermerFiche}
            />
        </BackOfficeLayout>
    );
}
