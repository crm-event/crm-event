import CoupleLayout from '@/Layouts/CoupleLayout';
import { useTranslation } from '@/i18n';
import { Head } from '@inertiajs/react';

function buildModeLabels(t) {
    return {
        in_person: t('modeInPerson'),
        video: t('modeVideo'),
        phone: t('modePhone'),
    };
}

/**
 * "8 décembre 2026 à 10h00", from a date string without time zone.
 */
function formatDateTime(value, language) {
    const date = new Date(value);
    const locale = language === 'en' ? 'en-GB' : 'fr-FR';
    const day = date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (language === 'en') {
        return `${day} at ${date.getHours()}:${minutes}`;
    }

    return `${day} à ${date.getHours()}h${minutes}`;
}

function AppointmentList({ appointments, emptyMessage }) {
    const { language, t } = useTranslation();
    const modeLabels = buildModeLabels(t);

    if (appointments.length === 0) {
        return <p className="mt-6 text-base text-ink/60">{emptyMessage}</p>;
    }

    return (
        <ul className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
            {appointments.map((appointment) => (
                <li key={appointment.id} className="px-6 py-5">
                    <h3 className="font-display text-lg">{appointment.title}</h3>
                    <p className="mt-1 text-sm text-ink/70">
                        {formatDateTime(appointment.starts_at, language)}
                    </p>
                    {appointment.mode && (
                        <p className="text-sm text-ink/70">
                            {modeLabels[appointment.mode]}
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
    const { language, t } = useTranslation();

    return (
        <CoupleLayout active="appointments">
            <Head title={t('appointments')} />

            <p className="text-[11px] uppercase tracking-brand text-sage">
                {t('yourMilestones')}
            </p>

            <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">
                {t('yourAppointments')}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
                {t('appointmentIntro')}
            </p>

            <h2 className="mt-12 font-display text-2xl">{t('appointmentNext')}</h2>
            <AppointmentList
                appointments={upcoming}
                emptyMessage={t('noUpcomingAppointments')}
            />

            {past.length > 0 && (
                <>
                    <h2 className="mt-12 font-display text-2xl">{t('appointmentPast')}</h2>
                    <AppointmentList appointments={past} emptyMessage="" />
                </>
            )}

            <p className="mt-8 text-sm text-ink/60">
                {t('appointmentsFromJessica')}
            </p>
        </CoupleLayout>
    );
}
