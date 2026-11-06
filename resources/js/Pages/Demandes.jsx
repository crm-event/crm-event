import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const CLE_STOCKAGE = 'crm-event.demandes.v1';
const VOLUME_PIPELINE_REFERENCE = 142600;
const DEMANDES_ACTIVES_REFERENCE = 18;
const TAUX_SIGNATURE_REFERENCE = 64;
const ETAPES = [
    { cle: 'nouveau', libelle: 'Nouveau', couleur: 'bg-sage' },
    { cle: 'qualifie', libelle: 'Qualifié', couleur: 'bg-success' },
    { cle: 'devis', libelle: 'Devis envoyé', couleur: 'bg-ink' },
    { cle: 'relance', libelle: 'Relancé', couleur: 'bg-warning' },
    { cle: 'signe', libelle: 'Signé', couleur: 'bg-success' },
    { cle: 'perdu', libelle: 'Perdu', couleur: 'bg-subtle' },
];
const PRESTATIONS = [
    { cle: 'decoration', libelle: 'Décoration' },
    { cle: 'coordination', libelle: 'Coordination' },
    { cle: 'officiante', libelle: 'Cérémonie laïque' },
];
const FILTRES = [
    { cle: 'toutes', libelle: 'Toutes les prestations' },
    ...PRESTATIONS,
    { cle: 'budget', libelle: 'Budget > 5 000 €' },
];
const MOTIFS_PERTE = [
    { cle: 'prix', libelle: 'Prix trop élevé' },
    { cle: 'autre_wp', libelle: 'Autre wedding planner choisi' },
    { cle: 'date_indisponible', libelle: 'Date indisponible' },
    { cle: 'sans_reponse', libelle: 'Sans réponse après relances' },
    { cle: 'autre', libelle: 'Autre raison' },
];
const IMAGE_MOODBOARD = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5zgNe_774GlyV61qMHq-b8oZ9ACQcXqKwA_fL5XhHxSmeiU2UISVcqq-pYNNk49NUt7jSeB09-OQLFAKqtPaVzeFNreNjYBaHBZA0u-ajrcA64HcZXwIVQK1AlOnwTa5R9CSlsyCGgPcU3Hr2O7qIrzZ-MQzTAapDVsxOG-pV4ldU0t_P6X50jZytIuvNCG3rNyELZVrrp6U4FoQRXqcLnsbAI-qz7JWoiAztiH3KILy9KTogMBM';

const DEMANDES_EXEMPLES = [
    { id: 'camille-thomas', nom: 'Camille & Thomas', nomComplet: 'Camille de Montmirail & Thomas Vance', reference: 'D-2025-019', region: 'Haute Provence', date: '2025-06-14', lieu: 'Fonscolombe', budget: 7800, prestations: ['decoration', 'coordination'], statut: 'nouveau', repere: 'Hier', email: 'camille.demontmirail@gmail.com', telephone: '+33 (0)6 12 48 90 33', origine: 'Instagram @ladernieretouche · Message privé', historique: [
        { titre: 'Relance téléphonique programmée', date: 'Demain 11:30', detail: 'Point téléphonique de 15 minutes prévu avec Thomas pour répondre aux questions logistiques du transport à Gordes.' },
        { titre: 'Moodboard & devis transmis par mail', date: '14 Avril · 16:40', detail: 'Envoi groupé via le gabarit éditorial « Provence Solaire ».' },
        { titre: 'Premier échange visio de qualification', date: '11 Avril · 18:00', detail: 'Couple sensible à la scénographie végétale et aux arts de la table anciens.' },
    ] },
    { id: 'mathilde-gregoire', nom: 'Mathilde & Grégoire', date: '2025-07-05', lieu: 'Bastide Puget', budget: 3200, prestations: ['officiante'], statut: 'nouveau', repere: '3j' },
    { id: 'sienna-james', nom: 'Sienna & James', date: '2025-09-12', lieu: 'Domaine de Canaille', budget: 12500, prestations: ['decoration', 'coordination', 'officiante'], statut: 'nouveau' },
    { id: 'chloe-julien', nom: 'Chloé & Julien', date: '2025-10-04', lieu: 'Abbaye Sainte-Croix', budget: 4900, prestations: ['coordination'], statut: 'nouveau' },
    { id: 'eleonore-arthur', nom: 'Éléonore & Arthur', date: '2025-09-20', lieu: 'Château Simone', budget: 6400, prestations: ['decoration', 'officiante'], statut: 'qualifie' },
    { id: 'apolline-hugo', nom: 'Apolline & Hugo', date: '2025-06-28', lieu: 'Villa Baulieu', budget: 5200, prestations: ['coordination'], statut: 'qualifie' },
    { id: 'margaux-bastien', nom: 'Margaux & Bastien', date: '2025-08-30', lieu: 'Bastide de Gordes', budget: 8900, prestations: ['decoration'], statut: 'qualifie' },
    { id: 'constance-louis', nom: 'Constance & Louis', date: '2025-07-19', lieu: 'Mas de So', budget: 9500, prestations: ['decoration', 'coordination'], statut: 'devis', repere: 'D-12 jours' },
    { id: 'victoire-david', nom: 'Victoire & David', date: '2025-09-13', lieu: "Château d'Estoublon", budget: 7200, prestations: ['officiante', 'decoration'], statut: 'devis' },
    { id: 'ines-raphael', nom: 'Inès & Raphaël', date: '2025-06-21', lieu: 'Domaine de Sarson', budget: 4800, prestations: ['coordination'], statut: 'devis' },
    { id: 'charlotte-maxime', nom: 'Charlotte & Maxime', date: '2025-09-06', lieu: 'Mas Guilhem', budget: 8400, prestations: ['decoration', 'coordination'], statut: 'relance', repere: 'R1 le 11/04' },
    { id: 'helene-charles', nom: 'Hélène & Charles', date: '2025-10-18', lieu: 'Château Saint-Roux', budget: 5600, prestations: ['coordination'], statut: 'relance' },
    { id: 'clara-alexandre', nom: 'Clara & Alexandre', date: '2025-05-24', lieu: 'Château Grand Boise', budget: 14200, prestations: ['decoration', 'coordination', 'officiante'], statut: 'signe' },
    { id: 'louise-marc', nom: 'Louise & Marc', date: '2025-06-07', lieu: 'Bastide Rose', budget: 6800, prestations: ['officiante', 'coordination'], statut: 'signe' },
    { id: 'victoire-antoine', nom: 'Victoire & Antoine', date: '2025-10-11', lieu: 'Château Robernier', budget: 9200, prestations: ['decoration'], statut: 'signe' },
    { id: 'lea-sebastien', nom: 'Léa & Sébastien', date: '2025-06-21', lieu: 'Mas des Auréliens', budget: 6100, prestations: ['decoration'], statut: 'perdu', motifPerte: 'Prix trop élevé' },
    { id: 'aurelie-paul', nom: 'Aurélie & Paul', date: '2025-07-12', lieu: 'Domaine Saint-Bacchi', budget: 4200, prestations: ['coordination'], statut: 'perdu', motifPerte: 'Autre wedding planner choisi' },
];

const euros = (montant) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
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

function lireDemandes() {
    try {
        const demandes = JSON.parse(window.localStorage.getItem(CLE_STOCKAGE) ?? 'null');
        return Array.isArray(demandes)
            ? demandes.map((demande) => ({
                ...DEMANDES_EXEMPLES.find((exemple) => exemple.id === demande.id),
                ...demande,
            }))
            : DEMANDES_EXEMPLES;
    } catch {
        return DEMANDES_EXEMPLES;
    }
}

function Prestations({ valeurs }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {valeurs.map((cle) => (
                <span key={cle} className="rounded-full bg-ivory px-2 py-0.5 text-[10px] uppercase text-sage">
                    {PRESTATIONS.find((prestation) => prestation.cle === cle)?.libelle ?? cle}
                </span>
            ))}
        </div>
    );
}

function CarteDemande({ demande, onOuvrir }) {
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
                <Prestations valeurs={demande.prestations} />
                {estPerdue && demande.motifPerte && <p className="rounded bg-ivory p-2 text-[11px] uppercase text-sage">Motif : {demande.motifPerte}</p>}
            </div>
            <div className="flex w-full items-center justify-between gap-2 bg-ivory/50 px-4 py-2.5">
                <span className="text-[10px] uppercase text-sage">{estSignee ? 'Contrat signé' : ['devis', 'relance'].includes(demande.statut) ? 'Montant devisé' : 'Budget estimé'}</span>
                <span className={`font-display text-[18px] ${estSignee ? 'text-success' : 'text-ink'}`}>{euros(demande.budget)}</span>
            </div>
        </button>
    );
}

function TiroirDemande({ demande, onFermer, onModifier }) {
    const motifConnu = MOTIFS_PERTE.find((raison) => raison.libelle === demande.motifPerte);
    const [motif, setMotif] = useState(() => demande.motifPerteType ?? motifConnu?.cle ?? (demande.motifPerte ? 'autre' : ''));
    const [motifLibre, setMotifLibre] = useState(() => demande.motifPerteType === 'autre' || (!motifConnu && demande.motifPerte) ? demande.motifPerte ?? '' : '');
    const [note, setNote] = useState('');

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
            onModifier(demande.id, { notes: [...(demande.notes ?? []), note.trim()] });
            setNote('');
        }
    };

    const enregistrerMotif = () => {
        const raison = motif === 'autre'
            ? motifLibre.trim()
            : MOTIFS_PERTE.find((option) => option.cle === motif)?.libelle;

        if (raison) {
            onModifier(demande.id, { motifPerte: raison, motifPerteType: motif });
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
                                onClick={() => onModifier(demande.id, { statut: etape.cle })}
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
                            {[...PRESTATIONS, { cle: 'organisation', libelle: 'Organisation globale de A à Z' }].map((prestation) => {
                                const retenue = demande.prestations.includes(prestation.cle);
                                return <div key={prestation.cle} className={`flex items-center gap-3 rounded-lg border border-hairline p-3 ${retenue ? 'bg-white text-ink' : 'bg-ivory/30 text-sage opacity-70'}`}><span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${retenue ? 'border-ink bg-ink text-white' : 'border-hairline bg-white'}`}>{retenue && <Icone nom="check" className="text-[14px]" />}</span><span className="min-w-0 flex-1 text-body">{prestation.cle === 'decoration' ? 'Décoration & Wedding Design' : prestation.cle === 'coordination' ? 'Coordination du Jour J' : prestation.libelle}</span><span className="text-[10px] uppercase text-sage">{retenue ? prestation.cle === 'decoration' ? 'Sur mesure' : prestation.cle === 'coordination' ? 'Présence 14h' : 'Retenu' : 'Non retenu'}</span></div>;
                            })}
                        </div>
                    </section>

                    <section>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-caps uppercase text-sage">Proposition éditoriale</h3><span className="text-[10px] uppercase text-sage"><Icone nom="lock_clock" className="mr-1 align-middle text-[14px]" />Règle maison : devis &amp; moodboard indissociables</span></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-hairline bg-white p-3">
                                <div className="relative h-24 overflow-hidden rounded border border-hairline bg-ivory">
                                    {demande.id === 'camille-thomas' ? <img src={IMAGE_MOODBOARD} alt="Planche d'inspiration Provence" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Icone nom="imagesmode" className="text-[28px] text-sage" /></div>}
                                    <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-ink">Planche v2</span>
                                </div>
                                <p className="mt-2 truncate text-body font-medium text-ink">{demande.id === 'camille-thomas' ? 'Moodboard_Camille_Thomas_v2.pdf' : 'Moodboard à préparer'}</p>
                                <p className="text-[11px] text-sage">{demande.id === 'camille-thomas' ? '18.4 Mo' : 'À joindre au dossier'}</p>
                            </div>
                            <div className="rounded-lg border border-hairline bg-white p-3">
                                <div className="flex h-24 flex-col justify-between rounded border border-hairline bg-ivory p-2"><div className="flex justify-between text-[8px] uppercase text-sage"><span>DE-2025-042</span><Icone nom="receipt_long" className="text-[16px]" /></div><div><p className="text-[9px] uppercase text-sage">Montant honoraires TTC</p><p className="font-display text-[24px] text-ink">{euros(demande.budget)}</p></div></div>
                                <p className="mt-2 truncate text-body font-medium text-ink">Devis_DE-2025-042.pdf</p>
                                <p className="text-[11px] text-sage">{demande.statut === 'nouveau' ? 'À préparer' : 'Transmis le 14/04'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-hairline bg-ivory p-4">
                        <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10"><Icone nom="vpn_key" className="text-[18px]" /></span><div><h3 className="font-display text-[17px] text-ink">Espace Dédié Futur Marié</h3><p className="mt-1 text-body-sm text-sage">Accès immédiat dès l’envoi de la proposition pour consulter le moodboard et valider le devis en ligne avant signature.</p></div></div>
                        <button type="button" disabled title="Le portail client sera disponible avec le suivi des dossiers." className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-ink px-4 py-2.5 text-body text-white opacity-50"><Icone nom="key" className="text-[18px]" />Créer un accès portail client</button>
                    </section>

                    <section>
                        <h3 className="mb-3 text-caps uppercase text-sage">Journal des échanges</h3>
                        <div className="space-y-4 border-l border-subtle pl-5">
                            {(demande.notes ?? []).map((texte, index) => <div key={`${index}-${texte}`} className="relative"><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-ink ring-4 ring-white" /><p className="text-body font-medium text-ink">Note ajoutée</p><p className="mt-1 text-body-sm text-sage">{texte}</p></div>)}
                            {(demande.historique ?? []).map((interaction) => <div key={interaction.titre} className="relative"><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-sage ring-4 ring-white" /><div className="flex items-start justify-between gap-2"><p className="text-body font-medium text-ink">{interaction.titre}</p><span className="shrink-0 text-[10px] text-warning">{interaction.date}</span></div><p className="mt-1 text-body-sm text-sage">{interaction.detail}</p></div>)}
                            {!demande.notes?.length && !demande.historique?.length && <p className="text-body-sm text-sage">Aucun échange pour le moment.</p>}
                        </div>
                        <form onSubmit={ajouterNote} className="mt-3 flex gap-2">
                            <input aria-label="Nouvelle note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ajouter une note" className="min-w-0 flex-1 rounded-lg border-hairline text-body focus:border-ink focus:ring-0" />
                            <button type="submit" className={`${anneauFocus} rounded-lg bg-ink px-3 text-label text-white`}>Ajouter</button>
                        </form>
                    </section>
                </div>

                {demande.statut === 'perdu' && (
                    <div className="border-t border-hairline bg-ivory p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="motif-perte" className="text-[10px] uppercase text-sage">Motif de perte</label>
                            <select id="motif-perte" value={motif} onChange={(event) => setMotif(event.target.value)} className="min-w-0 flex-1 rounded-lg border-hairline bg-white text-body-sm focus:border-ink focus:ring-0">
                                <option value="">Sélectionner un motif…</option>
                                {MOTIFS_PERTE.map((raison) => <option key={raison.cle} value={raison.cle}>{raison.libelle}</option>)}
                            </select>
                            <button type="button" disabled={!motif || (motif === 'autre' && !motifLibre.trim())} onClick={enregistrerMotif} className={`${anneauFocus} text-[11px] uppercase text-red-800 underline disabled:cursor-not-allowed disabled:opacity-40`}>Enregistrer le motif</button>
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

function NouvelleDemande({ onFermer, onCreer }) {
    const [nom, setNom] = useState('');
    const [date, setDate] = useState('');
    const [lieu, setLieu] = useState('');
    const [budget, setBudget] = useState('');
    const [prestations, setPrestations] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fermerAvecEchap = (event) => {
            if (event.key === 'Escape') {
                onFermer();
            }
        };
        window.addEventListener('keydown', fermerAvecEchap);
        return () => window.removeEventListener('keydown', fermerAvecEchap);
    }, [onFermer]);

    const soumettre = (event) => {
        event.preventDefault();
        onCreer({
            id: `demande-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
            nom: nom.trim(),
            date,
            lieu: lieu.trim(),
            budget: Number(budget) || 0,
            prestations,
            statut: 'nouveau',
            notes: notes.trim() ? [notes.trim()] : [],
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4" onClick={onFermer}>
            <section role="dialog" aria-modal="true" aria-labelledby="titre-demande" onClick={(event) => event.stopPropagation()} className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between border-b border-hairline pb-4">
                    <div><span className="text-caps uppercase text-sage">Gestion commerciale</span><h2 id="titre-demande" className="mt-1 font-display text-title-md text-ink">Enregistrer une demande</h2></div>
                    <button type="button" aria-label="Fermer" onClick={onFermer} className={`${anneauFocus} rounded-lg p-1 text-sage hover:bg-ivory`}><Icone nom="close" /></button>
                </div>
                <form onSubmit={soumettre} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-label text-ink">Prénom &amp; nom du couple<input required maxLength="120" value={nom} onChange={(event) => setNom(event.target.value)} placeholder="Ex. Aliénor & Clément" className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Date prévue du mariage<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Lieu envisagé<input maxLength="160" value={lieu} onChange={(event) => setLieu(event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                        <label className="text-label text-ink">Budget prévisionnel (€)<input min="0" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                    </div>
                    <fieldset><legend className="mb-2 text-label text-ink">Prestations souhaitées</legend><div className="grid gap-2 sm:grid-cols-3">{PRESTATIONS.map((prestation) => <label key={prestation.cle} className="flex items-center gap-2 rounded-lg border border-hairline bg-ivory p-2 text-body text-ink"><input type="checkbox" checked={prestations.includes(prestation.cle)} onChange={(event) => setPrestations((actuelles) => event.target.checked ? [...actuelles, prestation.cle] : actuelles.filter((cle) => cle !== prestation.cle))} className="rounded border-hairline text-ink focus:ring-ink" />{prestation.libelle}</label>)}</div></fieldset>
                    <label className="block text-label text-ink">Notes initiales<textarea rows="3" maxLength="1000" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 block w-full rounded-lg border-hairline text-body focus:border-ink focus:ring-0" /></label>
                    <p className="text-[11px] text-sage">Les nouvelles demandes sont enregistrées dans ce navigateur uniquement.</p>
                    <div className="flex justify-end gap-3 border-t border-hairline pt-4"><button type="button" onClick={onFermer} className={`${anneauFocus} rounded-lg px-4 py-2 text-label text-sage`}>Annuler</button><button type="submit" className={`${anneauFocus} rounded-lg bg-ink px-4 py-2 text-label text-white`}>Créer la fiche prospect</button></div>
                </form>
            </section>
        </div>
    );
}

export default function Demandes() {
    const pageUrl = usePage().url;
    const [demandes, setDemandes] = useState(() => typeof window === 'undefined' ? DEMANDES_EXEMPLES : lireDemandes());
    const [recherche, setRecherche] = useState('');
    const [filtre, setFiltre] = useState('toutes');
    const [demandeOuverte, setDemandeOuverte] = useState(null);
    const [creationOuverte, setCreationOuverte] = useState(() => new URLSearchParams(pageUrl.split('?')[1] ?? '').get('nouvelle') === '1');

    useEffect(() => {
        const parametres = new URLSearchParams(pageUrl.split('?')[1] ?? '');
        if (parametres.get('nouvelle') === '1') {
            setCreationOuverte(true);
        }
    }, [pageUrl]);

    useEffect(() => {
        try {
            window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(demandes));
        } catch {
            // Les changements restent visibles jusqu'au prochain rechargement si le stockage est indisponible.
        }
    }, [demandes]);

    const demandesFiltrees = useMemo(() => demandes.filter((demande) => {
        const texte = `${demande.nom} ${demande.date} ${demande.lieu} ${demande.prestations.join(' ')}`.toLocaleLowerCase('fr-FR');
        const rechercheValide = texte.includes(recherche.trim().toLocaleLowerCase('fr-FR'));
        const filtreValide = filtre === 'toutes' || (filtre === 'budget' ? demande.budget >= 5000 : demande.prestations.includes(filtre));
        return rechercheValide && filtreValide;
    }), [demandes, filtre, recherche]);

    const demandeSelectionnee = demandes.find((demande) => demande.id === demandeOuverte);
    const demandesActives = demandes.filter((demande) => demande.statut !== 'perdu');
    const volumePipeline = VOLUME_PIPELINE_REFERENCE
        + demandesActives.reduce((total, demande) => total + demande.budget, 0)
        - DEMANDES_EXEMPLES.filter((demande) => demande.statut !== 'perdu').reduce((total, demande) => total + demande.budget, 0);
    const nombreDemandesActives = DEMANDES_ACTIVES_REFERENCE + demandesActives.length
        - DEMANDES_EXEMPLES.filter((demande) => demande.statut !== 'perdu').length;

    const modifierDemande = (id, changements) => {
        setDemandes((actuelles) => actuelles.map((demande) => demande.id === id ? { ...demande, ...changements } : demande));
    };

    const creerDemande = (demande) => {
        setDemandes((actuelles) => [demande, ...actuelles]);
        setCreationOuverte(false);
        setDemandeOuverte(demande.id);
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
                        <p className="text-caps uppercase tracking-widest text-sage">Gestion commerciale <span className="mx-1 text-subtle">•</span> Saison 2025 - 2026</p>
                        <h1 className="mt-4 font-display text-[28px] leading-tight text-ink sm:text-[32px]">Demandes &amp; Pipeline commercial</h1>
                        <p className="mt-3 font-display text-[18px] italic text-sage">({nombreDemandesActives} demandes actives)</p>
                    </div>
                    <div className="flex flex-col items-start gap-4 xl:items-stretch">
                        <div className="flex items-center gap-7 rounded-lg bg-ivory px-5 py-3">
                            <div><span className="block text-caps uppercase text-sage">Volume pipeline</span><strong className="font-display text-[24px] font-normal text-ink">{euros(volumePipeline)}</strong></div>
                            <div className="h-8 w-px bg-hairline" />
                            <div><span className="block text-caps uppercase text-sage">Taux de signature</span><strong className="font-display text-[24px] font-normal text-success">{TAUX_SIGNATURE_REFERENCE} %</strong></div>
                        </div>
                        <button type="button" onClick={() => setCreationOuverte(true)} className={`${anneauFocus} inline-flex w-fit items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-body text-white shadow-sm hover:bg-[#222222]`}><Icone nom="add" className="text-[18px]" />Nouvelle demande</button>
                    </div>
                </header>

                <section aria-label="Recherche et filtres" className="flex flex-col gap-3 rounded-lg bg-ivory p-4 xl:flex-row xl:items-center">
                    <div className="relative w-full shrink-0 xl:w-72"><Icone nom="search" className="absolute left-3 top-2.5 text-[18px] text-sage" /><input type="search" aria-label="Rechercher une demande" value={recherche} onChange={(event) => setRecherche(event.target.value)} placeholder="Rechercher un couple, une date, un lieu..." className="w-full rounded-md border-0 bg-white py-2 pl-10 pr-4 text-body italic placeholder:text-sage focus:ring-0" /></div>
                    <div className="flex min-w-0 gap-2 overflow-x-auto whitespace-nowrap">{FILTRES.map((option) => <button key={option.cle} type="button" aria-pressed={filtre === option.cle} onClick={() => setFiltre(option.cle)} className={`${anneauFocus} rounded-full px-3 py-1.5 text-caps uppercase transition-colors ${filtre === option.cle ? 'bg-ink text-white' : 'bg-white text-sage hover:text-ink'}`}>{option.libelle}</button>)}</div>
                </section>

                <section aria-label="Pipeline des demandes" className="-mx-4 overflow-x-auto px-4 pb-5 sm:-mx-8 sm:px-8">
                    <div className="grid min-w-[1540px] grid-cols-6 items-start gap-4">
                        {ETAPES.map((etape) => {
                            const demandesColonne = demandesFiltrees.filter((demande) => demande.statut === etape.cle);
                            return (
                                <div key={etape.cle} className="min-h-[680px] rounded-lg bg-cream-light/50 p-3">
                                    <div className="mb-3 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-caps uppercase text-ink"><span className={`h-2 w-2 rounded-full ${etape.couleur}`} />{etape.libelle}</h2><span className="rounded-full bg-white px-2 text-[10px] text-sage">{demandesColonne.length}</span></div>
                                    <div className="space-y-3">{demandesColonne.map((demande) => <CarteDemande key={demande.id} demande={demande} onOuvrir={setDemandeOuverte} />)}{demandesColonne.length === 0 && <p className="rounded-lg border border-dashed border-hairline p-4 text-center text-body-sm text-sage">Aucune demande</p>}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {demandeSelectionnee && <TiroirDemande key={demandeSelectionnee.id} demande={demandeSelectionnee} onFermer={() => setDemandeOuverte(null)} onModifier={modifierDemande} />}
            {creationOuverte && <NouvelleDemande onFermer={() => setCreationOuverte(false)} onCreer={creerDemande} />}
        </BackOfficeLayout>
    );
}
