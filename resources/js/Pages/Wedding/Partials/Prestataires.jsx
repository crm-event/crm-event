
import Icone from '@/Components/Icone';

function MicroTitre({ children }) {
    return (
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">
            {children}
        </p>
    );
}

export default function Prestataires({ prestataire }) {
    if (!prestataire) return null;

    const nom = prestataire.name || 'Prestataire sans nom';

    const contact = prestataire.contact_name || 'Contact non renseigné';

    const categorie =
        prestataire.category?.name ||
        `Catégorie #${prestataire.vendor_category_id}`;

    // Notes propres à l'association entre le mariage et le prestataire
    const notesMariage = prestataire.pivot?.notes;

    // Notes générales du prestataire
    const notes = prestataire.notes;

    return (
        <article className="flex min-w-0 gap-2 rounded-lg bg-ivory p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blush text-sage">
                <Icone nom="storefront" className="text-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <MicroTitre>{categorie}</MicroTitre>

                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                </div>

                <h3 className="truncate text-[10px] font-semibold text-ink">
                    {nom}
                </h3>

                <p className="truncate text-[9px] text-sage">
                    {contact}
                </p>

                {prestataire.email && (
                    <p className="truncate text-[9px] text-sage">
                        {prestataire.email}
                    </p>
                )}

                {prestataire.phone && (
                    <p className="truncate text-[9px] text-sage">
                        {prestataire.phone}
                    </p>
                )}

                {prestataire.website && (
                    <a
                        href={prestataire.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[9px] text-sage underline"
                    >
                        Voir le site internet
                    </a>
                )}

                {(notesMariage || notes) && (
                    <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-sage">
                        {notesMariage || notes}
                    </p>
                )}
            </div>
        </article>
    );
}
