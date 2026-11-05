import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const depensesInitiales = [
    { id: 1, date: '2025-04-15', intitule: 'Bouquets & compositions florales', categorie: 'Fleurs & décoration', mariage: 'Clémence & Alexandre', montant: 680, justificatif: true },
    { id: 2, date: '2025-04-12', intitule: 'Location de mobilier de réception', categorie: 'Location', mariage: 'Victoire & David', montant: 1240, justificatif: true },
    { id: 3, date: '2025-04-08', intitule: 'Échantillons de papeterie', categorie: 'Papeterie', mariage: 'Clémence & Alexandre', montant: 185, justificatif: true },
    { id: 4, date: '2025-04-03', intitule: 'Déplacement repérage domaine', categorie: 'Transport', mariage: 'Éléonore & Arthur', montant: 96, justificatif: false },
    { id: 5, date: '2025-03-28', intitule: 'Bougies & accessoires de table', categorie: 'Fleurs & décoration', mariage: 'Margaux & Bastien', montant: 312, justificatif: true },
];
const categories = ['Fleurs & décoration', 'Location', 'Papeterie', 'Transport', 'Repas & réception', 'Prestataires', 'Autre'];
const euro = (montant) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
const dateFr = (date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

function CarteIndicateur({ titre, valeur, description, icone }) {
    return <article className="rounded-xl border border-hairline bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-caps uppercase text-sage">{titre}</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory text-sage"><Icone nom={icone}/></span></div><p className="mt-4 font-display text-display">{valeur}</p><p className="mt-1 text-body-sm text-sage">{description}</p></article>;
}

export default function Depenses() {
    const [depenses, setDepenses] = useState(depensesInitiales);
    const [annee, setAnnee] = useState('2025');
    const [recherche, setRecherche] = useState('');
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);
    const [message, setMessage] = useState('');
    const total = depenses.reduce((somme, depense) => somme + depense.montant, 0);
    const moyenne = depenses.length ? total / depenses.length : 0;
    const visibles = useMemo(() => depenses.filter((depense) => `${depense.intitule} ${depense.categorie} ${depense.mariage}`.toLocaleLowerCase('fr').includes(recherche.toLocaleLowerCase('fr'))), [depenses, recherche]);

    function enregistrerDepense(e) {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);
        const mariage = donnees.get('mariage') || 'Dépense générale';
        setDepenses((liste) => [{
            id: Date.now(),
            date: donnees.get('date'),
            intitule: donnees.get('intitule'),
            categorie: donnees.get('categorie'),
            mariage,
            montant: Number(donnees.get('montant')),
            justificatif: donnees.get('justificatif') === 'on',
        }, ...liste]);
        setFormulaireOuvert(false);
        setMessage('Dépense ajoutée au registre.');
        window.setTimeout(() => setMessage(''), 3500);
    }

    return <BackOfficeLayout actif="depenses" filAriane="Dépenses & Justificatifs">
        <Head title="Dépenses & Justificatifs" />
        <div className="flex flex-col gap-7">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-caps uppercase text-sage">Suivi des frais de production</p><h1 className="font-display text-3xl tracking-tight text-ink sm:text-display">Dépenses &amp; Justificatifs</h1><p className="mt-2 text-body text-sage">Centralisez les frais engagés pour chaque mariage.</p></div><div className="flex items-center gap-3"><label className="sr-only" htmlFor="annee-depenses">Année</label><select id="annee-depenses" value={annee} onChange={(e) => setAnnee(e.target.value)} className="rounded-lg border-hairline bg-white px-4 py-2 text-body"><option>2025</option><option>2026</option><option>2027</option></select><button type="button" onClick={() => setFormulaireOuvert(true)} className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-label text-white`}><Icone nom="add"/>Ajouter une dépense</button></div></header>

            <section aria-label="Synthèse des dépenses" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"><CarteIndicateur titre={`Total des dépenses ${annee}`} valeur={euro(total)} description={`${depenses.length} frais enregistrés sur la période`} icone="account_balance_wallet"/><CarteIndicateur titre="Dépense moyenne" valeur={euro(moyenne)} description="Montant moyen par dépense enregistrée" icone="show_chart"/><CarteIndicateur titre="Justificatifs manquants" valeur={depenses.filter((depense) => !depense.justificatif).length} description="Dépenses à compléter avec une pièce" icone="receipt_long"/></section>

            <section className="overflow-hidden rounded-xl border border-hairline bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline px-5 py-4"><div><h2 className="font-display text-title-md">Registre des dépenses</h2><p className="mt-1 text-body-sm text-sage">Détail des frais engagés et de leurs justificatifs</p></div><label className="relative w-full sm:w-72"><Icone nom="search" className="absolute left-3 top-2.5 text-[17px] text-sage"/><input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher une dépense…" aria-label="Rechercher une dépense" className="w-full rounded-lg border border-hairline py-2 pl-9 pr-3 text-body"/></label></div>
                <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[850px] text-left text-body"><thead className="bg-ivory text-caps uppercase text-sage"><tr><th className="px-5 py-3">Justificatif</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Intitulé du frais</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Mariage rattaché</th><th className="px-4 py-3 text-right">Montant TTC</th></tr></thead><tbody className="divide-y divide-hairline">{visibles.map((depense) => <tr key={depense.id}><td className="px-5 py-4">{depense.justificatif ? <span className="inline-flex items-center gap-2 text-success"><Icone nom="description"/>Reçu ajouté</span> : <span className="inline-flex items-center gap-2 text-warning"><Icone nom="upload_file"/>À ajouter</span>}</td><td className="whitespace-nowrap px-4 py-4 text-sage">{dateFr(depense.date)}</td><td className="px-4 py-4 font-medium">{depense.intitule}</td><td className="px-4 py-4"><span className="rounded-full bg-ivory px-2.5 py-1 text-body-sm text-sage">{depense.categorie}</span></td><td className="px-4 py-4 text-sage">{depense.mariage}</td><td className="whitespace-nowrap px-4 py-4 text-right font-display text-title-sm">{euro(depense.montant)}</td></tr>)}</tbody></table></div>
                <div className="divide-y divide-hairline lg:hidden">{visibles.map((depense) => <article key={depense.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{depense.intitule}</h3><p className="mt-1 text-body-sm text-sage">{dateFr(depense.date)} · {depense.mariage}</p></div><strong className="whitespace-nowrap font-display text-title-sm">{euro(depense.montant)}</strong></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-body-sm"><span className="rounded-full bg-ivory px-2.5 py-1 text-sage">{depense.categorie}</span><span className={depense.justificatif ? 'text-success' : 'text-warning'}>{depense.justificatif ? 'Justificatif reçu' : 'Justificatif à ajouter'}</span></div></article>)}</div>
                {visibles.length === 0 && <p className="p-8 text-center text-body text-sage">Aucune dépense ne correspond à cette recherche.</p>}
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-ivory/60 px-5 py-4 text-body-sm"><span className="text-sage">{visibles.length} dépense{visibles.length > 1 ? 's' : ''} affichée{visibles.length > 1 ? 's' : ''} • Total de la période</span><strong className="font-display text-title-sm text-ink">{euro(total)}</strong></footer>
            </section>
            {message && <p role="status" className="rounded-lg border border-success/20 bg-success/10 p-3 text-body text-success">{message}</p>}
        </div>

        {formulaireOuvert && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4" onMouseDown={(e) => {if (e.target === e.currentTarget) setFormulaireOuvert(false);}}><section role="dialog" aria-modal="true" aria-labelledby="depense-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-caps uppercase text-sage">Frais de production</p><h2 id="depense-title" className="mt-1 font-display text-title-md">Nouvelle dépense</h2></div><button type="button" aria-label="Fermer le formulaire" onClick={() => setFormulaireOuvert(false)}><Icone nom="close"/></button></div><form onSubmit={enregistrerDepense} className="mt-5 space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block text-caps uppercase text-sage">Montant TTC (€) *<input name="montant" type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded-lg border-hairline text-body text-ink" placeholder="0,00"/></label><label className="block text-caps uppercase text-sage">Date de dépense *<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded-lg border-hairline text-body text-ink"/></label></div><label className="block text-caps uppercase text-sage">Catégorie budgétaire *<select name="categorie" required defaultValue="" className="mt-1 w-full rounded-lg border-hairline text-body text-ink"><option value="" disabled>Choisir une catégorie</option>{categories.map((categorie) => <option key={categorie}>{categorie}</option>)}</select></label><label className="block text-caps uppercase text-sage">Dossier mariage associé<select name="mariage" defaultValue="" className="mt-1 w-full rounded-lg border-hairline text-body text-ink"><option value="">Dépense générale</option><option>Clémence &amp; Alexandre</option><option>Victoire &amp; David</option><option>Éléonore &amp; Arthur</option><option>Margaux &amp; Bastien</option></select></label><label className="block text-caps uppercase text-sage">Intitulé succinct / commentaire<input name="intitule" required className="mt-1 w-full rounded-lg border-hairline text-body text-ink" placeholder="Ex. location de mobilier"/></label><label className="flex cursor-pointer items-center gap-2 text-body text-ink"><input type="checkbox" name="justificatif" className="rounded border-hairline text-ink focus:ring-ink"/>Justificatif reçu</label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setFormulaireOuvert(false)} className="rounded-lg px-4 py-2 text-body text-sage">Annuler</button><button className="rounded-lg bg-ink px-5 py-2 text-body text-white">Enregistrer la dépense</button></div></form></section></div>}
    </BackOfficeLayout>;
}
