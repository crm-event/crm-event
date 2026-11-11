
import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { secondaryButton } from '@/brand';

import SelectionHeader from './Partials/SelectionHeader';
import CoupleFile from './Partials/CoupleFile';

export default function WeddingSelection({ weddings = [] }) {
    const [search, setSearch] = useState('');

    // Filtrage des mariages
    const filteredWeddings = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) return weddings;

        return weddings.filter((wedding) => {
            const couple = wedding.couple;

            const coupleName = [
                couple?.partner1_first_name,
                couple?.partner1_last_name,
                couple?.partner2_first_name,
                couple?.partner2_last_name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const city = (couple?.city ?? '').toLowerCase();

            return (
                coupleName.includes(normalizedSearch) ||
                city.includes(normalizedSearch) ||
                String(wedding.id).includes(normalizedSearch)
            );
        });
    }, [weddings, search]);

    // Nombre total de mariages
    const weddingCount = useMemo(() => weddings.length, [weddings]);

    return (
        <BackOfficeLayout>
            <Head title="Sélection d'un mariage" />

            <main className="min-h-screen bg-ivory px-6 py-10 text-ink md:px-12">
                <div className="mx-auto max-w-7xl">

                    {/* En-tête */}
                    <SelectionHeader
                        title="Vos mariages"
                        description="Retrouvez les dossiers de vos couples et accédez à leur espace de gestion."
                        count={weddingCount}
                    />

                    {/* Recherche et réinitialisation */}
                    <div className="mt-8 mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        {/* Barre de recherche */}
                        <div className="w-full sm:max-w-md">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Rechercher un couple, une ville..."
                                className={`w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm ${anneauFocus}`}
                            />
                        </div>

                        {/* Bouton de réinitialisation */}
                        <div className="flex justify-start sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className={`${secondaryButton} ${anneauFocus}`}
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Nombre de dossiers affichés */}
                    {filteredWeddings.length > 0 ? (
                        <>
                            <p className="mb-6 mt-8 text-sm text-ink/50">
                                {filteredWeddings.length} dossier(s) affiché(s)
                            </p>

                            {/* Liste des mariages */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredWeddings.map((wedding) => (
                                    <CoupleFile
                                        key={wedding.id}
                                        wedding={wedding}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="mt-8 rounded-lg border border-hairline bg-white px-6 py-16 text-center">
                            <h2 className="font-display text-2xl">
                                {search
                                    ? 'Aucun résultat'
                                    : 'Aucun mariage pour le moment'}
                            </h2>

                            <p className="mt-3 text-sm text-ink/50">
                                {search
                                    ? 'Aucun dossier ne correspond à votre recherche.'
                                    : 'Les dossiers de vos couples apparaîtront ici.'}
                            </p>
                        </div>
                    )}

                </div>
            </main>
        </BackOfficeLayout>
    );
}
