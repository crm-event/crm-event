
import { useMemo, useState } from 'react';
import { Head,Link } from '@inertiajs/react';

import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import EtapeTimeline from '@/Pages/Wedding/Partials/EtapeTimeline.jsx';
import Prestations from '@/Pages/Wedding/Partials/Prestations.jsx';
import Prestataires from '@/Pages/Wedding/Partials/Prestataires.jsx';
import Documents from '@/Pages/Wedding/Partials/Document.jsx';
import Icone from '@/Components/Icone';

import { anneauFocus } from '@/charte';
import { formaterEuros } from '@/formats';

const ONGLET = [
    { id: 'resume', label: 'Résumé', icon: 'dashboard' },
    { id: 'prestations', label: 'Prestations & devis', icon: 'description' },
    { id: 'facturation', label: 'Facturation', icon: 'receipt_long' },
    { id: 'prestataires', label: 'Prestataires', icon: 'groups' },
    { id: 'timeline', label: 'Timeline jour J', icon: 'schedule' },
    { id: 'documents', label: 'Documents', icon: 'folder_open' },
];

const classesAction = `${anneauFocus} text-[10px] uppercase tracking-[0.12em] text-ink underline`;

function dateFr(date) {
    if (!date) return 'Date à définir';

    const valeur = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? `${date}T00:00:00`
            : date
    );

    if (Number.isNaN(valeur.getTime())) return 'Date à définir';

    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(valeur);
}

function calculerJoursAvant(date) {
    if (!date) return null;

    const mariage = new Date(`${String(date).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(mariage.getTime())) return null;

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    return Math.ceil(
        (mariage.getTime() - aujourdHui.getTime()) / 86400000
    );
}

function MicroTitre({ children }) {
    return (
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">
            {children}
        </p>
    );
}

function Statut({ children, sombre = false }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[9px] font-medium ${
                sombre ? 'bg-ink text-white' : 'bg-blush text-sage'
            }`}
        >
            {children}
        </span>
    );
}

function EtatVide({ children }) {
    return (
        <p className="rounded-lg bg-ivory p-4 text-center text-[10px] text-sage">
            {children}
        </p>
    );
}

export default function Wedding({
    wedding,
    prestations = [],
    prestataires = [],
    milestones = [],
    documents = [],
    onOpenTab,
    onOpenPortal,
    onEditWedding,
    onManageProviders,
}) {
    const [ongletActif, setOngletActif] = useState('resume');

    // Informations du couple
    const couple = wedding?.couple;

    const nomPartenaire1 = [
        couple?.partner1_first_name,
        couple?.partner1_last_name,
    ].filter(Boolean).join(' ');

    const nomPartenaire2 = [
        couple?.partner2_first_name,
        couple?.partner2_last_name,
    ].filter(Boolean).join(' ');

    const nomCouple = [nomPartenaire1, nomPartenaire2]
        .filter(Boolean)
        .join(' & ') || 'Couple sans nom';

    // Informations du mariage
    const dateMariage = wedding?.wedding_date;
    const lieu = wedding?.venue?.name || 'Lieu à définir';
    const nombreInvites = wedding?.guest_count ?? 0;
    const statut = wedding?.status || 'En préparation';

    // Total des prestations et nombre de prestataires
    const totalPrestations = useMemo(() => {
        return prestations.reduce(
            (total, prestation) => total + Number(prestation.amount ?? 0),
            0
        );
    }, [prestations]);

    const nombrePrestataires = prestataires.length;

    // Tri des étapes selon sort_order
    const timelineTriee = useMemo(() => {
        return [...milestones].sort(
            (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
        );
    }, [milestones]);

    const joursAvant = calculerJoursAvant(dateMariage);

    const changerOnglet = (id) => {
        setOngletActif(id);
        onOpenTab?.(id);
    };

    const ongletSelectionne = ONGLET.find(
        (item) => item.id === ongletActif
    );

    return (
        <BackOfficeLayout actif="mariages" filAriane={nomCouple}>
            <Head title={nomCouple} />

            <div className="mx-auto max-w-[1500px] space-y-4">

                {/* En-tête du dossier */}
                <section className="relative overflow-hidden rounded-2xl border border-hairline bg-white">
                    <div className="relative flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-end sm:p-6">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <Statut sombre>{statut}</Statut>

                                <span className="rounded-full bg-ivory px-2 py-1 text-[9px] tracking-wider text-sage">
                                    # DOS-{wedding?.id ?? '—'}
                                </span>
                            </div>

                            <h1 className="max-w-2xl font-display text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
                                {nomCouple}
                            </h1>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-sage">
                                <span className="flex items-center gap-1">
                                    <Icone nom="calendar_today" className="text-[12px]" />
                                    {dateFr(dateMariage)}
                                </span>

                                <span className="flex items-center gap-1">
                                    <Icone nom="location_on" className="text-[12px]" />
                                    {lieu}
                                </span>

                                <span className="flex items-center gap-1">
                                    <Icone nom="groups" className="text-[12px]" />
                                    {nombreInvites} invités
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                        
                            <button
                                type="button"
                                onClick={onOpenPortal}
                                className={classesAction}
                            >
                                
                                
                                <Link href={route('admin.wedding.index')}>
                                Accès portail mariés
                                <Icone nom="open_in_new" className="text-[11px]" />
                                </Link>
                                
                                
                            </button>

                            <button
                                type="button"
                                onClick={onEditWedding}
                                className={classesAction}
                            >
                                <Icone nom="edit" className="text-[14px]" />
                                Modifier le dossier
                            </button>
                        </div>
                    </div>
                </section>

                {/* Navigation */}
                <nav
                    aria-label="Navigation du dossier mariage"
                    className="flex gap-1 overflow-x-auto rounded-xl border border-hairline bg-white p-1.5"
                >
                    {ONGLET.map((onglet) => (
                        <button
                            key={onglet.id}
                            type="button"
                            onClick={() => changerOnglet(onglet.id)}
                            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[10px] transition ${
                                ongletActif === onglet.id
                                    ? 'bg-ivory font-semibold text-ink'
                                    : 'text-sage hover:bg-ivory hover:text-ink'
                            }`}
                        >
                            <Icone nom={onglet.icon} className="text-[14px]" />
                            {onglet.label}
                        </button>
                    ))}
                </nav>

                {/* Résumé */}
                {ongletActif === 'resume' && (
                    <div className="space-y-4">

                        {/* Timeline */}
                        <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <MicroTitre>Planification stratégique</MicroTitre>

                                    <h2 className="mt-1 font-display text-lg text-ink">
                                        Jalons & Échéancier de Production
                                    </h2>
                                </div>

                                {joursAvant !== null && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1.5 text-[9px] text-sage">
                                        <Icone nom="flag" className="text-[12px]" />
                                        {joursAvant >= 0
                                            ? `J-${joursAvant} avant l’union`
                                            : `Mariage passé de ${Math.abs(joursAvant)} jour(s)`
                                        }
                                    </span>
                                )}
                            </div>

                            {timelineTriee.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-2">
                                    {timelineTriee.map((etape, index) => (
                                        <EtapeTimeline
                                            key={etape.id}
                                            etape={etape}
                                            derniere={index === timelineTriee.length - 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EtatVide>
                                    Aucune étape n'a encore été ajoutée à la timeline.
                                </EtatVide>
                            )}
                        </section>

                        {/* Prestations */}
                        <section>
                            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                                <div>
                                    <MicroTitre>Services & devis</MicroTitre>

                                    <h2 className="mt-1 font-display text-lg text-ink">
                                        Prestations souscrites
                                    </h2>
                                </div>

                                <p className="text-[9px] uppercase tracking-[0.15em] text-sage">
                                    Honoraires totaux
                                    <strong className="ml-2 font-display text-xl font-normal tracking-normal text-ink">
                                        {formaterEuros(totalPrestations)}
                                    </strong>
                                </p>
                            </div>

                            {prestations.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {prestations.map((prestation) => (
                                        <Prestations
                                            key={prestation.id}
                                            prestation={prestation}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EtatVide>
                                    Aucune prestation n'est associée à ce mariage.
                                </EtatVide>
                            )}
                        </section>

                        {/* Informations du mariage et prestataires */}
                        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.35fr]">

                            {/* Informations du dossier */}
                            <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                                <MicroTitre>Informations du mariage</MicroTitre>

                                <h2 className="mt-1 font-display text-lg text-ink">
                                    Détails du dossier
                                </h2>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <MicroTitre>Couple</MicroTitre>
                                        <p className="mt-1 text-[11px] text-ink">
                                            {nomCouple}
                                        </p>
                                    </div>

                                    <div>
                                        <MicroTitre>Adresse du lieu</MicroTitre>
                                        <p className="mt-1 text-[11px] text-ink">
                                            {lieu}
                                        </p>
                                    </div>

                                    <div>
                                        <MicroTitre>Date du mariage</MicroTitre>
                                        <p className="mt-1 text-[11px] text-ink">
                                            {dateFr(dateMariage)}
                                        </p>
                                    </div>

                                    <div>
                                        <MicroTitre>Nombre d'invités</MicroTitre>
                                        <p className="mt-1 text-[11px] text-ink">
                                            {nombreInvites}
                                        </p>
                                    </div>

                                    {wedding?.estimated_budget !== null &&
                                        wedding?.estimated_budget !== undefined && (
                                            <div>
                                                <MicroTitre>Budget estimé</MicroTitre>
                                                <p className="mt-1 text-[11px] text-ink">
                                                    {formaterEuros(wedding.estimated_budget)}
                                                </p>
                                            </div>
                                        )}
                                </div>

                                {(wedding?.notes || couple?.notes) && (
                                    <div className="mt-4 rounded-xl bg-ivory p-3">
                                        <MicroTitre>Notes du dossier</MicroTitre>
                                        <p className="mt-2 whitespace-pre-line text-[10px] leading-5 text-sage">
                                            {wedding?.notes || couple?.notes}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Prestataires */}
                            <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <MicroTitre>Écosystème du jour J</MicroTitre>

                                    <span className="text-[9px] text-sage">
                                        {nombrePrestataires} prestataire(s) assigné(s)
                                    </span>
                                </div>

                                <h2 className="mt-1 font-display text-lg text-ink">
                                    Équipe prestataires assignée
                                </h2>

                                <p className="mt-1 text-[10px] leading-4 text-sage">
                                    Les professionnels associés à ce mariage.
                                </p>

                                {prestataires.length > 0 ? (
                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                        {prestataires.map((prestataire) => (
                                            <Prestataires
                                                key={prestataire.id}
                                                prestataire={prestataire}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <EtatVide>
                                            Aucun prestataire n'est encore associé à ce mariage.
                                        </EtatVide>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-hairline pt-3">
                                    <button
                                        type="button"
                                        onClick={onManageProviders}
                                        className="inline-flex items-center gap-1 text-[10px] font-medium text-ink hover:text-sage"
                                    >
                                        Gérer les prestataires
                                        <Icone nom="arrow_forward" className="text-[13px]" />
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* Onglet prestations */}
                {ongletActif === 'prestations' && (
                    <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <MicroTitre>Services & devis</MicroTitre>
                                <h2 className="mt-1 font-display text-lg text-ink">
                                    Prestations du mariage
                                </h2>
                            </div>

                            <strong className="font-display text-xl font-normal text-ink">
                                {formaterEuros(totalPrestations)}
                            </strong>
                        </div>

                        {prestations.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {prestations.map((prestation) => (
                                    <Prestations
                                        key={prestation.id}
                                        prestation={prestation}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EtatVide>
                                Aucune prestation n'est associée à ce mariage.
                            </EtatVide>
                        )}
                    </section>
                )}

                {/* Onglet prestataires */}
                {ongletActif === 'prestataires' && (
                    <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                        <div className="mb-4">
                            <MicroTitre>Équipe du mariage</MicroTitre>
                            <h2 className="mt-1 font-display text-lg text-ink">
                                Prestataires assignés
                            </h2>
                        </div>

                        {prestataires.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {prestataires.map((prestataire) => (
                                    <Prestataires
                                        key={prestataire.id}
                                        prestataire={prestataire}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EtatVide>
                                Aucun prestataire n'est associé à ce mariage.
                            </EtatVide>
                        )}

                        <div className="mt-4 border-t border-hairline pt-3 text-right">
                            <button
                                type="button"
                                onClick={onManageProviders}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-ink hover:text-sage"
                            >
                                Gérer les prestataires
                                <Icone nom="arrow_forward" className="text-[13px]" />
                            </button>
                        </div>
                    </section>
                )}

                {/* Onglet timeline */}
                {ongletActif === 'timeline' && (
                    <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                        <MicroTitre>Planification</MicroTitre>

                        <h2 className="mt-1 font-display text-lg text-ink">
                            Timeline du mariage
                        </h2>

                        {timelineTriee.length > 0 ? (
                            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-2">
                                {timelineTriee.map((etape, index) => (
                                    <EtapeTimeline
                                        key={etape.id}
                                        etape={etape}
                                        derniere={index === timelineTriee.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4">
                                <EtatVide>
                                    Aucune étape n'a encore été ajoutée.
                                </EtatVide>
                            </div>
                        )}
                    </section>
                )}

                {/* Onglet documents */}
                {ongletActif === 'documents' && (
                    <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                        <MicroTitre>Gestion documentaire</MicroTitre>

                        <h2 className="mt-1 font-display text-lg text-ink">
                            Documents du mariage
                        </h2>

                        {documents.length > 0 ? (
                            <div className="mt-5 space-y-3">
                                <Documents documents={documents} />
                            </div>
                        ) : (
                            <div className="mt-4">
                                <EtatVide>
                                    Aucun document n'a encore été ajouté.
                                </EtatVide>
                            </div>
                        )}
                    </section>
                )}

                {/* Onglets à développer */}
                {(ongletActif === 'facturation') && (
                    <section className="rounded-2xl border border-hairline bg-white p-8 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-sage">
                            <Icone
                                nom={ongletSelectionne?.icon || 'folder'}
                                className="text-xl"
                            />
                        </span>

                        <h2 className="mt-3 font-display text-lg text-ink">
                            {ongletSelectionne?.label}
                        </h2>

                        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-sage">
                            Cette section pourra accueillir les informations de facturation et les documents du mariage.
                        </p>

                        <button
                            type="button"
                            onClick={() => changerOnglet('resume')}
                            className="mt-4 rounded-lg bg-ink px-4 py-2 text-xs text-white hover:bg-sage"
                        >
                            Retour au résumé
                        </button>
                    </section>
                )}
            </div>
        </BackOfficeLayout>
    );
}
