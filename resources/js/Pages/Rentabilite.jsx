import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const euros = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
});
const nombres = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

function montant(value) {
    return euros.format(value ?? 0);
}

function pourcentage(value) {
    return value === null ? '—' : `${nombres.format(value)} %`;
}

function CarteIndicateur({ numero, titre, badge, valeur, description, children }) {
    return (
        <article className="flex min-h-[250px] flex-col justify-between rounded-xl border border-hairline bg-white p-6 shadow-sm lg:p-8">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="text-caps uppercase tracking-wider text-sage">Indicateur clé {numero}</span>
                    <h2 className="mt-1 text-body font-medium text-ink">{titre}</h2>
                </div>
                <span className="shrink-0 rounded-full bg-ivory px-2.5 py-1 text-[10px] text-sage">{badge}</span>
            </div>
            <div className="my-5">
                <p className="font-display text-[34px] leading-tight tracking-tight text-ink sm:text-[40px]">{valeur}</p>
                <p className="mt-2 max-w-sm text-body text-sage">{description}</p>
            </div>
            {children}
        </article>
    );
}

function CarteSecondaire({ icone, etiquette, valeur, description }) {
    return (
        <article className="flex min-w-0 items-center gap-4 rounded-xl border border-hairline bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ivory text-ink">
                <Icone nom={icone} className="text-[24px]" />
            </div>
            <div className="min-w-0">
                <span className="text-caps uppercase tracking-wider text-sage">{etiquette}</span>
                <p className="truncate font-display text-title-sm text-ink">{valeur}</p>
                <p className="truncate text-body-sm text-sage" title={description}>{description}</p>
            </div>
        </article>
    );
}

export default function Rentabilite({ year, years, hourlyCost, summary, weddings }) {
    const [showAll, setShowAll] = useState(false);
    const visibleWeddings = showAll ? weddings : weddings.slice(0, 3);
    const progress = Math.max(0, Math.min(100, summary.marginRatio ?? 0));

    return (
        <BackOfficeLayout actif="rentabilite" filAriane="Rentabilité">
            <Head title="Rentabilité" />

            <div className="flex w-full flex-col gap-8">
                <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div>
                        <p className="text-caps uppercase tracking-widest text-sage">Haute direction · Analyse &amp; rentabilité</p>
                        <h1 className="mt-2 font-display text-[26px] leading-tight tracking-tight text-ink sm:text-[32px]">
                            Rentabilité &amp; Analyse de Performance
                        </h1>
                        <p className="mt-2 max-w-2xl text-body text-sage">
                            Analyse des honoraires, des dépenses et du temps passé par mariage.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <form action={route('rentabilite.index')} method="get" className="flex items-center gap-3 rounded-lg border border-hairline bg-white px-4 py-2.5 shadow-sm">
                            <Icone nom="calendar_month" className="text-[20px] text-sage" />
                            <label className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase tracking-wider text-sage">Exercice d’analyse</span>
                                <select
                                    name="annee"
                                    value={year}
                                    onChange={(event) => event.currentTarget.form?.requestSubmit()}
                                    className={`${anneauFocus} -ml-1 border-0 bg-transparent py-0 pl-0 pr-7 text-body font-medium text-ink focus:ring-0`}
                                >
                                    {years.map((availableYear) => (
                                        <option key={availableYear} value={availableYear}>Saison {availableYear}</option>
                                    ))}
                                </select>
                            </label>
                        </form>
                        <a
                            href={route('rentabilite.rapport', { annee: year })}
                            className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-body font-medium text-white shadow-sm transition-opacity hover:opacity-80`}
                        >
                            <Icone nom="file_download" className="text-[18px]" />
                            Rapport d’expertise
                        </a>
                    </div>
                </header>

                <section aria-label="Indicateurs de rentabilité" className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <CarteIndicateur
                        numero="01"
                        titre="Marge estimée globale"
                        badge="Après coûts saisis"
                        valeur={pourcentage(summary.marginRatio)}
                        description="Honoraires facturés après dépenses enregistrées et valorisation du temps d’atelier."
                    >
                        <div className="flex items-center gap-3 text-[11px] text-sage">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blush">
                                <div className="h-full rounded-full bg-ink" style={{ width: `${progress}%` }} />
                            </div>
                            <span>Coût horaire : {montant(hourlyCost)}</span>
                        </div>
                    </CarteIndicateur>
                    <CarteIndicateur
                        numero="02"
                        titre="CA total des honoraires"
                        badge={`${summary.weddingCount} dossier${summary.weddingCount > 1 ? 's' : ''}`}
                        valeur={montant(summary.revenue)}
                        description="Montants des paiements facturés pour les mariages de la saison sélectionnée."
                    >
                        <div className="flex items-center justify-between gap-3 text-body-sm text-sage">
                            <span>Panier moyen par dossier</span>
                            <strong className="whitespace-nowrap font-display text-title-sm font-normal text-ink">{summary.averageRevenue === null ? '—' : montant(summary.averageRevenue)}</strong>
                        </div>
                    </CarteIndicateur>
                    <CarteIndicateur
                        numero="03"
                        titre="Valorisation du temps"
                        badge={`Base ${montant(hourlyCost)}/h`}
                        valeur={summary.hourlyReturn === null ? '—' : `${montant(summary.hourlyReturn)} / h`}
                        description="Honoraires facturés moins dépenses, rapportés aux heures déclarées."
                    >
                        <div className="flex items-center justify-between gap-3 text-body-sm text-sage">
                            <span>Volume d’heures total</span>
                            <strong className="whitespace-nowrap font-display text-title-sm font-normal text-ink">{nombres.format(summary.hours)} h</strong>
                        </div>
                    </CarteIndicateur>
                </section>

                <section aria-label="Comparatif par mariage" className="rounded-xl border border-hairline bg-white p-5 shadow-sm sm:p-8">
                    <div className="flex flex-col justify-between gap-4 pb-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-caps uppercase tracking-wider text-sage">Section 01 — Métrique détaillée</p>
                            <h2 className="mt-1 font-display text-title-md text-ink sm:text-title-lg">
                                Comparatif Revenus vs Coût du Temps par Mariage
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-sage">
                            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-ink" /> Marge estimée</span>
                            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sage" /> Coût valorisé &amp; dépenses</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left">
                            <thead>
                                <tr className="bg-ivory text-caps uppercase tracking-wider text-sage">
                                    <th scope="col" className="rounded-l-lg px-4 py-3">Mariage &amp; dossier</th>
                                    <th scope="col" className="px-3 py-3 text-right">CA facturé</th>
                                    <th scope="col" className="px-3 py-3 text-right">Temps passé</th>
                                    <th scope="col" className="px-3 py-3 text-right">Dépenses</th>
                                    <th scope="col" className="px-3 py-3 text-right">Marge estimée</th>
                                    <th scope="col" className="rounded-r-lg px-4 py-3 text-right">Ratio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hairline text-body">
                                {visibleWeddings.map((wedding) => (
                                    <tr key={wedding.id} className="transition-colors hover:bg-ivory/60">
                                        <td className="px-4 py-5">
                                            <span className="block font-display text-title-sm text-ink">{wedding.couple}</span>
                                            <span className="block text-[11px] text-sage">{wedding.venue} · {new Date(`${wedding.date}T12:00:00`).toLocaleDateString('fr-FR')}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-right font-display text-[15px] text-ink">{montant(wedding.revenue)}</td>
                                        <td className="px-3 py-5 text-right">
                                            <span className="block font-medium text-ink">{nombres.format(wedding.hours)} h</span>
                                            <span className="block text-[11px] text-sage">Coût {montant(wedding.time_cost)}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-5 text-right font-display text-[14px] text-sage">{montant(wedding.expenses)}</td>
                                        <td className="whitespace-nowrap px-3 py-5 text-right font-display text-[16px] text-ink">{montant(wedding.margin)}</td>
                                        <td className="px-4 py-5 text-right">
                                            <span className="font-display text-[15px] font-semibold text-ink">{pourcentage(wedding.ratio)}</span>
                                            <div className="ml-auto mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-blush">
                                                <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max(0, Math.min(100, wedding.ratio ?? 0))}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {weddings.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-body text-sage">Aucun mariage signé ni chiffre financier pour cette saison.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex flex-col justify-between gap-3 rounded-lg bg-ivory p-4 text-body sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3 text-ink">
                            <Icone nom="insights" className="mt-0.5 text-[20px] text-sage" />
                            <p>
                                <strong>Lecture des chiffres :</strong> marge estimée = CA facturé − dépenses nettes − heures déclarées × {montant(hourlyCost)}. Hors TVA, cotisations et frais généraux.
                            </p>
                        </div>
                        {weddings.length > 3 && (
                            <button
                                type="button"
                                onClick={() => setShowAll((current) => !current)}
                                className={`${anneauFocus} shrink-0 self-start text-[11px] uppercase tracking-wider text-ink underline underline-offset-4 sm:self-auto`}
                            >
                                {showAll ? 'Réduire la liste' : `Voir les ${weddings.length} mariages`}
                            </button>
                        )}
                    </div>
                </section>

                <section aria-label="Autres indicateurs" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <CarteSecondaire
                        icone="account_balance"
                        etiquette="Honoraires encaissés"
                        valeur={montant(summary.paid)}
                        description="Paiements avec une date de règlement"
                    />
                    <CarteSecondaire
                        icone="timer"
                        etiquette="Temps d’atelier médian"
                        valeur={summary.medianHours === null ? '—' : `${nombres.format(summary.medianHours)} h / mariage`}
                        description="Sur les dossiers avec heures déclarées"
                    />
                    <CarteSecondaire
                        icone="verified"
                        etiquette="Dossiers documentés"
                        valeur={`${summary.documentedCount} / ${summary.weddingCount}`}
                        description="Avec facturation et temps saisi"
                    />
                </section>
            </div>
        </BackOfficeLayout>
    );
}
