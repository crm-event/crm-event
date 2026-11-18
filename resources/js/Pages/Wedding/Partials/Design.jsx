import FieldError from '@/Components/FieldError';
import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

/** Where the design stands, shown at the top of the tab. */
const ETATS = {
    waiting_for_couple: { libelle: 'Le couple n’a encore rien partagé', icone: 'hourglass_empty', ton: 'neutre' },
    waiting_for_proposal: { libelle: 'Le couple attend une proposition', icone: 'priority_high', ton: 'alerte' },
    changes_requested: { libelle: 'Retours du couple à traiter', icone: 'rate_review', ton: 'alerte' },
    awaiting_couple: { libelle: 'En attente de la réponse du couple', icone: 'schedule', ton: 'neutre' },
    approved: { libelle: 'Validé par le couple', icone: 'task_alt', ton: 'valide' },
};

const TONS = {
    neutre: 'bg-ivory text-sage',
    alerte: 'bg-warning/15 text-ink',
    valide: 'bg-ink text-white',
};

export function dateCourte(valeur) {
    if (!valeur) {
        return '';
    }

    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(valeur));
}

export function MicroTitre({ children }) {
    return <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">{children}</p>;
}

const champ =
    'mt-1 block w-full rounded-lg border border-hairline bg-white px-3 py-2 text-[11px] text-ink focus:border-ink focus:ring-0';

const boutonPrincipal = `${anneauFocus} inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-white transition hover:bg-sage disabled:cursor-wait disabled:opacity-50`;

const boutonSecondaire = `${anneauFocus} inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-ink transition hover:border-ink`;

function EtatVide({ children }) {
    return <p className="rounded-lg bg-ivory p-4 text-center text-[10px] text-sage">{children}</p>;
}

function Pastille({ ton = 'neutre', icone, children }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${TONS[ton]}`}>
            {icone && <Icone nom={icone} className="text-[12px]" />}
            {children}
        </span>
    );
}

/**
 * What the couple wrote in their creative brief.
 */
function Brief({ brief }) {
    if (!brief) {
        return <EtatVide>Le couple n’a pas encore rédigé son brief.</EtatVide>;
    }

    return (
        <dl className="space-y-4 text-[11px]">
            <div>
                <dt><MicroTitre>Intention</MicroTitre></dt>
                <dd className="mt-1 font-display text-base text-ink">{brief.title || 'Non précisée'}</dd>
            </div>

            {brief.description && (
                <div>
                    <dt><MicroTitre>Description</MicroTitre></dt>
                    <dd className="mt-1 whitespace-pre-line leading-5 text-ink">{brief.description}</dd>
                </div>
            )}

            <div>
                <dt><MicroTitre>Palette souhaitée</MicroTitre></dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                    {brief.palette.length > 0
                        ? brief.palette.map((couleur) => (
                              <span key={couleur} className="rounded-full border border-hairline px-2.5 py-1 text-[10px] text-ink">
                                  {couleur}
                              </span>
                          ))
                        : <span className="text-sage">Non précisée</span>}
                </dd>
            </div>

            {brief.avoid && (
                <div>
                    <dt><MicroTitre>À éviter</MicroTitre></dt>
                    <dd className="mt-1 whitespace-pre-line leading-5 text-ink">{brief.avoid}</dd>
                </div>
            )}

            {brief.updated_at && <p className="text-[9px] text-sage">Mis à jour le {dateCourte(brief.updated_at)}</p>}
        </dl>
    );
}

/**
 * A picture shared by the couple, opened full size in a new tab.
 */
function Image({ image, className = '' }) {
    if (!image.url) {
        return (
            <div className={`flex items-center justify-center rounded-lg bg-ivory p-3 text-center text-[9px] text-sage ${className}`}>
                Image indisponible sur cet ordinateur
            </div>
        );
    }

    return (
        <a href={image.url} target="_blank" rel="noreferrer" className={`${anneauFocus} block overflow-hidden rounded-lg bg-ivory ${className}`}>
            <img src={image.url} alt={image.alt} className="h-full w-full object-cover transition hover:scale-[1.03]" />
        </a>
    );
}

/**
 * The brief, moodboard and inspiration photos added by the couple on their
 * Design page.
 */
function PartageDuCouple({ design }) {
    return (
        <section className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
            <MicroTitre>Ce que le couple a partagé</MicroTitre>
            <h2 className="mt-1 font-display text-lg text-ink">Brief, moodboard et inspirations</h2>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div>
                    <Brief brief={design.brief} />
                </div>

                <div className="space-y-5">
                    <div>
                        <MicroTitre>Moodboard</MicroTitre>
                        <div className="mt-2">
                            {design.moodboard ? (
                                <Image image={design.moodboard} className="aspect-[4/3]" />
                            ) : (
                                <EtatVide>Aucun moodboard pour le moment.</EtatVide>
                            )}
                        </div>
                    </div>

                    <div>
                        <MicroTitre>Photos d’inspiration ({design.inspirations.length})</MicroTitre>
                        <div className="mt-2">
                            {design.inspirations.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {design.inspirations.map((image) => (
                                        <Image key={image.id} image={image} className="aspect-square" />
                                    ))}
                                </div>
                            ) : (
                                <EtatVide>Aucune photo d’inspiration pour le moment.</EtatVide>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatutProposition({ proposition }) {
    if (!proposition.is_current && !proposition.approved_at) {
        return <Pastille icone="history">Remplacée par une version plus récente</Pastille>;
    }

    if (proposition.status === 'approved') {
        return <Pastille ton="valide" icone="check">Validée le {dateCourte(proposition.approved_at)}</Pastille>;
    }

    if (proposition.status === 'changes_requested') {
        return <Pastille ton="alerte" icone="rate_review">Retours reçus</Pastille>;
    }

    return <Pastille icone="schedule">En attente du couple</Pastille>;
}

function Apercu({ fichier, titre }) {
    if (!fichier) {
        return (
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-ivory text-[9px] text-sage">
                Fichier indisponible sur cet ordinateur
            </div>
        );
    }

    if (fichier.is_image) {
        return (
            <a href={fichier.url} target="_blank" rel="noreferrer" className={`${anneauFocus} block overflow-hidden rounded-lg bg-ivory`}>
                <img src={fichier.url} alt={titre} className="aspect-[4/3] w-full object-cover" />
            </a>
        );
    }

    return (
        <a
            href={fichier.url}
            target="_blank"
            rel="noreferrer"
            className={`${anneauFocus} flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg bg-ivory text-sage transition hover:text-ink`}
        >
            <Icone nom="picture_as_pdf" className="text-[32px]" />
            <span className="text-[10px] uppercase tracking-[0.12em]">Ouvrir le fichier</span>
        </a>
    );
}

/**
 * The conversation under a proposal.
 */
export function Commentaires({ commentaires }) {
    if (commentaires.length === 0) {
        return <p className="text-[10px] text-sage">Aucun échange sur cette version.</p>;
    }

    return (
        <ol className="space-y-2">
            {commentaires.map((commentaire) => (
                <li
                    key={commentaire.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-5 ${
                        commentaire.from_couple ? 'bg-blush text-ink' : 'ml-auto bg-ink text-white'
                    }`}
                >
                    <p className={`text-[9px] uppercase tracking-[0.12em] ${commentaire.from_couple ? 'text-sage' : 'text-white/60'}`}>
                        {commentaire.from_couple ? 'Le couple' : 'Vous'} · {dateCourte(commentaire.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{commentaire.body}</p>
                </li>
            ))}
        </ol>
    );
}

/**
 * Form to send a new version (a Canva export, a PDF...) to the couple.
 */
function NouvelleVersion({ weddingId, types, onFermer }) {
    const formulaire = useForm({ type: 'design_book', title: '', description: '', file: null });

    const envoyer = (event) => {
        event.preventDefault();
        formulaire.post(route('admin.wedding.design.proposals.store', weddingId), {
            preserveScroll: true,
            onSuccess: () => onFermer(),
        });
    };

    return (
        <form onSubmit={envoyer} className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
            <MicroTitre>Nouvelle version</MicroTitre>
            <p className="mt-1 text-[10px] text-sage">
                Le couple la retrouvera sur sa page Design et dans ses documents. Il pourra la valider ou vous envoyer ses remarques.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-[10px] text-sage">
                    Type
                    <select
                        value={formulaire.data.type}
                        onChange={(event) => formulaire.setData('type', event.target.value)}
                        className={champ}
                    >
                        {types.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <FieldError message={formulaire.errors.type} />
                </label>

                <label className="block text-[10px] text-sage">
                    Titre
                    <input
                        type="text"
                        value={formulaire.data.title}
                        onChange={(event) => formulaire.setData('title', event.target.value)}
                        placeholder="Carnet design, première proposition"
                        className={champ}
                    />
                    <FieldError message={formulaire.errors.title} />
                </label>

                <label className="block text-[10px] text-sage sm:col-span-2">
                    Message au couple (facultatif)
                    <textarea
                        rows={3}
                        value={formulaire.data.description}
                        onChange={(event) => formulaire.setData('description', event.target.value)}
                        placeholder="Ce que vous avez imaginé, ce sur quoi vous attendez leur avis…"
                        className={champ}
                    />
                    <FieldError message={formulaire.errors.description} />
                </label>

                <label className="block text-[10px] text-sage sm:col-span-2">
                    Fichier (image ou PDF, 20 Mo maximum)
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={(event) => formulaire.setData('file', event.target.files[0] ?? null)}
                        className="mt-1 block w-full text-[11px] text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-ivory file:px-3 file:py-2 file:text-[10px] file:uppercase file:tracking-[0.12em] file:text-ink"
                    />
                    <FieldError message={formulaire.errors.file} />
                </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                <button type="submit" disabled={formulaire.processing} className={boutonPrincipal}>
                    <Icone nom="send" className="text-[14px]" />
                    {formulaire.processing ? 'Envoi…' : 'Envoyer au couple'}
                </button>
                <button type="button" onClick={onFermer} className={boutonSecondaire}>
                    Annuler
                </button>
            </div>
        </form>
    );
}

/**
 * Jessica's answer under a version.
 */
function Repondre({ proposition }) {
    const formulaire = useForm({ body: '' });

    const envoyer = (event) => {
        event.preventDefault();
        formulaire.post(route('admin.wedding.design.comments.store', proposition.id), {
            preserveScroll: true,
            onSuccess: () => formulaire.reset(),
        });
    };

    return (
        <form onSubmit={envoyer} className="mt-3">
            <label htmlFor={`reponse-${proposition.id}`} className="sr-only">
                Répondre au couple
            </label>
            <textarea
                id={`reponse-${proposition.id}`}
                rows={2}
                value={formulaire.data.body}
                onChange={(event) => formulaire.setData('body', event.target.value)}
                placeholder="Répondre au couple…"
                className={champ}
            />
            <FieldError message={formulaire.errors.body} />
            <button type="submit" disabled={formulaire.processing} className={`${boutonSecondaire} mt-2`}>
                {formulaire.processing ? 'Envoi…' : 'Répondre'}
            </button>
        </form>
    );
}

function Proposition({ proposition }) {
    return (
        <article className={`rounded-2xl border border-hairline bg-white p-4 sm:p-5 ${proposition.is_current ? '' : 'opacity-75'}`}>
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <Apercu fichier={proposition.file} titre={proposition.title} />

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Pastille>{proposition.type_label} · V{proposition.version}</Pastille>
                        <StatutProposition proposition={proposition} />
                    </div>

                    <h3 className="mt-3 font-display text-lg text-ink">{proposition.title}</h3>
                    <p className="mt-1 text-[10px] text-sage">Envoyée le {dateCourte(proposition.created_at)}</p>

                    {proposition.description && (
                        <p className="mt-3 whitespace-pre-line text-[11px] leading-5 text-ink">{proposition.description}</p>
                    )}

                    {proposition.file && (
                        <a href={proposition.file.download_url} className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-ink underline">
                            <Icone nom="download" className="text-[13px]" />
                            Télécharger
                        </a>
                    )}

                    <div className="mt-4 border-t border-hairline pt-4">
                        <MicroTitre>Échanges</MicroTitre>
                        <div className="mt-3">
                            <Commentaires commentaires={proposition.comments} />
                        </div>
                        <Repondre proposition={proposition} />
                    </div>
                </div>
            </div>
        </article>
    );
}

/**
 * Design tab of the wedding file: what the couple shared, then the proposals
 * sent by Jessica and the couple's answers.
 */
export default function Design({ design, weddingId }) {
    const etat = ETATS[design.status] ?? ETATS.waiting_for_couple;
    const [formulaireOuvert, setFormulaireOuvert] = useState(false);

    return (
        <div className="space-y-4">
            <section className="flex flex-col gap-4 rounded-2xl border border-hairline bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                    <MicroTitre>Direction artistique</MicroTitre>
                    <h2 className="mt-1 font-display text-lg text-ink">Design du mariage</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Pastille ton={etat.ton} icone={etat.icone}>{etat.libelle}</Pastille>
                    <span className="text-[10px] text-sage">
                        Carnet design : {design.revisions.used} révision{design.revisions.used > 1 ? 's' : ''} sur {design.revisions.max}
                    </span>
                </div>
            </section>

            <PartageDuCouple design={design} />

            <section className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <MicroTitre>Vos propositions</MicroTitre>
                        <h2 className="mt-1 font-display text-lg text-ink">Versions envoyées au couple</h2>
                    </div>

                    {!formulaireOuvert && (
                        <button type="button" onClick={() => setFormulaireOuvert(true)} className={boutonPrincipal}>
                            <Icone nom="add" className="text-[14px]" />
                            Nouvelle version
                        </button>
                    )}
                </div>

                {formulaireOuvert && (
                    <NouvelleVersion weddingId={weddingId} types={design.types} onFermer={() => setFormulaireOuvert(false)} />
                )}

                {design.proposals.length > 0 ? (
                    design.proposals.map((proposition) => <Proposition key={proposition.id} proposition={proposition} />)
                ) : (
                    <EtatVide>Aucune proposition n’a encore été envoyée.</EtatVide>
                )}
            </section>
        </div>
    );
}
