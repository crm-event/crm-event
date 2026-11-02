import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head, usePage } from '@inertiajs/react';

/**
 * Home page of the couple space.
 *
 * Placeholder for now: it only greets the couple inside the layout. The
 * countdown and the key information of the wedding will come once the
 * weddings and couples models exist.
 */
export default function Home() {
    const user = usePage().props.auth.user;

    return (
        <CoupleLayout active="home">
            <Head title="Mon espace" />

            <p className="text-[11px] uppercase tracking-brand text-sage">
                Espace client
            </p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">
                Bienvenue, {user.name}.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                Votre espace se construit au fil de votre projet : les rubriques
                apparaîtront ici à mesure que Jessica les ouvre pour vous.
            </p>
        </CoupleLayout>
    );
}
