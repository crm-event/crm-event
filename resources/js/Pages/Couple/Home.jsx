import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head, usePage } from '@inertiajs/react';

/**
 * Home page of the couple space: a summary of the project.
 *
 * Greets the couple by the first names of the two partners, then shows the
 * key figures about their documents (available, not viewed yet, waiting for a
 * signature).
 */
export default function Home({ couple, documents }) {
    const user = usePage().props.auth.user;

    const names = couple
        ? [couple.partner1_first_name, couple.partner2_first_name]
            .filter(Boolean)
            .join(' et ')
        : user.name;

    const stats = [
        { label: 'Documents disponibles', value: documents.total },
        { label: 'Documents non consultés', value: documents.unseen },
        { label: 'Documents à signer', value: documents.to_sign },
    ];

    return (
        <CoupleLayout active="home">
            <Head title="Mon espace" />

            <p className="text-[11px] uppercase tracking-brand text-sage">
                Espace client
            </p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">
                Bonjour {names}.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                Voici le récapitulatif de votre projet.
            </p>

            <section className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-lg border border-ink/10 p-6"
                    >
                        <p className="font-display text-4xl">{stat.value}</p>
                        <p className="mt-2 text-sm text-ink/70">{stat.label}</p>
                    </div>
                ))}
            </section>
        </CoupleLayout>
    );
}
