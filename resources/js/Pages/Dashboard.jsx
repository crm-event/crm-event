import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import ActiviteRecente from '@/Pages/Dashboard/Partials/ActiviteRecente';
import CalendrierMensuel from '@/Pages/Dashboard/Partials/CalendrierMensuel';
import CartesIndicateurs from '@/Pages/Dashboard/Partials/CartesIndicateurs';
import GraphiqueChiffreAffaires from '@/Pages/Dashboard/Partials/GraphiqueChiffreAffaires';
import RappelsPrioritaires from '@/Pages/Dashboard/Partials/RappelsPrioritaires';
import { anneauFocus } from '@/charte';
import { Head, router, usePage, usePoll } from '@inertiajs/react';

export default function Dashboard({ aujourdhui, annee, annees, finances, suivi, planning, evenementsTous, activites }) {
    const prenom = usePage().props.auth.user.name.split(' ')[0];
    usePoll(60000, { only: ['aujourdhui', 'annee', 'annees', 'finances', 'suivi', 'planning', 'evenementsTous', 'activites'] });

    const changerAnnee = (nouvelleAnnee, mois = null) => {
        router.get(route('dashboard'), { annee: nouvelleAnnee, ...(mois ? { mois } : {}) }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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
                        <p className="mt-1 text-body-sm text-sage">Actualisation automatique chaque minute.</p>
                    </div>
                    <label htmlFor="annee-dashboard" className="flex flex-col gap-2 text-caps uppercase text-sage">
                        Année affichée
                        <select
                            id="annee-dashboard"
                            value={annee}
                            onChange={(event) => changerAnnee(Number(event.target.value))}
                            className={`${anneauFocus} min-w-36 rounded-lg border border-hairline bg-white py-2 pl-3 pr-9 text-body text-ink`}
                        >
                            {annees.map((valeur) => <option key={valeur} value={valeur}>{valeur}</option>)}
                        </select>
                    </label>
                </header>

                <CartesIndicateurs suivi={suivi} finances={finances} annee={annee} />

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        <CalendrierMensuel key={annee} evenementsTous={evenementsTous} moisInitial={planning.mois} onChangerAnnee={changerAnnee} />
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
