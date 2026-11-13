import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ActiviteRecente from '@/Pages/Dashboard/Partials/ActiviteRecente';
import CalendrierMensuel from '@/Pages/Dashboard/Partials/CalendrierMensuel';
import CartesIndicateurs from '@/Pages/Dashboard/Partials/CartesIndicateurs';
import GraphiqueChiffreAffaires from '@/Pages/Dashboard/Partials/GraphiqueChiffreAffaires';
import RappelsPrioritaires from '@/Pages/Dashboard/Partials/RappelsPrioritaires';
import { anneauFocus } from '@/charte';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ aujourdhui, annee, finances, suivi, evenementsTous, activites }) {
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
                            Suivi des dossiers · {annee}
                        </p>
                    </div>

                    {route().has('demandes') && (
                        <Link
                            href={route('demandes', { nouvelle: 1 })}
                            className={anneauFocus + ' inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-4 py-2 text-label text-ink hover:bg-ivory'}
                        >
                            <Icone nom="add_circle" className="text-[17px] text-sage" />
                            Nouvelle demande
                        </Link>
                    )}
                </header>

                <CartesIndicateurs suivi={suivi} finances={finances} />

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        <CalendrierMensuel evenementsTous={evenementsTous} />
                        <GraphiqueChiffreAffaires finances={finances} annee={annee} />
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-4">
                        <RappelsPrioritaires rappels={suivi.rappels} aujourdhui={aujourdhui} />
                        <ActiviteRecente activites={activites} />
                    </div>
                </div>
            </div>
        </BackOfficeLayout>
    );
}
