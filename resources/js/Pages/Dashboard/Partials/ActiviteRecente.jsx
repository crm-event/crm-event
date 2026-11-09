import Icone from '@/Components/Icone';
import { dateCourte, euros } from '@/Pages/Dashboard/presentation';

export default function ActiviteRecente({ activites }) {
    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
                <h2 className="font-display text-title-sm text-ink">Activité récente du studio</h2>
                <Icone nom="history" className="text-[18px] text-sage" />
            </div>
            <ul className="mt-4 space-y-4 text-body-sm">
                {activites.map((activite) => (
                    <li key={activite.id} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ivory">
                            <Icone nom={activite.type} className="text-[14px] text-ink" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="font-medium text-ink">{activite.libelle}</span>
                                <time dateTime={activite.date} className="text-[10px] text-sage">{dateCourte(activite.date)}</time>
                            </div>
                            <p className="mt-0.5 break-words text-sage">
                                {activite.lieu}
                                {activite.montant !== undefined && ' · ' + euros(activite.montant)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
            {activites.length === 0 && <p className="mt-4 text-body-sm text-sage">Aucune activité enregistrée.</p>}
        </section>
    );
}
