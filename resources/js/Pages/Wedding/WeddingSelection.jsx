import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus, boutonSecondaire } from '@/charte';
import SelectionHeader from '@/Partials/SelectionHeader';
import CoupleFile from '@/Partials/CoupleFile';

export default function Selection({ weddings = [] }) {
    const [recherche, setRecherche] = useState('');

    const couplesFiltres = useMemo(() => {
        const terme = recherche.trim().toLocaleLowerCase('fr');
        if (!terme) return weddings;

        return weddings.filter((wedding) => {
            const nom = nomDuCouple(wedding);
            const lieu = wedding.venue_name || wedding.location || '';
            return `${nom} ${lieu}`.toLocaleLowerCase('fr').includes(terme);
        });
    }, [weddings, recherche]);

    return (
        <BackOfficeLayout actif="mariages" filAriane="Sélection d’un mariage">
            <Head title="Sélectionner un couple" />
            <main className="mx-auto max-w-[1500px] space-y-7">
                <SelectionHeader nombre={weddings.length} />

                <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-caps uppercase tracking-brand text-sage">Espace de gestion</p>
                            <h2 className="mt-1 font-display text-title-md text-ink">Vos dossiers de mariage</h2>
                            <p className="mt-1 text-body-sm text-sage">Sélectionnez un dossier pour accéder à son espace de suivi.</p>
                        </div>
                        <label className="block w-full sm:max-w-xs">
                            <span className="sr-only">Rechercher un couple</span>
                            <input
                                type="search"
                                value={recherche}
                                onChange={(event) => setRecherche(event.target.value)}
                                placeholder="Rechercher un couple ou un lieu..."
                                className={`${anneauFocus} w-full rounded-full border-hairline bg-ivory px-4 py-2.5 text-body-sm text-ink placeholder:text-sage/70 focus:border-sage focus:ring-0`}
                            />
                        </label>
                    </div>

                    {couplesFiltres.length ? (
                        <div className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                            {couplesFiltres.map((wedding) => <CoupleFile key={wedding.id} wedding={wedding} />)}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-xl border border-dashed border-subtle bg-ivory px-5 py-12 text-center">
                            <p className="font-display text-title-sm text-ink">
                                {weddings.length ? 'Aucun couple trouvé' : 'Aucun dossier pour le moment'}
                            </p>
                            <p className="mt-2 text-body-sm text-sage">
                                {weddings.length ? 'Essayez avec un autre nom ou un autre lieu.' : 'Les dossiers de mariage apparaîtront ici dès leur création.'}
                            </p>
                            {recherche && (
                                <button type="button" onClick={() => setRecherche('')}
                                        className={`${boutonSecondaire} mt-4 !px-4 !py-2 !text-[10px]`}>
                                    Effacer la recherche
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </BackOfficeLayout>
    );
}

function nomDuCouple(wedding) {
    if (wedding.couple_name) return wedding.couple_name;
    if (wedding.title) return wedding.title;
    const noms = [wedding.partner_one_name, wedding.partner_two_name].filter(Boolean);
    return noms.length ? noms.join(' & ') : wedding.name || `Dossier mariage #${wedding.id}`;
}
