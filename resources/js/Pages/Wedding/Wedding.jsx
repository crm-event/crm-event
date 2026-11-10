import { useMemo, useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import EtapeTimeline from '@/Pages/Wedding/Partials/EtapeTimeline.jsx';
import Prestations from '@/Pages/Wedding/Partials/Prestations.jsx';
import Prestataires from '@/Pages/Wedding/Partials/Prestataires.jsx';
import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { formaterEuros } from '@/formats';
import {Head} from "@inertiajs/react";

const ONGLET = [
    { id: 'resume', label: 'Résumé', icon: 'dashboard' },
    { id: 'prestations', label: 'Prestations & devis', icon: 'description' },
    { id: 'facturation', label: 'Facturation', icon: 'receipt_long', notification: true },
    { id: 'prestataires', label: 'Prestataires', icon: 'groups' },
    { id: 'timeline', label: 'Timeline jour J', icon: 'schedule' },
    { id: 'documents', label: 'Documents', icon: 'folder_open' },
];

const classesAction = `${anneauFocus} text-[10px] uppercase tracking-[0.12em] text-ink underline`;

function dateFr(date) {
    if (!date) return 'Date à définir';
    const valeur = new Date(date);
    if (Number.isNaN(valeur.getTime())) return date;
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(valeur);
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

export default function Wedding({
                                    wedding,
                                    prestations = [],
                                    prestataires = [],
                                    milestones = [],
                                    questions = [],
                                    onOpenTab,
                                    onOpenPortal,
                                    onEditWedding,
                                    onSendReminder,
                                    onViewAnswers,
                                    onManageProviders,
                                }) {

    const [ongletActif, setOngletActif] = useState('resume');

    const couple = wedding?.couple;

const nomCouple = [
    couple?.partner1_first_name,
    couple?.partner2_first_name,
].filter(Boolean).join(' & ') || 'Couple sans nom';

const dateMariage = wedding?.wedding_date;

const lieu = wedding?.venue?.name ?? 'Lieu à définir';

const nombreInvites = wedding?.guest_count ?? 0;

const budget = wedding?.estimated_budget ?? 0;

const statut = wedding?.status ?? 'En préparation';

    const changerOnglet = (id) => {
        setOngletActif(id);
        onOpenTab?.(id);
    };

    return (
        <BackOfficeLayout actif="mariages" filAriane={nomCouple}>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-[1500px] space-y-4">
                {/* En-tête du dossier */}
                <section className="relative overflow-hidden rounded-2xl border border-hairline bg-white">
                    <div className="relative flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-end sm:p-6">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <Statut sombre>{statut}</Statut>
                                <span className="rounded-full bg-ivory px-2 py-1 text-[9px] tracking-wider text-sage">
                                    # DOS-{wedding?.id || '2025-0628'}
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
                                className= {classesAction}
                            >
                                <Icone nom="lock_open" className="text-[14px]" />
                                Accès portail mariés
                                <Icone nom="open_in_new" className="text-[11px]" />
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

                {/* Navigation du dossier */}
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
                            {onglet.notification && (
                                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                            )}
                        </button>
                    ))}
                </nav>

                {ongletActif === 'resume' ? (
                    <>
                        {/* Planification stratégique */}
                        <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <MicroTitre>Planification stratégique</MicroTitre>
                                    <h2 className="mt-1 font-display text-lg text-ink">
                                        Jalons & Échéancier de Production
                                    </h2>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1.5 text-[9px] text-sage">
                                    <Icone nom="flag" className="text-[12px]" />
                                    J-{Math.max(
                                    0,
                                    Math.ceil(
                                        (new Date(dateMariage).getTime() - new Date().getTime()) /
                                        86400000,
                                    ),
                                )} avant l’union
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-2">
                                {milestones.map((etape, index) => (
                                    <EtapeTimeline
                                        key={etape.id ?? index}
                                        etape={etape}
                                        derniere={index === milestones.length - 1}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Prestations */}
                        <section>
                            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                                <h2 className="font-display text-lg text-ink">
                                    Prestations souscrites
                                </h2>
                                <p className="text-[9px] uppercase tracking-[0.15em] text-sage">
                                    Honoraires totaux
                                    <strong className="ml-2 font-display text-xl font-normal tracking-normal text-ink">
                                        {formaterEuros(totalPrestations)}
                                    </strong>
                                    <span className="ml-1">HT</span>
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {prestations.map((prestation) => (
                                    <Prestations
                                        key={prestation.id}
                                        prestation={prestation}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Cérémonie et prestataires */}
                        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.35fr]">
                            <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                                <div className="flex items-center justify-between gap-2">
                                    <MicroTitre>Cérémonie personnalisée</MicroTitre>
                                    <Statut>{wedding?.questionnaire_progress ?? '80% rempli'}</Statut>
                                </div>
                                <h2 className="mt-1 font-display text-lg text-ink">
                                    Carnet d’Histoires
                                </h2>
                                <p className="mt-1 text-[10px] leading-4 text-sage">
                                    Questions confidentielles transmises aux futurs époux pour tisser la trame éditoriale de la cérémonie laïque.
                                </p>

                                <div className="mt-4 rounded-xl bg-ivory p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-medium text-ink">
                                            Questionnaire couple
                                        </span>
                                        <span className="text-[10px] text-sage">
                                            {wedding?.questionnaire_score ?? '8 / 10'}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream">
                                        <div
                                            className="h-full rounded-full bg-ink"
                                            style={{
                                                width: `${Number(wedding?.questionnaire_percent ?? 80)}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 flex items-center gap-1.5 text-[9px] text-warning">
                                        <Icone nom="info" className="text-[12px]" />
                                        En attente de 2 réponses individuelles
                                    </p>
                                    <p className="pl-4 text-[9px] text-sage">
                                        d’Alexandre (promesses).
                                    </p>
                                </div>

                                <ul className="mt-3 space-y-2">
                                    {questions.map((question, index) => (
                                        <li
                                            key={question.id ?? index}
                                            className="flex items-center gap-2 rounded-lg border border-hairline px-2.5 py-2 text-[9px] text-sage"
                                        >
                                            <Icone
                                                nom={question.repondu ? 'check_box' : 'check_box_outline_blank'}
                                                className={`text-[13px] ${
                                                    question.repondu ? 'text-success' : 'text-sage'
                                                }`}
                                            />
                                            <span className={question.repondu ? 'line-through' : ''}>
                                                {question.texte}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={onSendReminder}
                                        className="inline-flex items-center gap-1.5 text-[9px] text-sage hover:text-ink"
                                    >
                                        <Icone nom="send" className="text-[12px]" />
                                        Envoyer une relance feutrée
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onViewAnswers}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[9px] font-medium text-white hover:bg-sage"
                                    >
                                        <Icone nom="visibility" className="text-[12px]" />
                                        Lire les réponses
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <MicroTitre>Écosystème du jour J</MicroTitre>
                                    <span className="text-[9px] text-sage">
                                        {nombrePrestatairesConfirmes} prestataires confirmés
                                    </span>
                                </div>
                                <h2 className="mt-1 font-display text-lg text-ink">
                                    Équipe Prestataires Assignée
                                </h2>
                                <p className="mt-1 text-[10px] leading-4 text-sage">
                                    Intervenants triés sur le volet sous contrat pour le samedi {dateFr(dateMariage)}.
                                </p>

                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {prestataires.map((prestataire) => (
                                        <Prestataires
                                            key={prestataire.id}
                                            prestataire={prestataire}
                                        />
                                    ))}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3">
                                    <p className="text-[9px] text-sage">
                                        Dernière synchronisation des plannings prestataires : aujourd’hui à 09:40
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onManageProviders}
                                        className="inline-flex items-center gap-1 text-[10px] font-medium text-ink hover:text-sage"
                                    >
                                        Gérer le collège prestataires
                                        <Icone nom="arrow_forward" className="text-[13px]" />
                                    </button>
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <section className="rounded-2xl border border-hairline bg-white p-8 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-sage">
                            <Icone
                                nom={ONGLET.find((item) => item.id === ongletActif)?.icon || 'folder'}
                                className="text-xl"
                            />
                        </span>
                        <h2 className="mt-3 font-display text-lg text-ink">
                            {ONGLET.find((item) => item.id === ongletActif)?.label}
                        </h2>
                        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-sage">
                            Cette section est accessible depuis la navigation du dossier. Son contenu pourra être intégré ici.
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
