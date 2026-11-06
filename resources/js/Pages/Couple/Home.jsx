import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { secondaryButton } from '@/brand';
import { Head, Link, usePage } from '@inertiajs/react';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const MODE_LABELS = {
    in_person: 'En personne',
    video: 'En visio',
    phone: 'Par téléphone',
};

/**
 * Time left before an appointment, as sent by the server: whole days, whole
 * hours when less than a day remains, or less than an hour.
 */
function formatStartsIn({ unit, value }) {
    if (unit === 'days') {
        return `Dans ${value} jour${value > 1 ? 's' : ''}`;
    }

    if (unit === 'hours') {
        return `Dans ${value} heure${value > 1 ? 's' : ''}`;
    }

    return 'Dans moins d’une heure';
}

function NextAppointment({ appointment }) {
    if (!appointment) {
        return (
            <div className="rounded-lg border border-ink/10 p-6 sm:col-span-2">
                <p className="text-[11px] uppercase tracking-brand text-sage">
                    Prochain rendez-vous
                </p>
                <p className="mt-4 text-base text-ink/70">
                    Aucun rendez-vous n’est prévu pour le moment.
                </p>
            </div>
        );
    }

    const details = [MODE_LABELS[appointment.mode], appointment.location].filter(Boolean);

    return (
        <div className="rounded-lg bg-blush p-6 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-brand text-sage">
                Prochain rendez-vous
            </p>
            <p className="mt-4 font-display text-3xl">
                {formatStartsIn(appointment.starts_in)}
            </p>
            <p className="mt-3 text-base">{appointment.title}</p>
            <p className="mt-1 text-sm text-ink/70">
                {dateFormatter.format(new Date(appointment.starts_at))}
            </p>
            {details.length > 0 && (
                <p className="mt-1 text-sm text-ink/70">{details.join(' · ')}</p>
            )}
        </div>
    );
}

function UnreadMessages({ count }) {
    return (
        <div className="flex flex-col rounded-lg border border-ink/10 p-6">
            <p className="text-[11px] uppercase tracking-brand text-sage">Messages</p>
            <div className="mt-4 flex items-center gap-3">
                <Icone
                    nom={count > 0 ? 'mark_chat_unread' : 'chat_bubble'}
                    className={`text-[28px] ${count > 0 ? 'text-sage' : 'text-ink/35'}`}
                />
                <p className="font-display text-4xl">{count}</p>
            </div>
            <p className="mt-2 text-sm text-ink/70">
                {count === 0 && 'Aucun nouveau message'}
                {count === 1 && 'Nouveau message'}
                {count > 1 && 'Nouveaux messages'}
            </p>
            <div className="mt-auto pt-6">
                <Link href={route('couple.messages.index')} className={`${secondaryButton} w-full`}>
                    Accéder aux messages
                </Link>
            </div>
        </div>
    );
}

/**
 * Key figures about the documents of the couple, grouped in their own panel
 * so they are not mistaken for the appointment and messages cards above.
 */
function DocumentsSummary({ documents }) {
    const stats = [
        { label: 'Documents disponibles', value: documents.total },
        { label: 'Documents non consultés', value: documents.unseen },
        { label: 'Documents à signer', value: documents.to_sign },
    ];

    return (
        <section aria-labelledby="documents-summary-title" className="mt-14">
            <h2
                id="documents-summary-title"
                className="border-b border-ink/10 pb-4 font-display text-xl"
            >
                Vos documents
            </h2>

            <dl className="mt-6 grid divide-y divide-ink/10 rounded-lg bg-blush/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse p-6">
                        <dt className="mt-2 text-sm text-ink/70">{stat.label}</dt>
                        <dd className="font-display text-4xl">{stat.value}</dd>
                    </div>
                ))}
            </dl>

            <Link href={route('couple.documents.index')} className={`${secondaryButton} mt-6`}>
                Voir vos documents
            </Link>
        </section>
    );
}

/**
 * Home page of the couple space: a summary of the project.
 *
 * Greets the couple by the first names of the two partners, then shows what
 * comes next (the next appointment and the unread messages) before the key
 * figures about their documents (available, not viewed yet, waiting for a
 * signature).
 */
export default function Home({ couple, nextAppointment, unreadMessages, documents }) {
    const user = usePage().props.auth.user;

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
                Voici le récapitulatif de votre projet.
            </p>

            <section className="mt-10 grid gap-4 sm:grid-cols-3">
                <NextAppointment appointment={nextAppointment} />
                <UnreadMessages count={unreadMessages} />
            </section>

            <DocumentsSummary documents={documents} />
        </CoupleLayout>
    );
}
