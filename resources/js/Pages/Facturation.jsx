import Icone from '@/Components/Icone';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { dateExercice, filtrerEncaissements } from '@/Pages/filtreEncaissements';
import { DialogTitle } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const typesPaiement = { deposit: 'Acompte', balance: 'Solde', amendment: 'Avenant' };
const euro = (valeur) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(valeur);
const dateFr = (date) => date ? new Date(date.slice(0, 10) + 'T12:00:00').toLocaleDateString('fr-FR') : '—';
const nomCouple = (ligne) => [ligne.partner1_first_name, ligne.partner2_first_name].filter(Boolean).join(' & ');
const statutPaiement = (ligne, aujourdHui) => ligne.paid_at ? 'Réglé' : ligne.due_date && ligne.due_date < aujourdHui ? 'En retard' : 'En attente';
const classeChamp = 'mt-1 w-full rounded-lg border-hairline text-body';

function celluleCsv(valeur) {
    let texte = String(valeur ?? '');
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(texte)) {
        texte = "'" + texte;
    }
    return '"' + texte.replaceAll('"', '""') + '"';
}

function Champ({ titre, erreur, children }) {
    return <label className="block text-label">{titre}{children}<InputError message={erreur} className="mt-1" /></label>;
}

export default function Facturation({ payments, services, today, seuils = [] }) {
    const { url } = usePage();
    const dossierDansUrl = new URLSearchParams(url.split('?')[1] ?? '').get('wedding_id');
    const [dossier] = useState(/^\d+$/.test(dossierDansUrl ?? '') ? dossierDansUrl : null);
    const [annee, setAnnee] = useState(dossierDansUrl && /^\d+$/.test(dossierDansUrl) ? 'toutes' : today.slice(0, 4));
    const [factureOuverte, setFactureOuverte] = useState(false);
    const [paiementSelectionne, setPaiementSelectionne] = useState(null);
    const [paiementSansFacture, setPaiementSansFacture] = useState(null);
    const facture = useForm({ wedding_service_id: '', type: 'deposit', amount: '', due_date: today, invoice_number: '', invoice_url: '', invoiced_at: today, paid_at: '' });
    const reglement = useForm({ paid_at: today });
    const reference = useForm({ invoice_number: '', invoice_url: '', invoiced_at: today });
    const annees = useMemo(() => [...new Set([today.slice(0, 4), ...payments.map((ligne) => dateExercice(ligne).slice(0, 4) || 'sans-date')])].sort().reverse(), [payments, today]);
    const encaissements = useMemo(() => filtrerEncaissements(payments, annee, dossier), [payments, annee, dossier]);
    const totaux = useMemo(() => encaissements.reduce((resultat, ligne) => {
        const centimes = Math.round(Number(ligne.amount) * 100);
        resultat.total += centimes;
        resultat[statutPaiement(ligne, today)] += centimes;
        return resultat;
    }, { total: 0, 'Réglé': 0, 'En attente': 0, 'En retard': 0 }), [encaissements, today]);
    const dateReference = /^\d{4}$/.test(annee) ? (annee === today.slice(0, 4) ? today : annee + '-12-31') : null;
    const seuilPour = (cle) => dateReference ? seuils.filter((seuil) => seuil.cle === cle && seuil.date <= dateReference).at(-1) : null;
    const seuilNormal = seuilPour('vat_threshold');
    const seuilMajore = seuilPour('vat_threshold_immediate');
    const csv = '\uFEFF' + [
        ['Mariage', 'Dossier', 'Facture', 'Type', 'Prestation', 'Montant', 'Échéance', 'Paiement', 'Statut'],
        ...encaissements.map((ligne) => [nomCouple(ligne), 'DOS-' + ligne.wedding_id, ligne.invoice_number, typesPaiement[ligne.type] ?? ligne.type, ligne.service_name, ligne.amount, ligne.due_date, ligne.paid_at, statutPaiement(ligne, today)]),
    ].map((ligne) => ligne.map(celluleCsv).join(';')).join('\r\n');

    const fermerFacture = () => {
        if (!facture.processing) {
            setFactureOuverte(false);
        }
    };
    const enregistrerFacture = (event) => {
        event.preventDefault();
        facture.post(route('facturation.payments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setAnnee((facture.data.paid_at || facture.data.due_date).slice(0, 4));
                setFactureOuverte(false);
                facture.reset();
            },
        });
    };
    const ouvrirReglement = (ligne) => {
        reglement.clearErrors();
        reglement.setData('paid_at', ligne.paid_at ?? today);
        setPaiementSelectionne(ligne);
    };
    const enregistrerReglement = (event) => {
        event.preventDefault();
        reglement.patch(route('facturation.payments.update', paiementSelectionne.id), {
            preserveScroll: true,
            onSuccess: () => setPaiementSelectionne(null),
        });
    };
    const ouvrirReference = (ligne) => {
        reference.reset();
        reference.clearErrors();
        reference.setData({ invoice_number: '', invoice_url: ligne.invoice_url ?? '', invoiced_at: ligne.invoiced_at?.slice(0, 10) ?? today });
        setPaiementSansFacture(ligne);
    };
    const enregistrerReference = (event) => {
        event.preventDefault();
        reference.patch(route('facturation.payments.invoice', paiementSansFacture.id), {
            preserveScroll: true,
            onSuccess: () => setPaiementSansFacture(null),
        });
    };

    return <BackOfficeLayout actif="facturation" filAriane="Facturation & Encaissements">
        <Head title="Facturation & Encaissements" />
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="mb-1 text-caps uppercase text-sage">Tenue de livres · {annee === 'toutes' ? 'Toutes les années' : `Exercice ${annee}`}</p><h1 className="font-display text-3xl tracking-tight text-ink sm:text-display">Facturation &amp; Encaissements</h1></div>
                <div className="flex flex-wrap gap-3">
                    <label className="sr-only" htmlFor="exercice">Exercice</label>
                    <select id="exercice" value={annee} onChange={(event) => setAnnee(event.target.value)} className="rounded-lg border-hairline bg-white px-4 py-2 text-body"><option value="toutes">Toutes les années</option>{annees.map((valeur) => <option key={valeur} value={valeur}>{valeur === 'sans-date' ? 'Sans date' : valeur}</option>)}</select>
                    <button type="button" disabled={services.length === 0} onClick={() => { facture.clearErrors(); setFactureOuverte(true); }} className={anneauFocus + ' inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-label text-white disabled:opacity-50'}><Icone nom="add" />Enregistrer une facture</button>
                </div>
            </header>
            {dossier && <p className="rounded-xl border border-hairline bg-white p-4 text-body">Encaissements du dossier DOS-{dossier}. <Link href={route('facturation.index')} className="underline">Voir tous les dossiers</Link></p>}
            {services.length === 0 && <p className="rounded-xl border border-hairline bg-white p-4 text-body text-sage">Aucune prestation n’est encore rattachée à un dossier mariage. Une facture doit être associée à une prestation existante.</p>}
            <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="min-w-0 overflow-hidden rounded-xl border border-hairline bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-5 py-4"><h2 className="font-display text-title-md">Grand tableau des encaissements</h2><span className="rounded-full bg-ivory px-2.5 py-1 text-body-sm text-sage">{encaissements.length} écritures</span></div>
                    {encaissements.length === 0 ? <p className="p-8 text-center text-body text-sage">Aucun encaissement pour cette sélection.</p> : <>
                        <div className="divide-y divide-hairline 2xl:hidden">{encaissements.map((ligne) => {
                            const statut = statutPaiement(ligne, today);
                            return <article key={ligne.id} className="p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-display text-title-sm">{nomCouple(ligne)}</h3><p className="text-body-sm text-sage">DOS-{ligne.wedding_id} · {ligne.venue_name ?? 'Lieu à préciser'}</p></div><span className={'rounded-full px-2 py-1 text-caps ' + (statut === 'Réglé' ? 'bg-success/10 text-success' : statut === 'En retard' ? 'bg-warning/10 text-warning' : 'bg-ivory text-sage')}>{statut}</span></div>
                                <dl className="mt-4 grid grid-cols-2 gap-3 text-body-sm"><div><dt className="text-sage">Type / prestation</dt><dd>{typesPaiement[ligne.type] ?? ligne.type} · {ligne.service_name}</dd></div><div><dt className="text-sage">Montant</dt><dd>{euro(ligne.amount)}</dd></div><div><dt className="text-sage">Échéance</dt><dd>{dateFr(ligne.due_date)}</dd></div><div><dt className="text-sage">Paiement</dt><dd>{dateFr(ligne.paid_at)}</dd></div><div><dt className="text-sage">Facture</dt><dd>{/^https?:\/\//i.test(ligne.invoice_url ?? '') ? <a href={ligne.invoice_url} target="_blank" rel="noopener noreferrer" className="underline">{ligne.invoice_number ?? 'Ouvrir la facture'}</a> : ligne.invoice_number ?? '—'}</dd></div></dl>
                                <div className="mt-3 flex flex-wrap gap-4"><button type="button" onClick={() => ouvrirReglement(ligne)} className={anneauFocus + ' text-body underline'}>{ligne.paid_at ? 'Modifier le règlement' : 'Saisir le règlement'}</button>{!ligne.invoice_number && <button type="button" onClick={() => ouvrirReference(ligne)} className={anneauFocus + ' text-body underline'}>Ajouter la facture</button>}</div></article>;
                        })}</div>
                        <table className="hidden w-full table-fixed text-left text-[11px] leading-4 2xl:table">
                            <thead className="bg-ivory text-caps uppercase text-sage"><tr>{['Mariage / dossier', 'Facture', 'Type / prestation', 'Montant', 'Échéance', 'Paiement', 'Statut / action'].map((titre) => <th key={titre} className="break-words px-2 py-3 font-semibold">{titre}</th>)}</tr></thead>
                            <tbody className="divide-y divide-hairline">{encaissements.map((ligne) => {
                                const statut = statutPaiement(ligne, today);
                                return <tr key={ligne.id}>
                                    <td className="break-words px-2 py-4"><span className="block font-display text-body">{nomCouple(ligne)}</span><span className="text-sage">DOS-{ligne.wedding_id} · {ligne.venue_name ?? 'Lieu à préciser'}</span></td>
                                    <td className="break-words px-2 py-4">{/^https?:\/\//i.test(ligne.invoice_url ?? '') ? <a href={ligne.invoice_url} target="_blank" rel="noopener noreferrer" className={anneauFocus + ' underline'}>{ligne.invoice_number ?? 'Ouvrir la facture'}</a> : ligne.invoice_number ?? '—'}</td>
                                    <td className="break-words px-2 py-4">{typesPaiement[ligne.type] ?? ligne.type}<span className="block text-sage">{ligne.service_name}</span></td>
                                    <td className="break-words px-2 py-4 font-display">{euro(ligne.amount)}</td><td className="break-words px-2 py-4 text-sage">{dateFr(ligne.due_date)}</td><td className="break-words px-2 py-4 text-sage">{dateFr(ligne.paid_at)}</td>
                                    <td className="break-words px-2 py-4"><span className={'rounded-full px-2 py-1 text-caps ' + (statut === 'Réglé' ? 'bg-success/10 text-success' : statut === 'En retard' ? 'bg-warning/10 text-warning' : 'bg-ivory text-sage')}>{statut}</span><button type="button" onClick={() => ouvrirReglement(ligne)} className={anneauFocus + ' mt-2 block underline'}>{ligne.paid_at ? 'Modifier le règlement' : 'Saisir le règlement'}</button>{!ligne.invoice_number && <button type="button" onClick={() => ouvrirReference(ligne)} className={anneauFocus + ' mt-1 block underline'}>Ajouter la facture</button>}</td>
                                </tr>;
                            })}</tbody>
                        </table>
                    </>}
                    <div className="flex flex-wrap gap-4 border-t border-hairline bg-ivory/70 px-5 py-4 text-body-sm">
                        <span>Total : <strong>{euro(totaux.total / 100)}</strong></span><span>Réglé : <strong className="text-success">{euro(totaux['Réglé'] / 100)}</strong></span><span>En attente : <strong>{euro(totaux['En attente'] / 100)}</strong></span><span>En retard : <strong className="text-warning">{euro(totaux['En retard'] / 100)}</strong></span>
                    </div>
                </section>
                <aside className="rounded-xl border border-hairline bg-white p-6 shadow-sm">
                    <p className="text-caps uppercase text-sage">Synthèse des encaissements · {annee === 'toutes' ? 'Toutes les années' : annee}</p><p className="mt-4 font-display text-display">{euro(totaux['Réglé'] / 100)}</p><p className="mt-2 text-body text-sage">Montant reçu pour la sélection, selon la date de paiement renseignée.</p>
                    <p className="mt-4 text-body-sm text-sage">Les écritures non réglées sont classées selon leur date d’échéance. Les factures restent produites dans votre outil de facturation ; enregistrez ici leur numéro et leur lien.</p>
                    {dateReference && <div className="mt-4 space-y-1 text-body-sm text-sage"><p>Seuil enregistré : <strong className="text-ink">{seuilNormal ? euro(seuilNormal.valeur) : 'Non renseigné'}</strong></p><p>Seuil majoré enregistré : <strong className="text-ink">{seuilMajore ? euro(seuilMajore.valeur) : 'Non renseigné'}</strong></p><p>Ces chiffres ne déterminent pas à eux seuls le régime de TVA applicable.</p></div>}
                    <a download={'grand-livre-' + annee + '.csv'} href={'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)} className={anneauFocus + ' mt-5 flex items-center justify-center gap-2 rounded-lg border border-hairline px-3 py-2 text-body hover:bg-ivory'}><Icone nom="download" />Exporter le grand livre (CSV)</a>
                </aside>
            </div>
        </div>
        <Modal show={factureOuverte} onClose={fermerFacture} closeable={!facture.processing} maxWidth="2xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                <DialogTitle className="font-display text-title-md">Enregistrer une facture</DialogTitle>
                <form className="mt-5 space-y-4" onSubmit={enregistrerFacture}>
                    <Champ titre="Dossier / prestation" erreur={facture.errors.wedding_service_id}><select required value={facture.data.wedding_service_id} onChange={(event) => facture.setData('wedding_service_id', event.target.value)} className={classeChamp}><option value="">Choisir une prestation</option>{services.map((service) => <option key={service.id} value={service.id}>{nomCouple(service)} · DOS-{service.wedding_id} · {service.service_name}</option>)}</select></Champ>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Champ titre="Numéro de facture" erreur={facture.errors.invoice_number}><input required maxLength={255} value={facture.data.invoice_number} onChange={(event) => facture.setData('invoice_number', event.target.value)} className={classeChamp} /></Champ>
                        <Champ titre="Type de paiement" erreur={facture.errors.type}><select value={facture.data.type} onChange={(event) => facture.setData('type', event.target.value)} className={classeChamp}>{Object.entries(typesPaiement).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Champ>
                        <Champ titre="Montant TTC (€)" erreur={facture.errors.amount}><input required type="number" min="0.01" max="99999999.99" step="0.01" value={facture.data.amount} onChange={(event) => facture.setData('amount', event.target.value)} className={classeChamp} /></Champ>
                        <Champ titre="Date de facturation" erreur={facture.errors.invoiced_at}><input required type="date" value={facture.data.invoiced_at} onChange={(event) => facture.setData('invoiced_at', event.target.value)} className={classeChamp} /></Champ>
                        <Champ titre="Date d’échéance" erreur={facture.errors.due_date}><input required type="date" value={facture.data.due_date} onChange={(event) => facture.setData('due_date', event.target.value)} className={classeChamp} /></Champ>
                        <Champ titre="Date de paiement (facultative)" erreur={facture.errors.paid_at}><input type="date" max={today} value={facture.data.paid_at} onChange={(event) => facture.setData('paid_at', event.target.value)} className={classeChamp} /></Champ>
                    </div>
                    <Champ titre="Lien de la facture (facultatif)" erreur={facture.errors.invoice_url}><input type="url" maxLength={2048} value={facture.data.invoice_url} onChange={(event) => facture.setData('invoice_url', event.target.value)} className={classeChamp} /></Champ>
                    <div className="flex justify-end gap-2 pt-2"><button type="button" disabled={facture.processing} onClick={fermerFacture} className={anneauFocus + ' rounded-lg px-4 py-2 text-body text-sage'}>Annuler</button><button disabled={facture.processing} className={anneauFocus + ' rounded-lg bg-ink px-4 py-2 text-body text-white disabled:opacity-50'}>{facture.processing ? 'Enregistrement…' : 'Enregistrer'}</button></div>
                </form>
            </div>
        </Modal>
        <Modal show={paiementSelectionne !== null} onClose={() => { if (!reglement.processing) { setPaiementSelectionne(null); } }} closeable={!reglement.processing} maxWidth="lg">
            <form className="space-y-4 p-6" onSubmit={enregistrerReglement}>
                <DialogTitle className="font-display text-title-md">Règlement de la facture {paiementSelectionne?.invoice_number}</DialogTitle>
                <Champ titre="Date de paiement" erreur={reglement.errors.paid_at}><input type="date" max={today} value={reglement.data.paid_at} onChange={(event) => reglement.setData('paid_at', event.target.value)} className={classeChamp} /></Champ>
                <p className="text-body-sm text-sage">Laissez la date vide pour indiquer que le paiement n’a pas été reçu.</p>
                <div className="flex justify-end gap-2"><button type="button" disabled={reglement.processing} onClick={() => setPaiementSelectionne(null)} className={anneauFocus + ' px-4 py-2 text-body text-sage'}>Annuler</button><button disabled={reglement.processing} className={anneauFocus + ' rounded-lg bg-ink px-4 py-2 text-body text-white disabled:opacity-50'}>{reglement.processing ? 'Enregistrement…' : 'Enregistrer'}</button></div>
            </form>
        </Modal>
        <Modal show={paiementSansFacture !== null} onClose={() => { if (!reference.processing) { setPaiementSansFacture(null); } }} closeable={!reference.processing} maxWidth="lg">
            <form className="space-y-4 p-6" onSubmit={enregistrerReference}>
                <DialogTitle className="font-display text-title-md">Ajouter une facture externe</DialogTitle>
                <p className="text-body-sm text-sage">Renseignez la facture correspondant à ce paiement. Elle est créée dans l’outil externe.</p>
                <Champ titre="Numéro de facture" erreur={reference.errors.invoice_number}><input required maxLength={255} value={reference.data.invoice_number} onChange={(event) => reference.setData('invoice_number', event.target.value)} className={classeChamp} /></Champ>
                <Champ titre="Date de facturation" erreur={reference.errors.invoiced_at}><input required type="date" value={reference.data.invoiced_at} onChange={(event) => reference.setData('invoiced_at', event.target.value)} className={classeChamp} /></Champ>
                <Champ titre="Lien de la facture (facultatif)" erreur={reference.errors.invoice_url}><input type="url" maxLength={2048} value={reference.data.invoice_url} onChange={(event) => reference.setData('invoice_url', event.target.value)} className={classeChamp} /></Champ>
                <div className="flex justify-end gap-2"><button type="button" disabled={reference.processing} onClick={() => setPaiementSansFacture(null)} className={anneauFocus + ' px-4 py-2 text-body text-sage'}>Annuler</button><button disabled={reference.processing} className={anneauFocus + ' rounded-lg bg-ink px-4 py-2 text-body text-white disabled:opacity-50'}>{reference.processing ? 'Enregistrement…' : 'Enregistrer'}</button></div>
            </form>
        </Modal>
    </BackOfficeLayout>;
}
