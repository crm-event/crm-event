import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head, usePage } from '@inertiajs/react';

/**
 * Home page of the couple space.
 *
 * Greets the couple by the first names of the two partners, read from the
 * `couples` record linked to the account. If no record is linked yet, it falls
 * back on the account name. The countdown and the key information of the
 * wedding will come once the weddings model exists.
 */
export default function Home({ couple }) {
    const user = usePage().props.auth.user;

    // "Marie et Paul", "Marie" if there is a single first name, or the account
    // name as a fallback.
    const names = couple
        ? [couple.partner1_first_name, couple.partner2_first_name]
            .filter(Boolean)
            .join(' et ')
        : user.name;

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
                Votre espace se construit au fil de votre projet : les rubriques
                apparaîtront ici à mesure que Jessica les ouvre pour vous.
            </p>
        </CoupleLayout>
    );
}
