import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const euro = (value) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
const dateFr = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR') : 'Non renseignée';
const cents = (items) => items.reduce((sum, item) => sum + Math.round(Number(item.montant ?? 0) * 100), 0);
const types = { deposit: 'Acompte', balance: 'Solde', amendment: 'Avenant' };

function Erreur({ message }) {
    return message ? <span role="alert" className="mt-1 block text-body-sm text-red-700">{message}</span> : null;
}

function FormulaireAvenant({ prestations, onClose, onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({ wedding_service_id: '', description: '', amount: '' });
    function submit(event) {
        event.preventDefault();
        post(route('mariages.amendments.store'), { preserveScroll: true, onSuccess });
    }

    return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="avenant-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h2 id="avenant-title" className="font-display text-title-md">Ajouter un avenant</h2><button type="button" disabled={processing} onClick={onClose} aria-label="Fermer"><Icone nom="close"/></button></div><p className="mt-2 text-body-sm text-sage">L’avenant sera enregistré en attente de signature.</p><form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-label">Prestation concernée *<select required value={data.wedding_service_id} onChange={(e) => setData('wedding_service_id', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"><option value="">Choisir une prestation</option>{prestations.map((p) => <option key={p.id} value={p.id}>{p.nom}{p.devis_numero ? ` — ${p.devis_numero}` : ''}</option>)}</select><Erreur message={errors.wedding_service_id}/></label>
        <label className="block text-label">Description *<textarea required maxLength="2000" rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.description}/></label>
        <label className="block text-label">Montant supplémentaire (€) *<input required type="number" min="0.01" max="99999999.99" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.amount}/></label>
        <div className="flex justify-end gap-2"><button type="button" disabled={processing} onClick={onClose} className="rounded-lg px-4 py-2 text-body text-sage">Annuler</button><button disabled={processing} className="rounded-lg bg-ink px-5 py-2 text-body text-white disabled:opacity-50">{processing ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </form></section></div>;
}

function FormulaireSignature({ avenant, onClose, onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({ signed_at: '', due_date: '' });
    function submit(event) {
        event.preventDefault();
        post(route('mariages.amendments.signature', avenant.id), { preserveScroll: true, onSuccess });
    }

    return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="signature-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><h2 id="signature-title" className="font-display text-title-md">Enregistrer une signature</h2><p className="mt-2 text-body-sm text-sage">Renseignez la date d’un avenant déjà signé. Un paiement à suivre sera ajouté pour {euro(avenant.montant)}.</p><form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-label">Date de signature *<input required type="date" value={data.signed_at} onChange={(e) => setData('signed_at', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.signed_at}/></label>
        <label className="block text-label">Échéance du paiement<input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body"/><Erreur message={errors.due_date}/></label>
        <div className="flex justify-end gap-2"><button type="button" disabled={processing} onClick={onClose} className="rounded-lg px-4 py-2 text-body text-sage">Annuler</button><button disabled={processing} className="rounded-lg bg-ink px-5 py-2 text-body text-white disabled:opacity-50">{processing ? 'Enregistrement…' : 'Enregistrer la date'}</button></div>
    </form></section></div>;
}

export default function PrestationsDevis({ mariages = [], mariage = null, prestations = [] }) {
    const [avenantOuvert, setAvenantOuvert] = useState(false);
    const [signature, setSignature] = useState(null);
    const [message, setMessage] = useState('');
    const avenants = prestations.flatMap((p) => p.avenants.map((a) => ({ ...a, prestation: p.nom })));
    const signes = avenants.filter((a) => a.signe);
    const totalInitial = cents(prestations) / 100;
    const totalSigne = cents(signes) / 100;
    const montantsManquants = prestations.some((p) => p.montant === null);

    function choisirMariage(event) {
        const weddingId = event.target.value;
        router.get(route('mariages.prestations'), weddingId ? { wedding_id: weddingId } : {}, { preserveState: false });
    }

    return <BackOfficeLayout actif="prestations" filAriane="Prestations & devis">
        <Head title="Prestations & devis"/>
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-caps uppercase text-sage">Suivi des dossiers</p><h1 className="mt-1 font-display text-3xl tracking-tight sm:text-display">Prestations &amp; devis</h1><p className="mt-2 text-body text-sage">Chaque prestation possède son propre devis et ses paiements.</p></div><label className="block text-label">Dossier mariage<select value={mariage?.id ?? ''} onChange={choisirMariage} className="mt-1 block w-full min-w-64 rounded-lg border-hairline bg-white text-body"><option value="">Choisir un mariage</option>{mariages.map((item) => <option key={item.id} value={item.id}>{item.nom} — dossier {item.id}{item.date ? ` (${dateFr(item.date)})` : ''}</option>)}</select></label></header>
            {!mariage && <p className="rounded-xl border border-hairline bg-white p-6 text-body text-sage">Choisissez un mariage pour afficher ses prestations, devis et avenants.</p>}
            {mariage && <>
                <section className="rounded-xl border border-hairline bg-white p-5"><p className="text-caps uppercase text-sage">Dossier {mariage.id} · Mariage : {dateFr(mariage.date)}</p><h2 className="mt-1 font-display text-title-md">{mariage.nom}</h2><p className="mt-1 text-body-sm text-sage">{mariage.lieu || 'Lieu non renseigné'}{mariage.convives !== null ? ` · ${mariage.convives} convives` : ''}</p><Link href={route('facturation.index')} className="mt-3 inline-block text-body underline">Voir les encaissements</Link></section>
                {message && <p role="status" className="rounded-lg border border-success/20 bg-success/10 p-3 text-body text-success">{message}</p>}
                <section className="overflow-hidden rounded-xl border border-hairline bg-white shadow-sm"><div className="bg-ivory/70 p-6"><p className="text-caps uppercase text-sage">Prestations du dossier</p><h2 className="font-display text-title-md">Devis et paiements</h2></div>
                    {prestations.length === 0 && <p className="p-6 text-body text-sage">Aucune prestation enregistrée pour ce mariage.</p>}
                    <div className="divide-y divide-hairline">{prestations.map((p) => <article key={p.id} className="p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-display text-title-sm">{p.nom}</h3><p className="mt-1 text-body-sm text-sage">Devis : {p.devis_numero || 'numéro non renseigné'} · Envoyé : {dateFr(p.devis_envoye)} · Valide jusqu’au : {dateFr(p.devis_valide_jusquau)} · Accepté : {dateFr(p.devis_accepte)} · Contrat signé : {dateFr(p.contrat_signe)}</p></div><strong className="font-display text-title-sm">{p.montant === null ? 'Montant non renseigné' : euro(p.montant)}</strong></div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{p.paiements.length ? p.paiements.map((payment) => <div key={payment.id} className="rounded-lg bg-ivory p-3 text-body-sm"><strong>{types[payment.type] ?? payment.type} · {euro(payment.montant)}</strong><p className="mt-1 text-sage">{payment.paye ? `Payé le ${dateFr(payment.paye)}` : `À régler · échéance : ${dateFr(payment.echeance)}`}</p></div>) : <p className="text-body-sm text-sage">Aucun paiement enregistré.</p>}</div>
                    </article>)}</div>
                    {prestations.length > 0 && <div className="border-t border-hairline bg-ivory/50 px-6 py-4 text-body">Total initial renseigné : <strong>{euro(totalInitial)}</strong>{montantsManquants && <span className="ml-2 text-body-sm text-sage">Certains montants ne sont pas renseignés.</span>}</div>}
                </section>
                <section className="rounded-xl border border-hairline bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-caps uppercase text-sage">Suivi de contractualisation</p><h2 className="font-display text-title-md">Historique des avenants</h2></div><button type="button" disabled={prestations.length === 0} onClick={() => { setMessage(''); setAvenantOuvert(true); }} className={`${anneauFocus} inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-label text-white disabled:opacity-50`}><Icone nom="add"/>Ajouter un avenant</button></div>
                    {avenants.length === 0 ? <p className="mt-5 text-body text-sage">Aucun avenant enregistré.</p> : <div className="mt-5 space-y-3">{avenants.map((a) => <article key={a.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-ivory/60 p-4"><div><p className="font-medium">{a.prestation} · {a.signe ? `Signé le ${dateFr(a.signe)}` : 'En attente de signature'}</p><p className="mt-1 text-body">{a.description}</p></div><div><strong>{euro(a.montant)}</strong>{!a.signe && <button type="button" onClick={() => setSignature(a)} className="ml-3 text-body underline">Enregistrer la signature</button>}</div></article>)}</div>}
                    <div className="mt-5 rounded-xl bg-blush p-5 text-body"><strong>Total initial + avenants signés : {euro(totalInitial + totalSigne)}</strong><p className="mt-1 text-body-sm text-sage">Les avenants en attente ne sont pas inclus.{montantsManquants ? ' Certains montants initiaux manquent.' : ''}</p></div>
                </section>
            </>}
        </div>
        {avenantOuvert && <FormulaireAvenant
            prestations={prestations}
            onClose={() => setAvenantOuvert(false)}
            onSuccess={() => { setAvenantOuvert(false); setMessage('L’avenant a été enregistré en attente de signature.'); }}
        />}
        {signature && <FormulaireSignature
            avenant={signature}
            onClose={() => setSignature(null)}
            onSuccess={() => { setSignature(null); setMessage('La date de signature et le paiement associé ont été enregistrés.'); }}
        />}
    </BackOfficeLayout>;
}
