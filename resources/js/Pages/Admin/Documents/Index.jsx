import FieldError from '@/Components/FieldError';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, router, useForm } from '@inertiajs/react';

export default function Documents({ couples, categories, selectedCouple, documents }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        couple_id: '',
        category: 'contract',
        title: '',
        message: '',
        requires_approval: false,
        file: null,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.documents.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const selectCouple = (event) => {
        const coupleId = event.target.value;

        router.get(
            route('admin.documents.index'),
            coupleId ? { couple_id: coupleId } : {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <BackOfficeLayout actif="documents" filAriane="Documents">
            <Head title="Documents" />

            <div className="w-full max-w-4xl">
                <h1 className="font-display text-3xl tracking-tight text-ink">Envoyer un document</h1>
                <p className="mt-2 text-body text-sage">
                    Ajoutez un document à l’espace privé d’un couple.
                </p>

                <form onSubmit={submit} className="mt-8 space-y-6 rounded-lg border border-hairline bg-white p-6 sm:p-8">
                    <Field label="Couple">
                        <select
                            value={data.couple_id}
                            onChange={(event) => setData('couple_id', event.target.value)}
                            className="w-full border border-hairline bg-ivory px-3 py-3 text-body"
                        >
                            <option value="">Sélectionner un couple</option>
                            {couples.map((couple) => (
                                <option key={couple.id} value={couple.id}>
                                    {[couple.partner1_first_name, couple.partner2_first_name].filter(Boolean).join(' & ')}
                                </option>
                            ))}
                        </select>
                        <FieldError message={errors.couple_id} />
                    </Field>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Catégorie">
                            <select
                                value={data.category}
                                onChange={(event) => setData('category', event.target.value)}
                                className="w-full border border-hairline bg-ivory px-3 py-3 text-body"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Titre">
                            <input
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                className="w-full border border-hairline bg-ivory px-3 py-3 text-body"
                                placeholder="Contrat de prestation"
                            />
                            <FieldError message={errors.title} />
                        </Field>
                    </div>

                    <Field label="Description (facultative)">
                        <textarea
                            value={data.message}
                            onChange={(event) => setData('message', event.target.value)}
                            rows={3}
                            className="w-full border border-hairline bg-ivory px-3 py-3 text-body"
                            placeholder="Votre contrat, à lire et à approuver."
                        />
                    </Field>

                    <Field label="Fichier">
                        <input
                            type="file"
                            onChange={(event) => setData('file', event.target.files?.[0] ?? null)}
                            className="block w-full border border-hairline bg-ivory px-3 py-3 text-body"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        />
                        <p className="mt-2 text-body-sm text-sage">PDF, document, tableur ou image — 20 Mo maximum.</p>
                        <FieldError message={errors.file} />
                    </Field>

                    <label className="flex items-center gap-3 text-body text-ink">
                        <input
                            type="checkbox"
                            checked={data.requires_approval}
                            onChange={(event) => setData('requires_approval', event.target.checked)}
                            className="border-ink/30 text-ink focus:ring-ink"
                        />
                        Demander au couple de lire et approuver ce document
                    </label>

                    <button
                        type="submit"
                        disabled={processing}
                        className={`${anneauFocus} bg-ink px-6 py-3 text-caps uppercase tracking-wider text-white disabled:opacity-50`}
                    >
                        {processing ? 'Envoi…' : 'Envoyer le document'}
                    </button>
                </form>

                <section className="mt-12">
                    <div className="border-b border-hairline pb-4">
                        <h2 className="font-display text-2xl tracking-tight text-ink">Voir les documents</h2>
                        <p className="mt-2 text-body text-sage">
                            Sélectionnez un couple pour consulter les documents partagés dans son espace.
                        </p>
                    </div>

                    <label className="mt-6 block max-w-xl">
                        <span className="mb-2 block text-caps uppercase tracking-wider text-sage">Couple</span>
                        <select
                            value={selectedCouple?.id ?? ''}
                            onChange={selectCouple}
                            className="w-full border border-hairline bg-white px-3 py-3 text-body"
                        >
                            <option value="">Sélectionner un couple</option>
                            {couples.map((couple) => (
                                <option key={couple.id} value={couple.id}>
                                    {[couple.partner1_first_name, couple.partner2_first_name]
                                        .filter(Boolean)
                                        .join(' & ')}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selectedCouple && (
                        <div className="mt-6">
                            <h3 className="font-display text-xl text-ink">{selectedCouple.title}</h3>
                            {documents.length === 0 ? (
                                <p className="mt-4 border border-hairline bg-white px-5 py-6 text-body text-sage">
                                    Aucun document n’a encore été partagé avec ce couple.
                                </p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {documents.map((document) => (
                                        <DocumentRow key={document.id} document={document} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </BackOfficeLayout>
    );
}

function DocumentRow({ document }) {
    return (
        <article id={"document-" + document.id} className="scroll-mt-28 border border-hairline bg-white px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-body font-medium text-ink">{document.title}</h4>
                        <span className="border border-subtle bg-ivory px-2 py-1 text-[10px] uppercase tracking-wider text-sage">
                            {document.category_label}
                        </span>
                    </div>
                    <p className="mt-2 text-body-sm text-sage">
                        Partagé le {new Intl.DateTimeFormat('fr-FR').format(new Date(document.created_at))}
                        {document.size_label && ` • ${document.size_label}`}
                    </p>
                    {document.message && (
                        <p className="mt-2 text-body-sm leading-relaxed text-ink/70">{document.message}</p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <span className={`border px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                        document.status === 'approved'
                            ? 'border-sage/30 bg-sage/10 text-sage'
                            : 'border-subtle bg-ivory text-sage'
                    }`}>
                        {document.status_label}
                    </span>
                    {document.downloadable && (
                        <a
                            href={document.download_url}
                            className={`${anneauFocus} border border-hairline px-3 py-2 text-body-sm text-ink hover:border-ink`}
                        >
                            Télécharger
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-caps uppercase tracking-wider text-sage">{label}</span>
            {children}
        </label>
    );
}
