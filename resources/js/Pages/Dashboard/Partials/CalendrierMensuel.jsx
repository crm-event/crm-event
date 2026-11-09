import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { Link } from '@inertiajs/react';

const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const styles = {
    mariage: 'bg-ink text-white',
    jalon: 'bg-ivory text-ink',
    rdv: 'bg-cream-light text-ink',
};
const types = { mariage: 'Mariage', jalon: 'Jalon', rdv: 'Rendez-vous' };

function construireCases(mois) {
    const [annee, numero] = mois.split('-').map(Number);
    const premier = new Date(annee, numero - 1, 1);
    const decalage = (premier.getDay() + 6) % 7;
    const jours = new Date(annee, numero, 0).getDate();
    const total = Math.ceil((decalage + jours) / 7) * 7;

    return Array.from({ length: total }, (_, index) => {
        const date = new Date(annee, numero - 1, index - decalage + 1);
        const moisDate = String(date.getMonth() + 1).padStart(2, '0');
        const jour = String(date.getDate()).padStart(2, '0');
        return {
            date: date.getFullYear() + '-' + moisDate + '-' + jour,
            jour: date.getDate(),
            horsMois: date.getMonth() !== numero - 1,
        };
    });
}

export default function CalendrierMensuel({ planning, aujourdhui }) {
    const cases = construireCases(planning.mois);
    const titre = new Date(planning.mois + '-01T12:00:00').toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });
    const parJour = new Map();
    for (const evenement of planning.evenements) {
        if (!parJour.has(evenement.date)) {
            parJour.set(evenement.date, []);
        }
        parJour.get(evenement.date).push(evenement);
    }

    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
                <div>
                    <h2 className="font-display text-title-md capitalize text-ink">{titre}</h2>
                    <p className="mt-0.5 text-body-sm text-sage">{planning.evenements.length} événements · Planning Atelier</p>
                </div>
                <nav aria-label="Navigation du planning" className="flex rounded-lg border border-subtle">
                    <Link href={route('dashboard', { mois: planning.precedent })} only={['planning']} preserveScroll aria-label="Mois précédent" className={anneauFocus + ' p-1.5 text-sage hover:bg-ivory'}>
                        <Icone nom="chevron_left" className="text-[18px]" />
                    </Link>
                    <Link href={route('dashboard', { mois: planning.suivant })} only={['planning']} preserveScroll aria-label="Mois suivant" className={anneauFocus + ' p-1.5 text-sage hover:bg-ivory'}>
                        <Icone nom="chevron_right" className="text-[18px]" />
                    </Link>
                </nav>
            </header>

            <div className="overflow-x-auto pt-4">
                <div className="min-w-[420px]">
                    <div className="grid grid-cols-7 border-b border-cream pb-2 text-center">
                        {joursSemaine.map((jour) => <span key={jour} className="text-caps uppercase text-sage">{jour}</span>)}
                    </div>
                    <div className="grid auto-rows-[minmax(64px,auto)] grid-cols-7 text-body-sm">
                        {cases.map(({ date, jour, horsMois }) => (
                            <div key={date} className={'min-w-0 border-b border-r border-cream p-1.5 ' + (date === aujourdhui ? 'bg-ivory' : '')}>
                                <time dateTime={date} aria-current={date === aujourdhui ? 'date' : undefined} className={horsMois ? 'text-subtle' : 'text-ink'}>{jour}</time>
                                {!horsMois && (parJour.get(date) ?? []).map((evenement) => (
                                    <div key={evenement.id} className={'mt-1 break-words rounded px-1 py-0.5 text-[10px] ' + styles[evenement.type]} title={evenement.lieu ?? undefined}>
                                        <span className="sr-only">{types[evenement.type]} · </span>{evenement.libelle}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {planning.evenements.length === 0 && <p className="mt-3 text-body-sm text-sage">Aucun événement enregistré ce mois-ci.</p>}
        </section>
    );
}
