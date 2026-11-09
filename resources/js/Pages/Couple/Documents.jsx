import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { focusRing, primaryButton } from '@/brand';
import { Head, useForm } from '@inertiajs/react';
import { useLanguage } from '@/Components/LanguageSwitcher';
import { translate } from '@/i18n';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

export default function Documents({ categories }) {
    const language = useLanguage().language;
    const t = (key) => translate(language, key);

    return (
        <CoupleLayout active="documents">
            <Head title="Documents" />

            <p className="text-[11px] uppercase tracking-brand text-sage">{t('allInOnePlace')}</p>
            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">{t('yourDocuments')}</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                {t('documentsIntro')}
            </p>

            <div className="mt-10 max-w-3xl space-y-8">
                {categories.length === 0 ? (
                    <div className="border border-ink/10 bg-white px-6 py-10 text-center text-sm text-ink/60">
                        {t('noDocuments')}
                    </div>
                ) : (
                    categories.map((category) => (
                        <section key={category.key}>
                            <h2 className="font-display text-xl">{category.label}</h2>
                            <div className="mt-4 space-y-3">
                                {category.documents.map((document) => (
                                    <DocumentCard key={document.id} document={document} language={language} />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </CoupleLayout>
    );
}

function DocumentCard({ document, language }) {
    const approval = useForm();

    return (
        <article className="border border-ink/5 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-ink">{document.title}</h3>
                    <p className="mt-2 text-[11px] text-ink/55">
                        {dateFormatter.format(new Date(document.created_at))}
                        {document.size_label && ` • ${document.size_label}`}
                        {document.viewed_at &&
                            ` • consulté le ${dateFormatter.format(new Date(document.viewed_at))}`}
                    </p>
                    {document.message && (
                        <p className="mt-1 text-xs leading-relaxed text-ink/60">{document.message}</p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={document.status} label={document.status_label} />
                    {document.downloadable ? (
                        <a
                            href={document.download_url}
                            className={`${focusRing} inline-flex items-center gap-1 border border-ink/15 px-3 py-2 text-[11px] text-ink transition-colors hover:border-ink`}
                        >
                            <Icone nom="download" className="!text-[14px] leading-none" />
                            {translate(language, 'download')}
                        </a>
                    ) : (
                        <span className="inline-flex cursor-not-allowed items-center gap-1 border border-ink/10 px-3 py-2 text-[11px] text-ink/35">
                            <Icone nom="download" className="!text-[14px] leading-none" />
                            {translate(language, 'download')}
                        </span>
                    )}
                </div>
            </div>

            {document.requires_approval && document.status !== 'approved' && (
                <div className="mt-5 flex flex-col gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-ink/60">{translate(language, 'approveDocumentHint')}</p>
                    <button
                        type="button"
                        disabled={approval.processing}
                        onClick={() => approval.post(route('couple.documents.approve', document.id), { preserveScroll: true })}
                        className={`${primaryButton} px-4 py-2 text-[10px] disabled:opacity-50`}
                    >
                        {approval.processing
                            ? language === 'en' ? 'Approving…' : 'Validation…'
                            : translate(language, 'approveDocument')}
                    </button>
                </div>
            )}
        </article>
    );
}

function StatusBadge({ status, label }) {
    const styles = {
        approved: 'border-sage/30 bg-sage/10 text-sage',
        pending: 'border-ink/15 bg-blush text-ink/70',
        viewed: 'border-ink/10 bg-ivory text-ink/60',
        available: 'border-ink/10 bg-ivory text-ink/60',
    };

    return (
        <span className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${styles[status]}`}>
            {label}
        </span>
    );
}
