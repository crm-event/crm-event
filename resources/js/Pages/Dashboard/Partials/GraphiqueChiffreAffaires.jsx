import { euros } from '@/Pages/Dashboard/presentation';

const series = [
    { cle: 'encaisse', libelle: 'Encaissé', couleur: 'bg-ink' },
    { cle: 'signe', libelle: 'À encaisser (signé)', couleur: 'bg-sage' },
    { cle: 'previsionnel', libelle: 'Budget prévisionnel', couleur: 'bg-hairline' },
];

export default function GraphiqueChiffreAffaires({ finances, annee }) {
    const mois = finances.mois.map((valeurs, index) => ({
        valeurs,
        libelle: new Date(annee, index, 1).toLocaleDateString('fr-FR', { month: 'short' }),
        positif: Object.values(valeurs).reduce((total, montant) => total + Math.max(0, montant), 0),
        negatif: Object.values(valeurs).reduce((total, montant) => total + Math.max(0, -montant), 0),
    }));
    const plafond = Math.max(...mois.map((ligne) => ligne.positif), 0);
    const plancher = Math.max(...mois.map((ligne) => ligne.negatif), 0);
    const etendue = plafond + plancher;

    return (
        <section className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <header className="border-b border-hairline pb-4">
                <h2 className="font-display text-title-md text-ink">Chiffre d’affaires {annee}</h2>
                <p className="mt-1 text-body-sm text-sage">Paiements par date d’encaissement ou d’échéance, budgets prévisionnels par date de mariage.</p>
                <div className="mt-3 flex flex-wrap gap-3 text-label text-sage">
                    {series.map(({ cle, libelle, couleur }) => (
                        <span key={cle} className="inline-flex items-center gap-1.5">
                            <span className={'h-2.5 w-2.5 rounded-sm ' + couleur} />{libelle}
                        </span>
                    ))}
                </div>
            </header>
            {etendue === 0 ? <p className="py-8 text-center text-body-sm text-sage">Aucun montant enregistré pour cette année.</p> : (
                <div className="overflow-x-auto pt-6">
                    <div className="grid min-w-[360px] grid-cols-12 gap-2">
                        {mois.map(({ valeurs, libelle }) => {
                            const detail = series.map(({ cle, libelle }) => libelle + ' : ' + euros(valeurs[cle])).join(' · ');
                            return (
                                <div key={libelle} className="group relative text-center" tabIndex={0} aria-label={libelle + ' · ' + detail} title={detail}>
                                    <div className="flex h-44 flex-col">
                                        <div className="flex flex-col-reverse items-center border-b border-hairline" style={{ height: (100 * plafond / etendue) + '%' }}>
                                            {series.filter(({ cle }) => valeurs[cle] > 0).map(({ cle, couleur }) => (
                                                <div key={cle} className={'w-full max-w-7 ' + couleur} style={{ height: (100 * valeurs[cle] / plafond) + '%' }} />
                                            ))}
                                        </div>
                                        {plancher > 0 && (
                                            <div className="flex flex-col items-center" style={{ height: (100 * plancher / etendue) + '%' }}>
                                                {series.filter(({ cle }) => valeurs[cle] < 0).map(({ cle, couleur }) => (
                                                    <div key={cle} className={'w-full max-w-7 ' + couleur} style={{ height: (-100 * valeurs[cle] / plancher) + '%' }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="mt-2 block text-[10px] uppercase text-sage">{libelle}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {finances.moyenne !== null && (
                <p className="mt-4 border-t border-hairline pt-3 text-body-sm text-sage">
                    Encaissement moyen par dossier · <strong className="font-medium text-ink">{euros(finances.moyenne)}</strong>
                </p>
            )}
        </section>
    );
}
