import { dateCourte } from '@/Pages/Dashboard/presentation';
import { anneauFocus } from '@/charte';
import { Link } from '@inertiajs/react';

const libelles = { jalon: 'Jalon', rdv: 'Rendez-vous', paiement: 'Échéance', 'jour-j': 'Mariage' };

export default function RappelsPrioritaires({ rappels, aujourdhui }) {
    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
                <h2 className="font-display text-title-sm text-ink">Rappels prioritaires</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ivory text-body-sm font-medium text-ink">{rappels.length}</span>
            </div>
            <p className="mt-3 text-body-sm text-sage">Échéances en retard et événements des sept prochains jours.</p>
            <ul className="mt-4 space-y-3">
                {rappels.map((rappel) => {
                    const enRetard = rappel.date < aujourdhui;
                    return (
                        <li key={rappel.id} className="flex flex-col gap-1.5 rounded-lg border border-hairline bg-ivory/70 p-3">
                            <time dateTime={rappel.date} className={'text-caps uppercase ' + (enRetard ? 'text-warning' : 'text-sage')}>
                                {enRetard ? 'En retard' : libelles[rappel.type]} · {dateCourte(rappel.date)}{rappel.heure && ` à ${rappel.heure}`}
                            </time>
                            <h3 className="text-body font-medium text-ink">
                                <Link href={rappel.url} className={`${anneauFocus} rounded hover:underline`}>{rappel.libelle}</Link>
                            </h3>
                            {rappel.lieu && <p className="text-body-sm text-sage">{rappel.lieu}</p>}
                        </li>
                    );
                })}
            </ul>
            {rappels.length === 0 && <p className="mt-4 text-body-sm text-sage">Aucun rappel pour les sept prochains jours.</p>}
        </section>
    );
}
