import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const types = { deposit: 'Acompte', balance: 'Solde', amendment: 'Avenant' };
const euro = (value) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
const dateFr = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR') : '—';
const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const status = (payment) => payment.paiement ? 'Réglé' : payment.echeance && payment.echeance < today() ? 'En retard' : 'En attente';
const badge = (value) => value === 'Réglé' ? 'bg-success/10 text-success' : value === 'En retard' ? 'bg-warning/10 text-warning' : 'bg-ivory text-sage';
const cents = (items) => items.reduce((sum, item) => sum + Math.round(Number(item.montant) * 100), 0);

function csvField(value) {
    let text = String(value ?? '');
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
}

function Erreur({ message }) {
    return message ? <span role="alert" className="mt-1 block text-body-sm text-red-700">{message}</span> : null;
}

function FormulairePaiement({ paiement, prestations, onClose, onSuccess }) {
    const { data, setData, post, put, processing, errors } = useForm({
        wedding_service_id: paiement?.wedding_service_id ?? '',
        type: paiement?.type ?? 'deposit',
        amount: paiement?.montant ?? '',
        due_date: paiement?.echeance ?? '',
        invoice_number: paiement?.facture_numero ?? '',
        invoice_url: paiement?.facture_url ?? '',
        invoiced_at: paiement?.facture_date ?? '',
        paid_at: paiement?.paiement ?? '',
    });
    const update = Boolean(paiement);
    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess };
        if (update) put(route('facturation.payments.update', paiement.id), options);
        else post(route('facturation.payments.store'), options);
    }

    return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="paiement-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex justify-between gap-4"><div><p className="text-caps uppercase text-sage">Suivi des encaissements</p><h2 id="paiement-title" className="mt-1 font-display text-title-md">{update ? 'Modifier le paiement' : 'Ajouter un paiement'}</h2></div><button type="button" disabled={processing} onClick={onClose} aria-label="Fermer"><Icone nom="close"/></button></div>
        <p className="mt-3 text-body-sm text-sage">Les factures sont émises dans l’outil externe ; renseignez ici leur référence et leur lien.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-label">Prestation *<select required disabled={update} value={data.wedding_service_id} onChange={(e) => setData('wedding_service_id', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"><option value="">Choisir une prestation</option>{prestations.map((p) => <option key={p.id} value={p.id}>{p.libelle}</option>)}</select><Erreur message={errors.wedding_service_id}/></label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block text-label">Type *<select value={data.type} onChange={(e) => setData('type', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body">{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Erreur message={errors.type}/></label><label className="block text-label">Montant (€) *<input required type="number" min="0.01" max="99999999.99" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.amount}/></label></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block text-label">Échéance<input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.due_date}/></label><label className="block text-label">Date de paiement<input type="date" max={today()} value={data.paid_at} onChange={(e) => setData('paid_at', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.paid_at}/></label></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block text-label">Numéro de facture<input maxLength="255" value={data.invoice_number} onChange={(e) => setData('invoice_number', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.invoice_number}/></label><label className="block text-label">Date de facture<input type="date" value={data.invoiced_at} onChange={(e) => setData('invoiced_at', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.invoiced_at}/></label></div>
            <label className="block text-label">Lien vers la facture externe<input type="url" maxLength="2048" value={data.invoice_url} onChange={(e) => setData('invoice_url', e.target.value)} placeholder="https://…" className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.invoice_url}/></label>
            <div className="flex justify-end gap-2"><button type="button" disabled={processing} onClick={onClose} className="rounded-lg px-4 py-2 text-body text-sage">Annuler</button><button disabled={processing || prestations.length === 0} className="rounded-lg bg-ink px-5 py-2 text-body text-white disabled:opacity-50">{processing ? 'Enregistrement…' : 'Enregistrer'}</button></div>
        </form>
    </section></div>;
}

export default function Facturation({ encaissements = [], prestations = [], seuils = [] }) {
    const [annee, setAnnee] = useState(String(new Date().getFullYear()));
    const [formulaire, setFormulaire] = useState(null);
    const [message, setMessage] = useState('');
    const annees = [...new Set([String(new Date().getFullYear()), ...encaissements.flatMap((p) => [p.paiement?.slice(0, 4), p.echeance?.slice(0, 4)]).filter(Boolean)])].sort().reverse();
    const lignes = encaissements.filter((p) => annee === 'toutes' || (p.paiement ?? p.echeance)?.startsWith(annee));
    const total = cents(lignes) / 100;
    const regle = cents(lignes.filter((p) => status(p) === 'Réglé')) / 100;
    const enAttente = cents(lignes.filter((p) => status(p) === 'En attente')) / 100;
    const enRetard = cents(lignes.filter((p) => status(p) === 'En retard')) / 100;
    const dateReference = annee === 'toutes' ? null : annee === today().slice(0, 4) ? today() : `${annee}-12-31`;
    const seuilPour = (cle) => dateReference ? seuils.filter((seuil) => seuil.cle === cle && seuil.date <= dateReference).at(-1) : null;
    const seuilNormal = seuilPour('vat_threshold');
    const seuilMajore = seuilPour('vat_threshold_immediate');
    const csv = [['Mariage', 'Dossier', 'Type', 'Prestation', 'Montant', 'Échéance', 'Paiement', 'Statut', 'Numéro de facture'], ...lignes.map((p) => [p.couple, p.dossier, types[p.type] ?? p.type, p.prestation, p.montant, p.echeance, p.paiement, status(p), p.facture_numero])].map((row) => row.map(csvField).join(';')).join('\r\n');

    return <BackOfficeLayout actif="facturation" filAriane="Facturation & Encaissements">
        <Head title="Facturation & Encaissements"/>
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-caps uppercase text-sage">Suivi des paiements</p><h1 className="font-display text-3xl tracking-tight text-ink sm:text-display">Facturation &amp; Encaissements</h1><p className="mt-2 text-body text-sage">Les factures sont créées dans l’outil externe.</p></div><div className="flex flex-wrap gap-3"><label className="sr-only" htmlFor="exercice">Année</label><select id="exercice" value={annee} onChange={(e) => setAnnee(e.target.value)} className="rounded-lg border-hairline bg-white px-4 py-2 text-body"><option value="toutes">Toutes les années</option>{annees.map((year) => <option key={year}>{year}</option>)}</select><button type="button" onClick={() => { setMessage(''); setFormulaire({}); }} className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-label text-white`}><Icone nom="add"/>Ajouter un paiement</button></div></header>
            {message && <p role="status" className="rounded-lg border border-success/20 bg-success/10 p-3 text-body text-success">{message}</p>}
            <section className="overflow-hidden rounded-xl border border-hairline bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-4"><div><h2 className="font-display text-title-md">Grand Tableau des Encaissements</h2><p className="mt-1 text-body-sm text-sage">{lignes.length} paiement{lignes.length > 1 ? 's' : ''} · année du paiement ou, s’il n’est pas réglé, de l’échéance</p></div><a download={`encaissements-${annee}.csv`} href={`data:text/csv;charset=utf-8,${encodeURIComponent('\ufeff' + csv)}`} className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-body"><Icone nom="download"/>Exporter en CSV</a></div>
                <div className="divide-y divide-hairline 2xl:hidden">{lignes.map((p) => <article key={p.id} className="p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-display text-title-sm">{p.couple}</h3><p className="text-body-sm text-sage">Dossier {p.dossier}{p.lieu ? ` · ${p.lieu}` : ''}</p></div><span className={`rounded-full px-2.5 py-1 text-caps uppercase ${badge(status(p))}`}>{status(p)}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 text-body-sm"><div><dt className="text-sage">Prestation</dt><dd>{p.prestation}</dd></div><div><dt className="text-sage">Type</dt><dd>{types[p.type] ?? p.type}</dd></div><div><dt className="text-sage">Montant</dt><dd>{euro(p.montant)}</dd></div><div><dt className="text-sage">Échéance</dt><dd>{dateFr(p.echeance)}</dd></div><div><dt className="text-sage">Paiement</dt><dd>{dateFr(p.paiement)}</dd></div><div><dt className="text-sage">Facture</dt><dd>{p.facture_lien ? <a className="underline" href={p.facture_lien} target="_blank" rel="noreferrer">{p.facture_numero || 'Ouvrir le lien'}</a> : p.facture_numero || '—'}</dd></div></dl><button type="button" onClick={() => setFormulaire(p)} className="mt-3 text-body underline">Modifier</button></article>)}</div>
                <table className="hidden w-full table-fixed text-left text-[11px] leading-4 2xl:table"><thead className="bg-ivory text-caps uppercase text-sage"><tr>{['Mariage / dossier', 'Type', 'Prestation', 'Montant', 'Échéance', 'Paiement', 'Statut / facture'].map((heading) => <th key={heading} className="px-2 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-hairline">{lignes.map((p) => <tr key={p.id}><td className="break-words px-2 py-4"><strong>{p.couple}</strong><span className="block text-sage">Dossier {p.dossier}{p.lieu ? ` · ${p.lieu}` : ''}</span></td><td className="break-words px-2 py-4">{types[p.type] ?? p.type}</td><td className="break-words px-2 py-4">{p.prestation}</td><td className="break-words px-2 py-4">{euro(p.montant)}</td><td className="break-words px-2 py-4">{dateFr(p.echeance)}</td><td className="break-words px-2 py-4">{dateFr(p.paiement)}</td><td className="break-words px-2 py-4"><span className={`rounded-full px-2 py-1 ${badge(status(p))}`}>{status(p)}</span><div className="mt-2">{p.facture_lien ? <a href={p.facture_lien} target="_blank" rel="noreferrer" className="underline">{p.facture_numero || 'Facture'}</a> : p.facture_numero || '—'}</div><button type="button" onClick={() => setFormulaire(p)} className="mt-1 underline">Modifier</button></td></tr>)}</tbody></table>
                {lignes.length === 0 && <p className="p-8 text-center text-body text-sage">Aucun paiement pour cette sélection. Les paiements sans date sont visibles dans « Toutes les années ».</p>}
                <div className="flex flex-wrap justify-between gap-3 border-t border-hairline bg-ivory/70 px-5 py-4 text-body-sm"><span>Total : <strong>{euro(total)}</strong></span><span>Réglé : <strong>{euro(regle)}</strong></span><span>En attente : <strong>{euro(enAttente)}</strong></span><span>En retard : <strong>{euro(enRetard)}</strong></span></div>
            </section>
            <section className="rounded-xl border border-hairline bg-white p-5 shadow-sm"><h2 className="font-display text-title-sm">Suivi annuel des encaissements</h2>{annee === 'toutes' ? <p className="mt-2 text-body text-sage">Sélectionnez une année pour voir les seuils enregistrés.</p> : <><p className="mt-2 text-body">Encaissé en {annee} : <strong>{euro(regle)}</strong></p><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-sage"><span>Seuil enregistré : <strong className="text-ink">{seuilNormal ? euro(seuilNormal.valeur) : 'Non renseigné'}</strong></span><span>Seuil majoré enregistré : <strong className="text-ink">{seuilMajore ? euro(seuilMajore.valeur) : 'Non renseigné'}</strong></span></div><p className="mt-2 text-body-sm text-sage">Ces chiffres servent au suivi et ne déterminent pas à eux seuls le régime de TVA applicable.</p></>}</section>
        </div>
        {formulaire !== null && <FormulairePaiement
            paiement={formulaire.id ? formulaire : null}
            prestations={prestations}
            onClose={() => setFormulaire(null)}
            onSuccess={() => { setFormulaire(null); setMessage('Le paiement a été enregistré.'); }}
        />}
    </BackOfficeLayout>;
}
