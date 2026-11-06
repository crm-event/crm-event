import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { focusRing, secondaryButton, textLink } from '@/brand';
import { Head, Link } from '@inertiajs/react';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function ProjectSummary({ project }) {
    const details = [
        { label: 'Date du mariage', value: project.date && dateFormatter.format(new Date(`${project.date}T12:00:00`)) },
        { label: 'Lieu', value: project.venue },
        { label: 'Avancement', value: project.status },
    ];

    return (
        <dl className="mt-10 grid max-w-3xl divide-y divide-ink/10 rounded-lg bg-blush/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {details.map((detail) => (
                <div key={detail.label} className="flex flex-col-reverse p-6">
                    <dt className="mt-2 text-[11px] uppercase tracking-brand text-sage">{detail.label}</dt>
                    <dd className="font-display text-lg leading-snug">{detail.value ?? 'À préciser'}</dd>
                </div>
            ))}
        </dl>
    );
}

function VersionCard({ version }) {
    return (
        <article className="border border-ink/5 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-5">
                    <span className="font-display text-3xl leading-none text-sage">
                        {String(version.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-sm font-medium text-ink">{version.title}</h3>
                        <p className="mt-2 text-[11px] text-ink/55">
                            Reçue le {dateFormatter.format(new Date(version.created_at))}
                        </p>
                        {version.description && (
                            <p className="mt-2 text-xs leading-relaxed text-ink/60">{version.description}</p>
                        )}
                        {version.approved_at && (
                            <p className="mt-2 text-xs text-sage">
                                Approuvée le {dateFormatter.format(new Date(version.approved_at))}
                            </p>
                        )}
                        {version.awaiting_approval && (
                            <p className="mt-2 text-xs text-ink/70">
                                À approuver depuis{' '}
                                <Link href={route('couple.documents.index')} className={textLink}>
                                    vos documents
                                </Link>
                                .
                            </p>
                        )}
                    </div>
                </div>

                {version.download_url ? (
                    <a
                        href={version.download_url}
                        className={`${focusRing} inline-flex shrink-0 items-center gap-1 self-start border border-ink/15 px-3 py-2 text-[11px] text-ink transition-colors hover:border-ink`}
                    >
                        <Icone nom="download" className="!text-[14px] leading-none" />
                        Télécharger
                    </a>
                ) : (
                    <span className="shrink-0 self-start border border-dashed border-ink/20 px-3 py-2 text-[11px] italic text-ink/55">
                        Fichier indisponible sur cet appareil
                    </span>
                )}
            </div>
        </article>
    );
}

/**
 * Design page of the couple space: where the project stands and every version
 * of the design book Jessica has shared, the latest one first.
 *
 * A version is a document of the `design` category, the only kind of design
 * deliverable Jessica can share for now.
 */
export default function Design({ project, versions }) {
    return (
        <CoupleLayout active="design">
            <Head title="Design" />

            <p className="text-[11px] uppercase tracking-brand text-sage">Votre univers</p>
            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">
                {project?.couple ? `Le design de ${project.couple}` : 'Votre design'}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                Retrouvez ici les propositions de design que Jessica prépare pour votre mariage,
                version après version.
            </p>

            {project && <ProjectSummary project={project} />}

            <section aria-labelledby="design-versions-title" className="mt-14 max-w-3xl">
                <h2 id="design-versions-title" className="border-b border-ink/10 pb-4 font-display text-xl">
                    Vos propositions
                </h2>

                {versions.length === 0 ? (
                    <div className="mt-6 border border-ink/10 bg-white px-6 py-10 text-center">
                        <p className="text-sm text-ink/60">
                            Jessica n’a pas encore partagé de proposition de design.
                        </p>
                        <Link href={route('couple.messages.index')} className={`${secondaryButton} mt-6`}>
                            Écrire à Jessica
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {versions.map((version) => (
                            <VersionCard key={version.id} version={version} />
                        ))}
                    </div>
                )}
            </section>
        </CoupleLayout>
    );
}
