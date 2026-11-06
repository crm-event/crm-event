import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { focusRing, primaryButton, secondaryButton, textLink } from '@/brand';

const inspirationDefaults = [
    { id: 'one', src: '/images/landing/wedding-design.jpg', alt: 'Décoration naturelle et lumineuse' },
    { id: 'two', src: '/images/landing/accueil2.jpg', alt: 'Composition florale blanche' },
    { id: 'three', src: '/images/landing/accueil1.jpg', alt: 'Cérémonie en extérieur' },
];

const briefDefaults = {
    title: 'Un jardin méditerranéen au coucher du soleil',
    description:
        'Nous imaginons un mariage élégant et naturel dans un domaine provençal. Nous aimons les tons ivoire, sable, vert sauge et terracotta très doux. Nous souhaitons une atmosphère chaleureuse, avec beaucoup de fleurs blanches, des matières naturelles et une décoration raffinée sans être trop chargée.',
    palette: ['Ivoire', 'Lin', 'Vert sauge', 'Argile douce'],
    avoid: 'Les couleurs trop vives et les compositions trop symétriques.',
    moodboard: '/images/Design/moodboard.jpg',
    inspirationImages: inspirationDefaults,
};

const steps = [
    { number: '01', label: 'Vos inspirations', icon: 'favorite' },
    { number: '02', label: 'Direction artistique', icon: 'palette' },
    { number: '03', label: 'Vos retours', icon: 'edit_note' },
    { number: '04', label: 'Rendu final', icon: 'auto_awesome' },
];

const processStepStyles = [
    'bg-blush',
    'bg-blush/70',
    'bg-blush/60',
    'bg-ivory',
];

const proposalImages = [
    {
        src: '/images/landing/wedding-design.jpg',
        alt: 'Table de réception imaginée par Jessica',
    },
    {
        src: '/images/landing/coordination.jpg',
        alt: 'Mise en scène de la réception',
    },
    {
        src: '/images/landing/accueil2.jpg',
        alt: 'Détails floraux de la proposition',
    },
];

function formatDate(value) {
    if (!value) return 'Date à préciser';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function Pill({ children, muted = false }) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] ${
                muted ? 'bg-ivory text-ink/45' : 'bg-blush text-sage'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${muted ? 'bg-ink/25' : 'bg-sage'}`} />
            {children}
        </span>
    );
}

function SectionTitle({ eyebrow, title, children }) {
    return (
        <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[10px] uppercase tracking-brand text-sage">{eyebrow}</p>
                <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function Moodboard({ src, editable, onReplace }) {
    const inputRef = useRef(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    function replace(event) {
        const file = event.target.files?.[0];
        if (file) onReplace(URL.createObjectURL(file));
        event.target.value = '';
    }

    return (
        <>
            <div className="group relative overflow-hidden bg-blush">
                <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className={`${focusRing} block w-full cursor-zoom-in text-left`}
                    aria-label="Agrandir le moodboard"
                >
                    <img src={src} alt="Moodboard du projet" className="aspect-[5/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </button>
            {editable && (
                <>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={replace} />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className={`${focusRing} absolute bottom-3 right-3 inline-flex items-center gap-2 bg-ivory/95 px-3 py-2 text-[10px] uppercase tracking-[0.1em] opacity-0 transition-opacity group-hover:opacity-100`}
                    >
                        <Icone nom="upload" className="text-[15px]" />
                        Remplacer
                    </button>
                </>
            )}
            </div>
            {isPreviewOpen && (
                <ImagePreview
                    src={src}
                    alt="Moodboard du projet"
                    onClose={() => setIsPreviewOpen(false)}
                />
            )}
        </>
    );
}

function InspirationGallery({ images, editable, onChange }) {
    const inputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    function addImage(event) {
        const file = event.target.files?.[0];
        if (file) {
            onChange([
                ...images,
                { id: `upload-${Date.now()}`, src: URL.createObjectURL(file), alt: file.name },
            ]);
        }
        event.target.value = '';
    }

    if (!editable) {
        return (
            <div className="grid grid-cols-3 gap-2">
                {images.map((image) => (
                    <button
                        key={image.id}
                        type="button"
                        onClick={() => setPreviewImage(image)}
                        className={`${focusRing} group aspect-square cursor-zoom-in overflow-hidden bg-blush text-left`}
                        aria-label={`Agrandir ${image.alt}`}
                    >
                        <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </button>
                ))}
                {previewImage && (
                    <ImagePreview
                        src={previewImage.src}
                        alt={previewImage.alt}
                        onClose={() => setPreviewImage(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={addImage} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => (
                    <div key={image.id} className="group relative aspect-square overflow-hidden bg-blush">
                        <button
                            type="button"
                            onClick={() => setPreviewImage(image)}
                            className={`${focusRing} block h-full w-full cursor-zoom-in text-left`}
                            aria-label={`Agrandir ${image.alt}`}
                        >
                            <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(images.filter((item) => item.id !== image.id))}
                            aria-label={`Supprimer ${image.alt}`}
                            className={`${focusRing} absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-ivory/95 text-ink opacity-0 transition-opacity group-hover:opacity-100`}
                        >
                            <Icone nom="close" className="text-[16px]" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={`${focusRing} flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-ink/20 text-ink/50 transition-colors hover:border-ink/50 hover:text-ink`}
                >
                    <Icone nom="add_photo_alternate" className="text-[24px]" />
                    <span className="text-center text-[10px] uppercase tracking-[0.1em]">Ajouter</span>
                </button>
            </div>
            {previewImage && (
                <ImagePreview
                    src={previewImage.src}
                    alt={previewImage.alt}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </>
    );
}

function ImagePreview({ src, alt, onClose }) {
    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', closeOnEscape);

        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Aperçu de ${alt}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5 sm:p-10"
            onClick={onClose}
            onKeyDown={(event) => {
                if (event.key === 'Escape') onClose();
            }}
            tabIndex="-1"
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Fermer l’aperçu"
                className={`${focusRing} absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-ivory text-ink sm:right-8 sm:top-8`}
            >
                <Icone nom="close" className="text-[22px]" />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-full object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}

function CreativeBrief() {
    const [brief, setBrief] = useState(briefDefaults);
    const [draft, setDraft] = useState({
        ...briefDefaults,
        paletteInput: briefDefaults.palette.join(', '),
    });
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    function update(field, value) {
        setDraft((current) => ({ ...current, [field]: value }));
    }

    function save() {
        setBrief({
            ...draft,
            palette: draft.paletteInput
                .split(',')
                .map((color) => color.trim())
                .filter(Boolean),
        });
        setEditing(false);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
    }

    function startEditing() {
        setDraft({
            ...brief,
            paletteInput: brief.palette.join(', '),
        });
        setEditing(true);
    }

    function cancelEditing() {
        setDraft({
            ...brief,
            paletteInput: brief.palette.join(', '),
        });
        setEditing(false);
    }

    return (
        <section id="design-brief" className="mt-16 scroll-mt-24 bg-blush/70 p-6 sm:p-8 lg:p-10" aria-labelledby="brief-heading">
            <SectionTitle eyebrow="Étape 01 · Ce que vous nous avez confié" title="Votre brief créatif">
                <button
                    type="button"
                    onClick={editing ? cancelEditing : startEditing}
                    className={`${focusRing} inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-sage transition-colors hover:text-ink`}
                >
                    <Icone nom={editing ? 'close' : 'edit'} className="text-[16px]" />
                    {editing ? 'Annuler' : 'Modifier le brief'}
                </button>
            </SectionTitle>

            <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-brand text-sage">Votre moodboard</p>
                        <span className="text-[11px] text-ink/40">Envoyé le 8 février 2025</span>
                    </div>
                    <div className="mt-3">
                        <Moodboard src={editing ? draft.moodboard : brief.moodboard} editable={editing} onReplace={(src) => update('moodboard', src)} />
                    </div>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-brand text-sage">L’intention du mariage</p>
                    {editing ? (
                        <input
                            value={draft.title}
                            onChange={(event) => update('title', event.target.value)}
                            className="mt-3 w-full border-0 border-b border-ink/20 bg-transparent px-0 py-2 font-display text-xl focus:border-ink focus:ring-0"
                        />
                    ) : (
                        <h3 id="brief-heading" className="mt-3 font-display text-2xl leading-snug">{brief.title}</h3>
                    )}
                    {editing ? (
                        <textarea
                            value={draft.description}
                            onChange={(event) => update('description', event.target.value)}
                            rows={6}
                            className="mt-5 w-full resize-y border border-ink/15 bg-white p-4 text-sm leading-relaxed focus:border-ink focus:ring-0"
                        />
                    ) : (
                        <p className="mt-5 text-sm leading-relaxed text-ink/70">{brief.description}</p>
                    )}

                    <div className="mt-7 grid gap-6 border-t border-ink/10 pt-5 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-brand text-sage">Palette souhaitée</p>
                            {editing ? (
                                <input
                                    value={draft.paletteInput}
                                    onChange={(event) => update('paletteInput', event.target.value)}
                                    placeholder="Ivoire, lin, vert sauge…"
                                    aria-label="Palette souhaitée"
                                    className="mt-3 w-full border border-ink/15 bg-white px-3 py-2 text-sm focus:border-ink focus:ring-0"
                                />
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {brief.palette.map((color) => (
                                        <span key={color} className="border border-ink/10 bg-blush px-3 py-1.5 text-xs">{color}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-brand text-sage">À éviter</p>
                            {editing ? (
                                <textarea
                                    value={draft.avoid}
                                    onChange={(event) => update('avoid', event.target.value)}
                                    rows={3}
                                    aria-label="Éléments à éviter"
                                    className="mt-3 w-full resize-y border border-ink/15 bg-white p-3 text-sm leading-relaxed focus:border-ink focus:ring-0"
                                />
                            ) : (
                                <p className="mt-3 text-sm leading-relaxed text-ink/65">{brief.avoid}</p>
                            )}
                        </div>
                    </div>
                    {editing && (
                        <button type="button" onClick={save} className={`${primaryButton} mt-7 px-5 py-3`}>
                            Enregistrer mes modifications
                        </button>
                    )}
                    {saved && <p className="mt-3 text-xs text-sage">Votre brief a bien été enregistré.</p>}
                </div>
            </div>

            <div className="mt-10 border-t border-ink/10 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-brand text-sage">Vos photos d’inspiration</p>
                        <p className="mt-2 text-sm text-ink/55">Les détails, matières et ambiances qui nous aident à vous comprendre.</p>
                    </div>
                    <Icone nom="photo_library" className="hidden text-[25px] text-sage sm:block" />
                </div>
                <div className="mt-5">
                    <InspirationGallery
                        images={editing ? draft.inspirationImages : brief.inspirationImages}
                        editable={editing}
                        onChange={(images) => update('inspirationImages', images)}
                    />
                </div>
            </div>
        </section>
    );
}

function VersionCard({ version, featured }) {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [approved, setApproved] = useState(Boolean(version.approved_at));
    const available = Boolean(version.download_url);

    return (
        <article id={featured ? 'design-final' : undefined} className={`scroll-mt-24 overflow-hidden border bg-white ${featured ? 'border-ink/15' : 'border-ink/10'}`}>
            <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-6 border-b border-ink/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-14 w-12 shrink-0 items-center justify-center bg-blush text-sage">
                            <Icone nom="menu_book" className="text-[27px]" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-brand text-sage">Carnet de design</p>
                            <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{version.title}</h3>
                            <p className="mt-2 text-xs text-ink/45">
                                Proposition de Jessica · {formatDate(version.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-brand text-sage">Version {String(version.number).padStart(2, '0')}</p>
                        <Pill muted={!available}>{approved ? 'Direction validée' : available ? 'À découvrir' : 'En préparation'}</Pill>
                    </div>
                </div>

                {version.description && (
                    <p className="mt-7 max-w-2xl text-sm leading-relaxed text-ink/70">{version.description}</p>
                )}

                {available ? (
                    <>
                        <div className="mt-8 grid gap-2 sm:grid-cols-3">
                            {proposalImages.map((image) => (
                                <button
                                    key={image.src}
                                    type="button"
                                    onClick={() => setPreviewImage(image)}
                                    className={`${focusRing} group aspect-[4/3] cursor-zoom-in overflow-hidden bg-blush text-left`}
                                    aria-label={`Agrandir ${image.alt}`}
                                >
                                    <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
                            {version.download_url && (
                                <a href={version.download_url} className={`${primaryButton} px-5 py-3`}>
                                    <Icone nom="download" className="mr-2 text-[16px]" />
                                    Télécharger le carnet
                                </a>
                            )}
                            <button type="button" onClick={() => setApproved(true)} className={`${focusRing} border border-ink/15 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition-colors hover:border-ink`}>
                                <Icone nom="check" className="mr-1 align-middle text-[16px]" />
                                {approved ? 'Direction validée' : 'Valider cette direction'}
                            </button>
                            <button type="button" onClick={() => setFeedbackOpen((current) => !current)} className={`${focusRing} px-2 py-3 text-[10px] uppercase tracking-[0.12em] text-sage underline decoration-ink/20 underline-offset-4`}>
                                {feedbackOpen ? 'Fermer' : 'Demander une évolution'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="mt-8 flex items-center gap-4 bg-blush/60 p-5">
                        <Icone nom="auto_awesome" className="text-[26px] text-sage/60" />
                        <div>
                            <p className="font-display text-lg">Jessica prépare la suite</p>
                            <p className="mt-1 text-xs leading-relaxed text-ink/55">Une nouvelle proposition apparaîtra ici dès qu’elle sera prête.</p>
                        </div>
                    </div>
                )}
            </div>
            {previewImage && (
                <ImagePreview
                    src={previewImage.src}
                    alt={previewImage.alt}
                    onClose={() => setPreviewImage(null)}
                />
            )}
            {feedbackOpen && (
                <div className="border-t border-ink/10 bg-ivory p-6 sm:p-8">
                    <label htmlFor={`feedback-${version.id}`} className="text-[10px] uppercase tracking-brand text-sage">Vos retours sur cette proposition</label>
                    <textarea id={`feedback-${version.id}`} rows={3} placeholder="Ce qui vous plaît, ce que vous souhaitez faire évoluer…" className="mt-3 w-full resize-y border border-ink/15 bg-white p-4 text-sm focus:border-ink focus:ring-0" />
                    <button type="button" onClick={() => setFeedbackOpen(false)} className={`${primaryButton} mt-3 px-5 py-3`}>Envoyer mes retours</button>
                </div>
            )}
        </article>
    );
}

function Process({ activeStep }) {
    return (
        <section className="mt-14" aria-label="Progression du projet design">
            <div className="grid gap-2 sm:grid-cols-4">
                {steps.map((step, index) => {
                    const complete = index < activeStep;
                    const current = index === activeStep;
                    const target = ['design-brief', 'design-proposals', 'design-feedback', 'design-final'][index];

                    return (
                        <a
                            key={step.number}
                            href={`#${target}`}
                            className={`${focusRing} relative block min-h-[116px] overflow-hidden p-4 transition-transform hover:-translate-y-0.5 ${processStepStyles[index]} ${current ? 'ring-1 ring-inset ring-ink/25' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] ${complete || current ? 'bg-ink text-ivory' : 'border border-ink/20 text-ink/45'}`}>
                                    {complete ? <Icone nom="check" className="text-[15px]" /> : step.number}
                                </span>
                                <Icone nom={step.icon} className={`text-[21px] ${current ? 'text-ink' : 'text-sage/60'}`} />
                            </div>
                            <p className={`mt-5 text-[10px] uppercase tracking-[0.1em] ${current ? 'text-ink' : 'text-ink/60'}`}>{step.label}</p>
                            {current && <p className="mt-1 text-[11px] text-sage">En ce moment</p>}
                            {complete && <p className="mt-1 text-[11px] text-sage">Terminé</p>}
                            {!complete && !current && <p className="mt-1 text-[11px] text-ink/40">À venir</p>}
                        </a>
                    );
                })}
            </div>
        </section>
    );
}

export default function Design({ versions = [] }) {
    const sortedVersions = [...versions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const activeStep = sortedVersions.length > 0 ? 2 : 1;

    return (
        <CoupleLayout active="design">
            <Head title="Design" />

            <header className="relative overflow-hidden bg-blush px-6 py-8 sm:px-10 sm:py-12">
                <div className="relative z-10 max-w-2xl">
                    <p className="text-[10px] uppercase tracking-brand text-sage">Votre direction artistique</p>
                    <h1 className="mt-7 max-w-xl font-display text-3xl leading-tight sm:text-5xl">
                        Le design de votre mariage
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/65">
                        Un espace pour rassembler vos inspirations, découvrir les propositions de Jessica et faire évoluer votre univers, étape après étape.
                    </p>
                </div>
                <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full border border-ivory/70 sm:h-64 sm:w-64" />
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-ivory/50 sm:h-96 sm:w-96" />
            </header>

            <Process activeStep={activeStep} />
            <CreativeBrief />

            <section id="design-proposals" className="mt-20 scroll-mt-24 bg-blush/70 p-6 sm:p-8 lg:p-10" aria-labelledby="proposals-heading">
                <SectionTitle eyebrow="Étape 02 · Le travail de Jessica" title="Vos propositions">
                    <Link href={route('couple.documents.index')} className={`${textLink} text-[10px] uppercase tracking-[0.12em]`}>
                        Tous vos documents
                        <Icone nom="arrow_forward" className="ml-1 align-middle text-[15px]" />
                    </Link>
                </SectionTitle>
                <p id="proposals-heading" className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/65">
                    Chaque version est une nouvelle lecture de votre histoire. Découvrez la plus récente en premier, puis retrouvez l’évolution du projet au fil des échanges.
                </p>

                {sortedVersions.length === 0 ? (
                    <div className="mt-7 border border-dashed border-ink/20 bg-white px-6 py-12 text-center">
                        <Icone nom="palette" className="text-[28px] text-sage" />
                        <p className="mt-4 font-display text-lg">La première proposition arrive bientôt</p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">Jessica prépare votre direction artistique à partir de ce brief.</p>
                    </div>
                ) : (
                    <div className="mt-7 space-y-5">
                        {sortedVersions.map((version, index) => (
                            <VersionCard key={version.id} version={version} featured={index === 0} />
                        ))}
                    </div>
                )}
            </section>

            <aside id="design-feedback" className="mt-14 flex flex-col gap-4 scroll-mt-24 bg-blush/70 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                    <p className="text-[10px] uppercase tracking-brand text-sage">Une question sur votre design ?</p>
                    <p className="mt-2 text-sm text-ink/60">Les échanges personnels avec Jessica restent dans votre espace messages.</p>
                </div>
                <Link href={route('couple.messages.index')} className={`${secondaryButton} shrink-0 px-5 py-3`}>
                    Écrire à Jessica
                </Link>
            </aside>
        </CoupleLayout>
    );
}
