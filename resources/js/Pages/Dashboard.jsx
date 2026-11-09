import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ActiviteRecente from '@/Pages/Dashboard/Partials/ActiviteRecente';
import CalendrierMensuel from '@/Pages/Dashboard/Partials/CalendrierMensuel';
import CartesIndicateurs from '@/Pages/Dashboard/Partials/CartesIndicateurs';
import GraphiqueChiffreAffaires from '@/Pages/Dashboard/Partials/GraphiqueChiffreAffaires';
import RappelsPrioritaires from '@/Pages/Dashboard/Partials/RappelsPrioritaires';
import { anneauFocus } from '@/charte';
import { Head, Link, usePage } from '@inertiajs/react';

/**
 * Tableau de bord de Jessica (maquette Figma « Dashboard — La Dernière Touche »).
 *
 * Les indicateurs, événements et montants affichés sont ceux de la maquette :
 * ils seront remplacés par les données de la base au fil des prochaines pages.
 */
export default function Dashboard({ evenementsTous }) {
    const prenom = usePage().props.auth.user.name.split(' ')[0];

    return (
        <BackOfficeLayout actif="dashboard">
            <Head title="Dashboard" />

            <div className="flex w-full flex-col gap-8">
                <header className="flex flex-col justify-between gap-4 pb-2 md:flex-row md:items-end">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                            <span className="text-[10px] uppercase tracking-widest text-sage">
                                Back-Office Direction Artistique
                            </span>
                        </div>
                        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-display">
                            Bonjour {prenom}
                        </h1>
                        <p className="mt-0.5 text-body text-sage">
                            Saison des mariages 2025 • Provence &amp; Côte
                            d’Azur
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={`${route('demandes')}?nouvelle=1`}
                            className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-4 py-2 text-label text-ink shadow-sm transition-colors hover:bg-ivory`}
                        >
                            <Icone nom="add_circle" className="text-[17px] text-sage" />
                            <span>Nouvelle demande</span>
                        </Link>
                        <button
                            type="button"
                            className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-label text-white shadow-sm transition-opacity hover:opacity-80`}
                        >
                            <Icone nom="event_note" className="text-[17px]" />
                            <span>Créer un mariage</span>
                        </button>
                    </div>
                </header>

                <CartesIndicateurs />

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        <CalendrierMensuel evenementsTous={evenementsTous} />
                        <GraphiqueChiffreAffaires />
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-4">
                        <RappelsPrioritaires />
                        <ActiviteRecente />
                    </div>
                </div>
            </div>
        </BackOfficeLayout>
    );
}
