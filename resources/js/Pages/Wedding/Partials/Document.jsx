
import Icone from '@/Components/Icone';

/**
 * Formate la taille du fichier en octets, Ko ou Mo.
 */
function formaterTaille(taille) {
    const bytes = Number(taille ?? 0);

    if (bytes < 1024) {
        return `${bytes} octets`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} Ko`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Change a technical categorie into a label
 */
function formaterCategorie(categorie) {
    if (!categorie) return 'Non classé';

    return categorie
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (lettre) => lettre.toUpperCase());
}

/**
 * Creates the link to the stored file.
 * 
 * If file_path already contains a URL, it is retained.
 */
function obtenirLienFichier(filePath) {
    if (!filePath) return null;

    if (
        filePath.startsWith('http://') ||
        filePath.startsWith('https://') ||
        filePath.startsWith('/')
    ) {
        return filePath;
    }

    return `/storage/${filePath}`;
}

function Document({ document }) {
    const lien = obtenirLienFichier(document.file_path);

    return (
        <article className="flex flex-col gap-4 rounded-xl border border-[#e8e3dc] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f1e9e3] text-[#72746a]">
                    <Icone nom="file-text" />
                </div>

                <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-black">
                            {document.title || 'Document sans titre'}
                        </h3>

                        <span className="rounded-full bg-[#f8f6f2] px-2 py-1 text-xs text-[#72746a]">
                            {formaterCategorie(document.category)}
                        </span>
                    </div>

                    {document.message && (
                        <p className="mb-2 text-sm text-gray-600">
                            {document.message}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>{formaterTaille(document.size_bytes)}</span>

                        {document.mime_type && (
                            <span>{document.mime_type}</span>
                        )}
                    </div>

                    {document.requires_approval && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                            <Icone nom="clock" />
                            Validation requise
                        </p>
                    )}
                </div>
            </div>

            {lien ? (
                <a
                    href={lien}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#72746a] px-3 py-2 text-sm text-[#72746a] transition hover:bg-[#f8f6f2]"
                >
                    <Icone nom="external-link" />
                    Consulter
                </a>
            ) : (
                <span className="text-xs text-gray-400">
                    Fichier indisponible
                </span>
            )}
        </article>
    );
}

/**
 * List of the document associated with the couple/wedding
 */
export default function Documents({ documents = [] }) {
    if (!documents.length) {
        return (
            <div className="rounded-xl border border-dashed border-[#d8d2ca] bg-white p-8 text-center">
                <div className="mb-3 flex justify-center text-[#72746a]">
                    <Icone nom="folder-open" />
                </div>

                <h3 className="font-medium text-black">
                    Aucun document pour le moment
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Les documents associés à ce mariage apparaîtront ici.
                </p>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-black">
                    Documents du mariage
                </h2>

                <span className="text-sm text-gray-500">
                    {documents.length} document{documents.length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-3">
                {documents.map((document) => (
                    <Document
                        key={document.id}
                        document={document}
                    />
                ))}
            </div>
        </section>
    );
}
