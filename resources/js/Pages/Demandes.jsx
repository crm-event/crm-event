import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const CLE_STOCKAGE = 'crm-event.demandes.v1';
const CLASSES_LARGEUR_PIPELINE = 'w-full min-w-[1540px]';
const ETAPES = [
    { cle: 'nouveau', libelle: 'Nouveau', couleur: 'bg-sage' },
    { cle: 'qualifie', libelle: 'Qualifié', couleur: 'bg-success' },
    { cle: 'devis', libelle: 'Devis envoyé', couleur: 'bg-ink' },
    { cle: 'relance', libelle: 'Relancé', couleur: 'bg-warning' },
    { cle: 'signe', libelle: 'Signé', couleur: 'bg-success' },
    { cle: 'perdu', libelle: 'Perdu', couleur: 'bg-subtle' },
];
const MOTIFS_PERTE = [
    { cle: 'prix', libelle: 'Prix trop élevé' },
    { cle: 'autre_wp', libelle: 'Autre wedding planner choisi' },
    { cle: 'date_indisponible', libelle: 'Date indisponible' },
    { cle: 'sans_reponse', libelle: 'Sans réponse après relances' },
    { cle: 'autre', libelle: 'Autre raison' },
];
const euros = (montant) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
}).format(montant);

function dateFrancaise(date) {
    if (!date) {
        return 'Date à préciser';
    }

    return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function lireDemandesLocales() {
    try {
        const donnees = JSON.parse(window.localStorage.getItem(CLE_STOCKAGE) ?? '[]');
        if (!Array.isArray(donnees)) {
            return [];
        }
        return donnees.filter((demande) => typeof demande?.id === 'string' && /^demande-[a-zA-Z0-9-]+$/.test(demande.id)).map((demande) => ({
            id: demande.id,
            nom: demande.nom,
            date: demande.date || null,
            lieu: demande.lieu || null,
            budget: demande.budget ?? null,
            prestations: Array.isArray(demande.prestations) ? demande.prestations.map(String) : [],
            statut: demande.statut ?? 'nouveau',
            notes: Array.isArray(demande.notes) ? demande.notes : [],
            motifPerte: demande.motifPerte || null,
            email: demande.email || null,
            telephone: demande.telephone || null,
            origine: demande.origine || null,
        }));
    } catch {
        return [];
    }
}

function Prestations({ valeurs, catalogue }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {valeurs.map((cle) => (
                <span key={cle} className="rounded-full bg-ivory px-2 py-0.5 text-[10px] uppercase text-sage">
                    {catalogue.find((prestation) => prestation.cle === cle)?.libelle ?? cle}
                </span>
            ))}
        </div>
    );
}

function CarteDemande({ demande, onOuvrir, catalogue }) {
    const estPerdue = demande.statut === 'perdu';
    const estSignee = demande.statut === 'signe';
    const etiquette = estPerdue ? 'Perdu' : estSignee ? 'Signé' : demande.repere;

    return (
        <button
            type="button"
            onClick={() => onOuvrir(demande.id)}
            className={`${anneauFocus} group flex min-h-[225px] w-full flex-col justify-between overflow-hidden rounded-lg border border-hairline bg-white text-left shadow-sm transition-shadow hover:shadow-md ${estPerdue ? 'opacity-70 hover:opacity-100' : ''}`}
        >
            <div className="w-full space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-display text-[20px] leading-6 text-ink group-hover:text-warning ${estPerdue ? 'line-through decoration-subtle' : ''}`}>{demande.nom}</h3>
                    {etiquette && <span className={`shrink-0 text-[9px] uppercase ${estSignee ? 'rounded bg-success/15 px-1.5 py-1 font-semibold text-success' : estPerdue ? 'rounded bg-ivory px-1.5 py-1 text-sage' : 'text-warning'}`}>{etiquette}</span>}
                </div>
                <p className="flex items-start gap-1 text-body-sm text-sage">
                    <Icone nom="location_on" className="text-[15px]" />
                    <span className="truncate">{dateFrancaise(demande.date)} · {demande.lieu || 'Lieu à préciser'}</span>
                </p>
                <Prestations valeurs={demande.prestations} catalogue={catalogue} />
                {estPerdue && demande.motifPerte && <p className="rounded bg-ivory p-2 text-[11px] uppercase text-sage">Motif : {demande.motifPerte}</p>}
            </div>
            <div className="flex w-full items-center justify-between gap-2 bg-ivory/50 px-4 py-2.5">
                <span className="text-[10px] uppercase text-sage">{'Budget estimé'}</span>
                <span className={`font-display text-[18px] ${estSignee ? 'text-success' : 'text-ink'}`}>{demande.budget === null ? 'À préciser' : euros(demande.budget)}</span>
            </div>
        </button>
    );
}

function TiroirDemande({ demande, onFermer, onModifier, catalogue, enCours, erreurs }) {
    const motifConnu = MOTIFS_PERTE.find((raison) => raison.libelle === demande.motifPerte);
    const [motif, setMotif] = useState(() => demande.motifPerteType ?? motifConnu?.cle ?? (demande.motifPerte ? 'autre' : ''));
    const [motifLibre, setMotifLibre] = useState(() => demande.motifPerteType === 'autre' || (!motifConnu && demande.motifPerte) ? demande.motifPerte ?? '' : '');
    const [note, setNote] = useState('');
    const [perteEnCours, setPerteEnCours] = useState(false);

    useEffect(() => {
        const fermerAvecEchap = (event) => {
            if (event.key === 'Escape') {
                onFermer();
            }
        };
        window.addEventListener('keydown', fermerAvecEchap);
        return () => window.removeEventListener('keydown', fermerAvecEchap);
    }, [onFermer]);

    const ajouterNote = (event) => {
        event.preventDefault();
        if (note.trim()) {
            onModifier(demande.id, { note: note.trim() }, () => setNote(''));
        }
    };

    const enregistrerMotif = () => {
        const raison = motif === 'autre'
            ? motifLibre.trim()
            : MOTIFS_PERTE.find((option) => option.cle === motif)?.libelle;

        if (raison) {
            onModifier(demande.id, { statut: 'perdu', motifPerte: raison }, () => setPerteEnCours(false));
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-blush/65 backdrop-blur-[3px] lg:left-sidebar lg:top-20" onClick={onFermer}>
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={`Fiche prospect : ${demande.nom}`}
                onClick={(event) => event.stopPropagation()}
                className="absolute inset-y-0 right-0 flex w-full max-w-[540px] flex-col border-l border-hairline bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between gap-3 border-b border-hairline p-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2"><p className="text-[10px] uppercase tracking-widest text-sage">Dossier prospect · {demande.reference ?? demande.id.slice(0, 18)}</p>{demande.region && <span className="rounded-full border border-subtle bg-blush px-2 py-0.5 text-[9px] uppercase text-sage">{demande.region}</span>}</div>
                        <h2 className="mt-3 font-display text-[30px] leading-tight text-ink">{demande.nomComplet ?? demande.nom}</h2>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-body-sm text-sage">
                            <Icone nom="calendar_today" className="text-[16px]" /> {dateFrancaise(demande.date)}
                            <Icone nom="location_on" className="text-[16px]" /> {demande.lieu || 'Lieu à préciser'}
                        </p>
                    </div>
                    <button type="button" aria-label="Fermer la fiche" onClick={onFermer} className={`${anneauFocus} rounded-lg p-1 text-sage hover:bg-ivory hover:text-ink`}>
                        <Icone nom="close" className="text-[20px]" />
                    </button>
                </div>

                <div className="overflow-x-auto border-b border-hairline bg-ivory px-4 py-4">
                    <div className="flex min-w-[460px] justify-between gap-2">
                        {ETAPES.map((etape, index) => (
                            <button
                                key={etape.cle}
                                type="button"
                                aria-current={demande.statut === etape.cle ? 'step' : undefined}
                                disabled={enCours}
                                onClick={() => { if (etape.cle === 'perdu') { setPerteEnCours(true); } else { onModifier(demande.id, { statut: etape.cle }, () => setPerteEnCours(false)); } }}
                                className={`${anneauFocus} flex flex-col items-center gap-1.5 text-center text-[9px] uppercase tracking-wider ${demande.statut === etape.cle ? 'font-semibold text-ink' : 'text-sage hover:text-ink'}`}
                            >
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${demande.statut === etape.cle ? 'border-ink bg-ink text-white' : 'border-subtle bg-white'}`}>
                                    {demande.statut === etape.cle ? <span className="h-2 w-2 rounded-full bg-white" /> : index < ETAPES.findIndex((etapeActive) => etapeActive.cle === demande.statut) && demande.statut !== 'perdu' ? <Icone nom="check" className="text-[13px] text-sage" /> : <span className="h-1.5 w-1.5 rounded-full bg-subtle" />}
                                </span>
                                {etape.libelle}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {Object.keys(erreurs).length > 0 && <p role="alert" className="text-body text-warning">{Object.values(erreurs)[0]}</p>}
                    <section>
                        <h3 className="mb-2 text-caps uppercase text-sage">Coordonnées &amp; acquisition</h3>
                        <div className="grid gap-4 rounded-lg border border-hairline bg-ivory/70 p-4 sm:grid-cols-2">
                            <div><span className="block text-[11px] text-sage">Courriel</span>{demande.email ? <a className="break-all text-body text-ink hover:underline" href={`mailto:${demande.email}`}>{demande.email}</a> : <span className="text-body text-sage">Non renseigné</span>}</div>
                            <div><span className="block text-[11px] text-sage">Téléphone</span>{demande.telephone ? <a className="text-body text-ink hover:underline" href={`tel:${demande.telephone.replace(/\s/g, '')}`}>{demande.telephone}</a> : <span className="text-body text-sage">Non renseigné</span>}</div>
                            <div className="border-t border-hairline pt-3 sm:col-span-2"><span className="mr-3 text-[11px] text-sage">Canal d’entrée</span><span className="text-body text-ink">{demande.origine || 'Non renseigné'}</span></div>
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-2 text-caps uppercase text-sage">Prestations sélectionnées</h3>
                        <div className="space-y-2">
                            {catalogue.map((prestation) => {
                                const retenue = demande.prestations.includes(prestation.cle);
                                return <div key={prestation.cle} className={`flex items-center justify-between gap-3 rounded-lg border border-hairline p-3 text-body ${retenue ? 'bg-white text-ink' : 'bg-ivory/30 text-sage'}`}><span>{prestation.libelle}</span><span className="text-[10px] uppercase">{retenue ? 'Retenue' : 'Non retenue'}</span></div>;
                            })}
                            {catalogue.length === 0 && <p className="text-body-sm text-sage">Aucune prestation au catalogue.</p>}
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-2 text-caps uppercase text-sage">Devis &amp; propositions du dossier</h3>
                        <div className="space-y-2">
                            {demande.devis.map((devis) => <div key={devis.id} className="rounded-lg border border-hairline p-3 text-body"><p>{devis.numero ?? 'Numéro de devis non renseigné'} · {devis.prestation}</p><p className="mt-1 text-body-sm text-sage">{devis.montant === null ? 'Montant à préciser' : euros(devis.montant)} · {devis.envoyeLe ? 'Envoyé le ' + dateFrancaise(devis.envoyeLe) : 'Date d’envoi non renseignée'}</p></div>)}
                            {demande.propositions.map((proposition) => <div key={proposition.id} className="rounded-lg border border-hairline p-3 text-body">{proposition.title} · Version {proposition.version}</div>)}
                            {demande.devis.length === 0 && demande.propositions.length === 0 && <p className="text-body-sm text-sage">Aucun devis ni proposition enregistré pour ce dossier.</p>}
                        </div>
                    </section>

                    <section className="rounded-lg border border-hairline bg-ivory p-4">
                        <h3 className="font-display text-[17px] text-ink">Espace du couple</h3>
                        <p className="mt-1 text-body-sm text-sage">{demande.portailActif ? 'Un compte client est associé à ce couple.' : 'Aucun compte client associé à ce couple.'}</p>
                    </section>

                    <section>
                        <h3 className="mb-3 text-caps uppercase text-sage">Journal des échanges</h3>
                        <div className="space-y-4 border-l border-subtle pl-5">
                            {(demande.notes ?? []).map((texte, index) => <div key={`${index}-${texte}`} className="relative"><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-ink ring-4 ring-white" /><p className="text-body font-medium text-ink">Note ajoutée</p><p className="mt-1 whitespace-pre-line text-body-sm text-sage">{texte}</p></div>)}
                            {(demande.historique ?? []).map((interaction) => <div key={interaction.titre} className="relative"><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-sage ring-4 ring-white" /><div className="flex items-start justify-between gap-2"><p className="text-body font-medium text-ink">{interaction.titre}</p><span className="shrink-0 text-[10px] text-warning">{interaction.date}</span></div><p className="mt-1 text-body-sm text-sage">{interaction.detail}</p></div>)}
                            {!demande.notes?.length && !demande.historique?.length && <p className="text-body-sm text-sage">Aucun échange pour le moment.</p>}
                        </div>
                        <form onSubmit={ajouterNote} className="mt-3 flex gap-2">
                            <input required maxLength={1000} disabled={enCours} aria-label="Nouvelle note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ajouter une note" className="min-w-0 flex-1 rounded-lg border-hairline text-body focus:border-ink focus:ring-0" />
                            <button type="submit" disabled={enCours || !note.trim()} className={`${anneauFocus} rounded-lg bg-ink px-3 text-label text-white disabled:opacity-50`}>Ajouter</button>
                        </form>
                    </section>
                </div>

                {(demande.statut === 'perdu' || perteEnCours) && (
                    <div className="border-t border-hairline bg-ivory p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="motif-perte" className="text-[10px] uppercase text-sage">Motif de perte</label>
                            <select id="motif-perte" value={motif} onChange={(event) => setMotif(event.target.value)} className="min-w-0 flex-1 rounded-lg border-hairline bg-white text-body-sm focus:border-ink focus:ring-0">
                                <option value="">Sélectionner un motif…</option>
                                {MOTIFS_PERTE.map((raison) => <option key={raison.cle} value={raison.cle}>{raison.libelle}</option>)}
                            </select>
                            <button type="button" disabled={enCours || !motif || (motif === 'autre' && !motifLibre.trim())} onClick={enregistrerMotif} className={`${anneauFocus} text-[11px] uppercase text-red-800 underline disabled:cursor-not-allowed disabled:opacity-40`}>Enregistrer le motif</button>
                        </div>
                        {motif === 'autre' && (
                            <label htmlFor="motif-libre" className="mt-3 block text-[11px] text-sage">
                                Précisez la raison
                                <input id="motif-libre" type="text" maxLength="255" value={motifLibre} onChange={(event) => setMotifLibre(event.target.value)} placeholder="Écrire le motif de perte" className="mt-1 block w-full rounded-lg border-hairline bg-white text-body-sm text-ink focus:border-ink focus:ring-0" />
                            </label>
                        )}
                    </div>
                )}
            </aside>
        </div>
    );
}

function NouvelleDemande({ onFermer, onCreer, catalogue, lieux }) {
    const formulaire = useForm({
        partner1_first_name: '', partner1_last_name: '', partner2_first_name: '', partner2_last_name: '',
        email: '', telephone: '', origine: '', date: '', lieu: '', budget: '', prestations: [], notes: '',
    });
    const fermer = () => { if (!formulaire.processing) { onFermer(); } };
    useEffect(() => {
        const fermerAvecEchap = (event) => { if (event.key === 'Escape' && !formulaire.processing) { onFermer(); } };
        window.addEventListener('keydown', fermerAvecEchap);
        return () => window.removeEventListener('keydown', fermerAvecEchap);
    }, [onFermer, formulaire.processing]);
    const soumettre = (event) => {
        event.preventDefault();
        formulaire.post(route('demandes.store'), {
            preserveScroll: true,
            onSuccess: (page) => onCreer(page.props.nouvelleDemandeId),
        });
    };
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4" onClick={fermer}>
            <section role="dialog" aria-modal="true" aria-labelledby="titre-demande" onClick={(event) => event.stopPropagation()} className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between border-b border-hairline pb-4">
                    <div><span className="text-caps uppercase text-sage">Gestion commerciale</span><h2 id="titre-demande" className="mt-1 font-display text-title-md text-ink">Enregistrer une demande</h2></div>
                    <button type="button" disabled={formulaire.processing} aria-label="Fermer" onClick={fermer} className={anneauFocus + ' rounded-lg p-1 text-sage hover:bg-ivory'}><Icone nom="close" /></button>
                </div>
                <form onSubmit={soumettre} className="space-y-4">
                    {Object.keys(formulaire.errors).length > 0 && <p role="alert" className="text-body text-warning">{Object.values(formulaire.errors)[0]}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            ['partner1_first_name', 'Prénom du premier partenaire', true],
                            ['partner1_last_name', 'Nom du premier partenaire', false],
                            ['partner2_first_name', 'Prénom du second partenaire', false],
                            ['partner2_last_name', 'Nom du second partenaire', false],
                        ].map(([champ, libelle, obligatoire]) => <label key={champ} className="text-label text-ink">{libelle}<input required={obligatoire} maxLength={100} value={formulaire.data[champ]} onChange={(event) => formulaire.setData(champ, event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>)}
                        <label className="text-label text-ink">Courriel<input type="email" maxLength={255} value={formulaire.data.email} onChange={(event) => formulaire.setData('email', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Téléphone<input type="tel" maxLength={50} value={formulaire.data.telephone} onChange={(event) => formulaire.setData('telephone', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Date prévue du mariage<input type="date" value={formulaire.data.date} onChange={(event) => formulaire.setData('date', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Lieu envisagé<input list="lieux-demandes" maxLength={160} value={formulaire.data.lieu} onChange={(event) => formulaire.setData('lieu', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /><datalist id="lieux-demandes">{lieux.map((lieu) => <option key={lieu} value={lieu} />)}</datalist></label>
                        <label className="text-label text-ink">Budget prévisionnel (€)<input min="0" max="99999999.99" step="0.01" type="number" value={formulaire.data.budget} onChange={(event) => formulaire.setData('budget', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Canal d’entrée<input maxLength={255} value={formulaire.data.origine} onChange={(event) => formulaire.setData('origine', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                    </div>
                    <fieldset><legend className="mb-2 text-label text-ink">Prestations souhaitées</legend><div className="grid gap-2 sm:grid-cols-3">{catalogue.filter((prestation) => prestation.active).map((prestation) => <label key={prestation.cle} className="flex items-center gap-2 rounded-lg border border-hairline bg-ivory p-2 text-body text-ink"><input type="checkbox" checked={formulaire.data.prestations.includes(prestation.cle)} onChange={(event) => formulaire.setData('prestations', event.target.checked ? [...formulaire.data.prestations, prestation.cle] : formulaire.data.prestations.filter((cle) => cle !== prestation.cle))} className="rounded border-hairline text-ink focus:ring-ink" />{prestation.libelle}</label>)}</div>{catalogue.filter((prestation) => prestation.active).length === 0 && <p className="text-body-sm text-sage">Aucune prestation active au catalogue. Vous pouvez enregistrer la demande sans prestation.</p>}</fieldset>
                    <label className="block text-label text-ink">Notes initiales<textarea rows="3" maxLength={1000} value={formulaire.data.notes} onChange={(event) => formulaire.setData('notes', event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                    <div className="flex justify-end gap-3 border-t border-hairline pt-4"><button type="button" disabled={formulaire.processing} onClick={fermer} className={anneauFocus + ' rounded-lg px-4 py-2 text-label text-sage'}>Annuler</button><button type="submit" disabled={formulaire.processing} className={anneauFocus + ' rounded-lg bg-ink px-4 py-2 text-label text-white disabled:opacity-50'}>{formulaire.processing ? 'Enregistrement…' : 'Créer la fiche prospect'}</button></div>
                </form>
            </section>
        </div>
    );
}

function synchroniserDefilement(position, cible) {
    if (cible && cible.scrollLeft !== position) {
        cible.scrollLeft = position;
    }
}

export default function Demandes({ demandes, prestations, lieux, importedIds, statistiques }) {
    const pageUrl = usePage().url;
    const barrePipeline = useRef(null);
    const colonnesPipeline = useRef(null);
    const [demandesLocales] = useState(() => typeof window === 'undefined' ? [] : lireDemandesLocales());
    const [enCours, setEnCours] = useState(false);
    const [erreurs, setErreurs] = useState({});
    const aImporter = demandesLocales.filter((demande) => !importedIds.includes(demande.id));
    const filtres = [{ cle: 'toutes', libelle: 'Toutes les prestations' }, ...prestations, { cle: 'budget', libelle: 'Budget > 5 000 €' }];
    const [recherche, setRecherche] = useState('');
    const [filtre, setFiltre] = useState('toutes');
    const [demandeOuverte, setDemandeOuverte] = useState(() => new URLSearchParams(pageUrl.split('?')[1] ?? '').get('demande'));
    const [creationOuverte, setCreationOuverte] = useState(() => new URLSearchParams(pageUrl.split('?')[1] ?? '').get('nouvelle') === '1');

    useEffect(() => {
        const parametres = new URLSearchParams(pageUrl.split('?')[1] ?? '');
        if (parametres.has('demande')) {
            setDemandeOuverte(parametres.get('demande'));
            setCreationOuverte(false);
        }
        if (parametres.get('nouvelle') === '1') {
            setCreationOuverte(true);
        }
    }, [pageUrl]);

    const demandesFiltrees = useMemo(() => demandes.filter((demande) => {
        const texte = `${demande.nom} ${demande.date} ${demande.lieu} ${demande.prestations.map((cle) => prestations.find((prestation) => prestation.cle === cle)?.libelle ?? cle).join(' ')}`.toLocaleLowerCase('fr-FR');
        const rechercheValide = texte.includes(recherche.trim().toLocaleLowerCase('fr-FR'));
        const filtreValide = filtre === 'toutes' || (filtre === 'budget' ? demande.budget > 5000 : demande.prestations.includes(filtre));
        return rechercheValide && filtreValide;
    }), [demandes, filtre, recherche, prestations]);

    const demandeSelectionnee = demandes.find((demande) => demande.id === demandeOuverte);
    const nombreDemandesActives = statistiques.actives;
    const volumePipeline = statistiques.volume_centimes / 100;
    const optionsEnregistrement = (onSuccess = () => {}) => ({
        preserveScroll: true,
        onStart: () => { setEnCours(true); setErreurs({}); },
        onError: (erreursRecues) => setErreurs(erreursRecues),
        onSuccess,
        onFinish: () => setEnCours(false),
    });
    const modifierDemande = (id, changements, onSuccess) => {
        if (enCours) { return; }
        const destination = 'note' in changements ? 'demandes.notes.store' : 'demandes.update';
        router.patch(route(destination, id), changements, optionsEnregistrement(onSuccess));
    };
    const creerDemande = (id) => {
        setCreationOuverte(false);
        setDemandeOuverte(id);
    };
    const importerDemandes = () => {
        if (!enCours) {
            router.post(route('demandes.import'), { demandes: aImporter.slice(0, 100) }, optionsEnregistrement());
        }
    };

    return (
        <BackOfficeLayout actif="demandes" filAriane="Atelier de Production" policeStitch>
            <Head title="Demandes">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet" />
            </Head>
            <div className="w-full space-y-8">
                <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                    <div>
                        <p className="text-caps uppercase tracking-widest text-sage">Gestion commerciale <span className="mx-1 text-subtle">•</span> Suivi des dossiers</p>
                        <h1 className="mt-4 font-display text-[28px] leading-tight text-ink sm:text-[32px]">Demandes &amp; Pipeline commercial</h1>
                        <p className="mt-3 font-display text-[18px] italic text-sage">({nombreDemandesActives} demandes actives)</p>
                    </div>
                    <div className="flex flex-col items-start gap-4 xl:items-stretch">
                        <div className="flex items-center gap-7 rounded-lg bg-ivory px-5 py-3">
                            <div><span className="block text-caps uppercase text-sage">Volume pipeline</span><strong className="font-display text-[24px] font-normal text-ink">{euros(volumePipeline)}</strong></div>
                            <div className="h-8 w-px bg-hairline" />
                            <div><span className="block text-caps uppercase text-sage" title="Part des demandes signées parmi tous les dossiers">Taux de signature</span><strong className="font-display text-[24px] font-normal text-success">{statistiques.taux_signature} %</strong></div>
                        </div>
                    </div>
                </header>

                {aImporter.length > 0 && <div className="rounded-lg border border-hairline bg-ivory p-4 text-body"><p>{aImporter.length} ancienne(s) demande(s) créée(s) dans ce navigateur peuvent être importées en base. Les exemples de la maquette sont exclus.</p><button type="button" disabled={enCours} onClick={importerDemandes} className={anneauFocus + ' mt-2 text-ink underline disabled:opacity-50'}>{enCours ? 'Import en cours…' : 'Importer mes anciennes demandes locales'}</button></div>}
                {Object.keys(erreurs).length > 0 && !demandeSelectionnee && <p role="alert" className="text-body text-warning">{Object.values(erreurs)[0]}</p>}
                <section aria-label="Recherche et filtres" className="flex flex-col gap-3 rounded-lg bg-ivory p-4 xl:flex-row xl:items-center">
                    <div className="relative w-full shrink-0 xl:w-72"><Icone nom="search" className="absolute left-3 top-2.5 text-[18px] text-sage" /><input type="search" aria-label="Rechercher une demande" value={recherche} onChange={(event) => setRecherche(event.target.value)} placeholder="Rechercher un couple, une date, un lieu..." className="w-full rounded-md border-0 bg-white py-2 pl-10 pr-4 text-body italic placeholder:text-sage focus:ring-0" /></div>
                    <div className="flex min-w-0 gap-2 overflow-x-auto whitespace-nowrap">{filtres.map((option) => <button key={option.cle} type="button" aria-pressed={filtre === option.cle} onClick={() => setFiltre(option.cle)} className={`${anneauFocus} rounded-full px-3 py-1.5 text-caps uppercase transition-colors ${filtre === option.cle ? 'bg-ink text-white' : 'bg-white text-sage hover:text-ink'}`}>{option.libelle}</button>)}</div>
                </section>

                <section aria-label="Pipeline des demandes" className="-mx-4 space-y-2 sm:-mx-8">
                    <div
                        ref={barrePipeline}
                        role="region"
                        aria-label="Défilement horizontal du pipeline"
                        aria-controls="colonnes-pipeline"
                        tabIndex={0}
                        onScroll={(event) => synchroniserDefilement(event.currentTarget.scrollLeft, colonnesPipeline.current)}
                        className={anneauFocus + ' overflow-x-auto px-4 [scrollbar-color:var(--color-sage)_var(--color-ivory)] sm:px-8'}
                    >
                        <div aria-hidden="true" className={CLASSES_LARGEUR_PIPELINE + ' h-1'} />
                    </div>
                    <div
                        id="colonnes-pipeline"
                        ref={colonnesPipeline}
                        onScroll={(event) => synchroniserDefilement(event.currentTarget.scrollLeft, barrePipeline.current)}
                        className="overflow-x-auto px-4 pb-5 sm:px-8"
                    >
                        <div className={CLASSES_LARGEUR_PIPELINE + ' grid grid-cols-6 items-start gap-4'}>
                            {ETAPES.map((etape) => {
                                const demandesColonne = demandesFiltrees.filter((demande) => demande.statut === etape.cle);
                                return (
                                    <div key={etape.cle} className="min-h-[680px] rounded-lg bg-cream-light/50 p-3">
                                        <div className="mb-3 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-caps uppercase text-ink"><span className={`h-2 w-2 rounded-full ${etape.couleur}`} />{etape.libelle}</h2><span className="rounded-full bg-white px-2 text-[10px] text-sage">{demandesColonne.length}</span></div>
                                        <div className="space-y-3">{demandesColonne.map((demande) => <CarteDemande key={demande.id} demande={demande} catalogue={prestations} onOuvrir={setDemandeOuverte} />)}{demandesColonne.length === 0 && <p className="rounded-lg border border-dashed border-hairline p-4 text-center text-body-sm text-sage">Aucune demande</p>}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {demandeSelectionnee && <TiroirDemande key={demandeSelectionnee.id} demande={demandeSelectionnee} catalogue={prestations} enCours={enCours} erreurs={erreurs} onFermer={() => setDemandeOuverte(null)} onModifier={modifierDemande} />}
            {creationOuverte && <NouvelleDemande catalogue={prestations} lieux={lieux} onFermer={() => setCreationOuverte(false)} onCreer={creerDemande} />}
        </BackOfficeLayout>
    );
}
