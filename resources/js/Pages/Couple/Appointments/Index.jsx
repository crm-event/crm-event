import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head } from '@inertiajs/react';

const MODE_LABELS = {
    in_person: 'Sur place',
    video: 'Visioconférence',
    phone: 'Téléphone',
};

/**
 * "8 décembre 2026 à 10h00", from a date string without time zone.
 */
function formatDateTime(value) {
    const date = new Date(value);
    const day = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} à ${date.getHours()}h${minutes}`;
}

function AppointmentList({ appointments, emptyMessage }) {
    if (appointments.length === 0) {
        return <p className="mt-6 text-base text-ink/60">{emptyMessage}</p>;
    }

    return (
        <ul className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
            {appointments.map((appointment) => (
                <li key={appointment.id} className="px-6 py-5">
                    <h3 className="font-display text-lg">{appointment.title}</h3>
                    <p className="mt-1 text-sm text-ink/70">
                        {formatDateTime(appointment.starts_at)}
                    </p>
                    {appointment.mode && (
                        <p className="text-sm text-ink/70">
                            {MODE_LABELS[appointment.mode]}
                        </p>
                    )}
                    {appointment.location && (
                        <p className="text-sm text-ink/70">{appointment.location}</p>
                    )}
                    {appointment.notes && (
                        <p className="text-sm text-ink/70">{appointment.notes}</p>
                    )}
                </li>
            ))}
        </ul>
    );
}

/**
 * Appointments of the couple, read-only: they come from Jessica's agenda.
 */
export default function Index({ upcoming, past }) {
    return (
        <CoupleLayout active="appointments">
            <Head title="Rendez-vous" />

            <p className="text-[11px] uppercase tracking-brand text-sage">
                Vos étapes ensemble
            </p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">
                Vos rendez-vous
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                Les points de suivi convenus avec Jessica. Pour un changement de
                date, écrivez-lui directement.
            </p>

            <h2 className="mt-12 font-display text-2xl">À venir</h2>
            <AppointmentList
                appointments={upcoming}
                emptyMessage="Aucun rendez-vous à venir pour le moment."
            />

            {past.length > 0 && (
                <>
                    <h2 className="mt-12 font-display text-2xl">Passés</h2>
                    <AppointmentList appointments={past} emptyMessage="" />
                </>
            )}

            <p className="mt-8 text-sm text-ink/60">
                Ces rendez-vous proviennent de l’agenda de Jessica. Ils sont
                affichés ici pour information.
            </p>
        </CoupleLayout>
    );
}
