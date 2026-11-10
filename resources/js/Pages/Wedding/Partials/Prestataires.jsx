
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

    const nom = prestataire.nom || prestataire.name || 'Prestataire sans nom';

    const statut = prestataire.statut || prestataire.status || 'À définir';

    const confirme = statut.toLowerCase() === 'confirmé';

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
                    <Icone
                        nom="storefront"
                        className="text-[18px]"
                    />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <MicroTitre>
                        {prestataire.categorie || prestataire.category || 'Catégorie non renseignée'}
                    </MicroTitre>

                    <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            confirme ? 'bg-success' : 'bg-warning'
                        }`}
                    />
                </div>

                <h3 className="truncate text-[10px] font-semibold text-ink">
                    {nom}
                </h3>

                <p className="truncate text-[9px] text-sage">
                    {prestataire.contact || prestataire.contact_name || 'Contact non renseigné'}
                </p>

                <p className="line-clamp-2 text-[9px] leading-4 text-sage">
                    {prestataire.detail || prestataire.description || ''}
                </p>
            </div>
        </article>
    );
}
