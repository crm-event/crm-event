import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, router, usePage } from '@inertiajs/react';

/**
 * "12 juin 2027", from a date string.
 */
function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Couples whose wedding is over: Jessica invites them to leave a review with
 * one click.
 */
export default function Reviews({ weddings }) {
    const success = usePage().props.flash?.success;

    const invite = (wedding) => {
        router.post(route('admin.reviews.store', wedding.id), {}, { preserveScroll: true });
    };

    return (
        <BackOfficeLayout actif="avis" filAriane="Avis">
            <Head title="Avis" />

            <div className="w-full max-w-3xl">
                <h1 className="font-display text-3xl tracking-tight text-ink">Avis à solliciter</h1>
                <p className="mt-2 text-body text-sage">
                    Ces couples se sont mariés il y a plus de 30 jours et n’ont pas encore été invités à laisser un avis.
                </p>

                {success && <p className="mt-6 text-body text-ink">{success}</p>}

                {weddings.length === 0 ? (
                    <p className="mt-8 text-body text-sage">Aucun couple à solliciter pour le moment.</p>
                ) : (
                    <ul className="mt-8 divide-y divide-hairline rounded-lg border border-hairline bg-white">
                        {weddings.map((wedding) => (
                            <li key={wedding.id} className="flex items-center justify-between gap-4 p-6">
                                <div>
                                    <p className="font-display text-title-sm text-ink">{wedding.title}</p>
                                    <p className="text-body-sm text-sage">
                                        Mariage du {formatDate(wedding.wedding_date)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => invite(wedding)}
                                    className={`${anneauFocus} bg-ink px-6 py-3 text-caps uppercase tracking-wider text-white`}
                                >
                                    Solliciter
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </BackOfficeLayout>
    );
}
