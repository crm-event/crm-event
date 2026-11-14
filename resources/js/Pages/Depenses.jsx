import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const euro = (montant) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
const dateFr = (date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

function CarteIndicateur({ titre, valeur, description, icone }) {
    return <article className="rounded-xl border border-hairline bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-caps uppercase text-sage">{titre}</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory text-sage"><Icone nom={icone}/></span></div><p className="mt-4 font-display text-display">{valeur}</p><p className="mt-1 text-body-sm text-sage">{description}</p></article>;
}

function Erreur({ message }) {
    return message ? <span role="alert" className="mt-1 block text-body-sm text-red-700">{message}</span> : null;
}

function FormulaireJustificatif({ depense, onClose, onSuccess }) {
    const { setData, post, processing, errors } = useForm({ receipt: null });

    function envoyer(event) {
        event.preventDefault();
        post(route('depenses.receipt.store', depense.id), { preserveScroll: true, onSuccess });
    }

    return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="justificatif-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="justificatif-title" className="font-display text-title-md">Ajouter un justificatif</h2>
        <p className="mt-1 text-body-sm text-sage">{depense.intitule}</p>
        <form onSubmit={envoyer} className="mt-5 space-y-4">
            <label className="block text-caps uppercase text-sage">PDF ou image, 10 Mo maximum<input type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setData('receipt', event.target.files[0] ?? null)} className="mt-2 block w-full text-body text-ink"/><Erreur message={errors.receipt}/></label>
            <div className="flex justify-end gap-2"><button type="button" disabled={processing} onClick={onClose} className="rounded-lg px-4 py-2 text-body text-sage">Annuler</button><button type="submit" disabled={processing} className="rounded-lg bg-ink px-5 py-2 text-body text-white disabled:opacity-50">{processing ? 'Enregistrement…' : 'Enregistrer'}</button></div>
        </form>
    </section></div>;
}

export default function Depenses({ depenses = [], categories = [], mariages = [] }) {
    const [annee, setAnnee] = useState(String(new Date().getFullYear()));
    const [recherche, setRecherche] = useState('');
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [message, setMessage] = useState('');
    const [depenseJustificatif, setDepenseJustificatif] = useState(null);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount: '', spent_on: '', expense_category_id: '', wedding_id: '', label: '', receipt: null,
    });
    const depensesAnnee = useMemo(() => depenses.filter((depense) => depense.date.startsWith(`${annee}-`)), [depenses, annee]);
    const totalCentimes = depensesAnnee.reduce((somme, depense) => somme + Math.round(Number(depense.montant) * 100), 0);
    const total = totalCentimes / 100;
    const moyenne = depensesAnnee.length ? totalCentimes / depensesAnnee.length / 100 : 0;
    const visibles = useMemo(() => depensesAnnee.filter((depense) => `${depense.intitule} ${depense.categorie} ${depense.mariage}`.toLocaleLowerCase('fr').includes(recherche.toLocaleLowerCase('fr'))), [depensesAnnee, recherche]);
    const annees = Array.from(new Set([String(new Date().getFullYear()), ...depenses.map((depense) => depense.date.slice(0, 4)), annee])).sort().reverse();

    function fermerFormulaire() {
        if (!processing) {
            setFormulaireOuvert(false);
            reset();
            clearErrors();
        }
    }

    function enregistrerDepense(event) {
        event.preventDefault();
        const anneeDepense = data.spent_on.slice(0, 4);
        post(route('depenses.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setAnnee(anneeDepense);
                setRecherche('');
                setFormulaireOuvert(false);
                reset();
                setMessage('La dépense a été enregistrée.');
            },
        });
    }

    return <BackOfficeLayout actif="depenses" filAriane="Dépenses & Justificatifs">
        <Head title="Dépenses & Justificatifs" />
        <div className="flex flex-col gap-7">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-caps uppercase text-sage">Suivi des frais de production</p><h1 className="font-display text-3xl tracking-tight text-ink sm:text-display">Dépenses &amp; Justificatifs</h1><p className="mt-2 text-body text-sage">Centralisez les frais engagés pour chaque mariage.</p></div><div className="flex items-center gap-3"><label className="sr-only" htmlFor="annee-depenses">Année</label><select id="annee-depenses" value={annee} onChange={(event) => setAnnee(event.target.value)} className="rounded-lg border-hairline bg-white px-4 py-2 text-body">{annees.map((anneeDisponible) => <option key={anneeDisponible}>{anneeDisponible}</option>)}</select><button type="button" onClick={() => { setMessage(''); setFormulaireOuvert(true); }} className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-label text-white`}><Icone nom="add"/>Ajouter une dépense</button></div></header>

            {message && <p role="status" className="rounded-lg border border-success/20 bg-success/10 p-3 text-body text-success">{message}</p>}
            <section aria-label="Synthèse des dépenses" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"><CarteIndicateur titre={`Total des dépenses ${annee}`} valeur={euro(total)} description={`${depensesAnnee.length} frais sur la période`} icone="account_balance_wallet"/><CarteIndicateur titre="Dépense moyenne" valeur={euro(moyenne)} description="Montant moyen par dépense sur la période" icone="show_chart"/><CarteIndicateur titre="Justificatifs manquants" valeur={depensesAnnee.filter((depense) => !depense.justificatif).length} description="Dépenses sans pièce jointe" icone="receipt_long"/></section>

            <section className="overflow-hidden rounded-xl border border-hairline bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline px-5 py-4"><div><h2 className="font-display text-title-md">Registre des dépenses</h2><p className="mt-1 text-body-sm text-sage">Détail des frais engagés et de leurs justificatifs</p></div><label className="relative w-full sm:w-72"><Icone nom="search" className="absolute left-3 top-2.5 text-[17px] text-sage"/><input value={recherche} onChange={(event) => setRecherche(event.target.value)} placeholder="Rechercher une dépense…" aria-label="Rechercher une dépense" className="w-full rounded-lg border border-hairline py-2 pl-9 pr-3 text-body"/></label></div>
                <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[850px] text-left text-body"><thead className="bg-ivory text-caps uppercase text-sage"><tr><th className="px-5 py-3">Justificatif</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Intitulé du frais</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Mariage rattaché</th><th className="px-4 py-3 text-right">Montant TTC</th></tr></thead><tbody className="divide-y divide-hairline">{visibles.map((depense) => <tr key={depense.id}><td className="px-5 py-4">{depense.justificatif ? <a href={route('depenses.receipt', depense.id)} className="inline-flex items-center gap-2 text-success underline"><Icone nom="description"/>Télécharger</a> : <button type="button" onClick={() => setDepenseJustificatif(depense)} className="inline-flex items-center gap-2 text-warning underline"><Icone nom="upload_file"/>Ajouter</button>}</td><td className="whitespace-nowrap px-4 py-4 text-sage">{dateFr(depense.date)}</td><td className="px-4 py-4 font-medium">{depense.intitule}</td><td className="px-4 py-4"><span className="rounded-full bg-ivory px-2.5 py-1 text-body-sm text-sage">{depense.categorie}</span></td><td className="px-4 py-4 text-sage">{depense.mariage}</td><td className="whitespace-nowrap px-4 py-4 text-right font-display text-title-sm">{euro(depense.montant)}</td></tr>)}</tbody></table></div>
                <div className="divide-y divide-hairline lg:hidden">{visibles.map((depense) => <article key={depense.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{depense.intitule}</h3><p className="mt-1 text-body-sm text-sage">{dateFr(depense.date)} · {depense.mariage}</p></div><strong className="whitespace-nowrap font-display text-title-sm">{euro(depense.montant)}</strong></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-body-sm"><span className="rounded-full bg-ivory px-2.5 py-1 text-sage">{depense.categorie}</span>{depense.justificatif ? <a href={route('depenses.receipt', depense.id)} className="text-success underline">Télécharger le justificatif</a> : <button type="button" onClick={() => setDepenseJustificatif(depense)} className="text-warning underline">Ajouter un justificatif</button>}</div></article>)}</div>
                {visibles.length === 0 && <p className="p-8 text-center text-body text-sage">Aucune dépense pour cette sélection.</p>}
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-ivory/60 px-5 py-4 text-body-sm"><span className="text-sage">{visibles.length} dépense{visibles.length > 1 ? 's' : ''} affichée{visibles.length > 1 ? 's' : ''} • Total de l’année</span><strong className="font-display text-title-sm text-ink">{euro(total)}</strong></footer>
            </section>
        </div>

        {depenseJustificatif && <FormulaireJustificatif
            depense={depenseJustificatif}
            onClose={() => setDepenseJustificatif(null)}
            onSuccess={() => { setDepenseJustificatif(null); setMessage('Le justificatif a été enregistré.'); }}
        />}
        {formulaireOuvert && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) fermerFormulaire(); }}><section role="dialog" aria-modal="true" aria-labelledby="depense-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-caps uppercase text-sage">Frais de production</p><h2 id="depense-title" className="mt-1 font-display text-title-md">Nouvelle dépense</h2></div><button type="button" aria-label="Fermer le formulaire" onClick={fermerFormulaire} disabled={processing}><Icone nom="close"/></button></div>
            {(categories.length === 0 || mariages.length === 0) && <p className="mt-4 text-body-sm text-warning">Un mariage et une catégorie active sont nécessaires pour enregistrer une dépense.</p>}
            <form onSubmit={enregistrerDepense} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-caps uppercase text-sage">Montant TTC (€) *<input name="amount" type="number" min="0.01" max="99999999.99" step="0.01" required value={data.amount} onChange={(event) => setData('amount', event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body text-ink" placeholder="0,00"/><Erreur message={errors.amount}/></label>
                    <label className="block text-caps uppercase text-sage">Date de dépense *<input name="spent_on" type="date" required value={data.spent_on} onChange={(event) => setData('spent_on', event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body text-ink"/><Erreur message={errors.spent_on}/></label>
                </div>
                <label className="block text-caps uppercase text-sage">Catégorie budgétaire *<select name="expense_category_id" required value={data.expense_category_id} onChange={(event) => setData('expense_category_id', event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body text-ink"><option value="" disabled>Choisir une catégorie</option>{categories.map((categorie) => <option key={categorie.id} value={categorie.id}>{categorie.name}</option>)}</select><Erreur message={errors.expense_category_id}/></label>
                <label className="block text-caps uppercase text-sage">Dossier mariage associé *<select name="wedding_id" required value={data.wedding_id} onChange={(event) => setData('wedding_id', event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body text-ink"><option value="" disabled>Choisir un mariage</option>{mariages.map((mariage) => <option key={mariage.id} value={mariage.id}>{mariage.titre}{mariage.date ? ` — ${dateFr(mariage.date)}` : ''}</option>)}</select><Erreur message={errors.wedding_id}/></label>
                <label className="block text-caps uppercase text-sage">Intitulé *<input name="label" required maxLength="255" value={data.label} onChange={(event) => setData('label', event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body text-ink" placeholder="Ex. location de mobilier"/><Erreur message={errors.label}/></label>
                <label className="block text-caps uppercase text-sage">Justificatif facultatif (PDF ou image, 10 Mo maximum)<input name="receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setData('receipt', event.target.files[0] ?? null)} className="mt-1 block w-full text-body text-ink"/><Erreur message={errors.receipt}/></label>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={fermerFormulaire} disabled={processing} className="rounded-lg px-4 py-2 text-body text-sage">Annuler</button><button type="submit" disabled={processing || categories.length === 0 || mariages.length === 0} className="rounded-lg bg-ink px-5 py-2 text-body text-white disabled:opacity-50">{processing ? 'Enregistrement…' : 'Enregistrer la dépense'}</button></div>
            </form>
        </section></div>}
    </BackOfficeLayout>;
}
