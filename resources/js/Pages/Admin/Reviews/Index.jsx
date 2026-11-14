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
 * Rating out of five, drawn with stars.
 */
function Stars({ rating }) {
    return (
        <span className="text-[18px] tracking-[0.1em] text-sage" role="img" aria-label={`${rating} étoile${rating > 1 ? 's' : ''} sur 5`}>
            <span aria-hidden="true">
                {'★'.repeat(rating)}
                <span className="text-hairline">{'★'.repeat(5 - rating)}</span>
            </span>
        </span>
    );
}

/**
 * Reviews: the couples whose wedding is over, whom Jessica invites with one
 * click, the couples who have not answered yet, and the reviews received.
 */
export default function Reviews({ weddings, pending = [], received = [] }) {
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

                {pending.length > 0 && (
                    <section className="mt-14">
                        <h2 className="font-display text-2xl tracking-tight text-ink">En attente de réponse</h2>
                        <p className="mt-2 text-body text-sage">
                            Ces couples ont été invités et peuvent répondre depuis l’onglet « Votre avis » de leur espace.
                        </p>
                        <ul className="mt-6 divide-y divide-hairline rounded-lg border border-hairline bg-white">
                            {pending.map((review) => (
                                <li key={review.id} className="flex items-center justify-between gap-4 px-6 py-4">
                                    <p className="font-display text-title-sm text-ink">{review.title}</p>
                                    <p className="text-body-sm text-sage">Invités le {formatDate(review.requested_at)}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="mt-14">
                    <h2 className="font-display text-2xl tracking-tight text-ink">Avis reçus</h2>

                    {received.length === 0 ? (
                        <p className="mt-4 text-body text-sage">Aucun avis reçu pour le moment.</p>
                    ) : (
                        <ul className="mt-6 space-y-4">
                            {received.map((review) => (
                                <li key={review.id} className="rounded-lg border border-hairline bg-white p-6">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-display text-title-sm text-ink">{review.title}</p>
                                        <p className="text-body-sm text-sage">Reçu le {formatDate(review.submitted_at)}</p>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <Stars rating={review.rating} />
                                        <span className="text-body-sm text-ink">
                                            {review.would_recommend ? 'Recommande La Dernière Touche' : 'Ne recommande pas La Dernière Touche'}
                                        </span>
                                    </div>
                                    {review.body && (
                                        <p className="mt-4 whitespace-pre-line text-body text-ink">{review.body}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </BackOfficeLayout>
    );
}
