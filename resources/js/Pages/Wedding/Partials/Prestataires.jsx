import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import {formaterEuros} from "@/formats.js";

/**
 * Fil de prestataire qui se trouvera sur la page marriage
 *
 * Les données sont par défaults en attendant les données du client
 */

const PRESTATAIRES_PAR_DEFAUT = [
    {
        id: 1,
        categorie: 'Photographe',
        nom: 'Studio Ali & Lumière',
        contact: 'Camille de Saint-Victor',
        detail: 'Couverture 12h — argentique',
        statut: 'confirmé',
        image: null,
    },
    {
        id: 2,
        categorie: 'Traiteur & vins',
        nom: 'Maison Marceau',
        contact: 'Gastronomie',
        detail: 'Chef local — Les-Baux-de-Provence',
        statut: 'confirmé',
        image: null,
    },
    {
        id: 3,
        categorie: 'Scénographie florale',
        nom: "L’Atelier Botanique d’Aix",
        contact: 'Margot Vialin',
        detail: 'Arche légère & suspensions panoramiques',
        statut: 'confirmé',
        image: null,
    },
    {
        id: 4,
        categorie: 'Musique & sonorisation',
        nom: 'Symphonie & Nuit Paris',
        contact: "Julien ‘Jules’ Morel",
        detail: 'Set vinyles cocktail + performance live',
        statut: 'confirmé',
        image: null,
    },
];

function MicroTitre({ children }) {
    return (
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">
            {children}
        </p>
    );
}

function Prestataire({prestataire}){
    return (
        <article className="flex min-w-0 gap-2 rounded-lg bg-ivory p-2">
            {prestataire.image ? (
                <img
                    src={prestataire.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                />
            ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blush text-sage">
                    <Icone nom="storefront" className="text-[18px]" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <MicroTitre>{prestataire.categorie || prestataire.category}</MicroTitre>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                </div>
                <h3 className="truncate text-[10px] font-semibold text-ink">
                    {prestataire.nom || prestataire.name}
                </h3>
                <p className="truncate text-[9px] text-sage">
                    {prestataire.contact || prestataire.contact_name}
                </p>
                <p className="line-clamp-2 text-[9px] leading-4 text-sage">
                    {prestataire.detail || prestataire.description}
                </p>
            </div>
        </article>
    );
}

export default function Prestataires(){
    return (
        <>
            <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <div>
                        <span className="text-caps uppercase text-sage">
                            Temps réel
                        </span>
                        <h2 className="font-display text-title-sm text-ink">
                            Prestations récentes
                        </h2>
                    </div>
                    <Icone nom="history" className="text-[18px] text-sage" />
                </div>

                <div className="relative mt-4">
                    <div className="absolute bottom-2 left-3.5 top-2 w-px bg-hairline" />
                    <div className="space-y-4 text-body-sm">
                        {PRESTATAIRES_PAR_DEFAUT.map((prestataire) => (
                            <Prestataire key={prestataire.nom} prestataires={prestataire} />
                        ))}
                    </div>
                </div>
            </section>

        </>
    );
}
