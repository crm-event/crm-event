import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { secondaryButton } from '@/brand';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Components/LanguageSwitcher';
import { translate } from '@/i18n';

// The wedding date has no time: read it as UTC so it never shifts by one day.
const weddingDateFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
});

const appointmentDateFormatter = new Intl.DateTimeFormat('fr-FR', {
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
 * Days left before the wedding, sent by the server (negative once the day has
 * passed, null while the date is not set): the figure, then its caption on the
 * next line.
 */
function countdownLines({ date, days_until: daysUntil }) {
    if (date === null) {
        return ['Date à définir', 'pour le grand jour'];
    }

    if (daysUntil >= 1) {
        return [`${daysUntil} jour${daysUntil > 1 ? 's' : ''}`, 'avant le grand jour'];
    }

    if (daysUntil === 0) {
        return ['Aujourd’hui', 'c’est le grand jour !'];
    }

    return ['Mariage célébré', 'merci pour votre confiance'];
}

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

function HeroDetail({ label, children }) {
    return (
        <div>
            <dt className="text-[11px] uppercase tracking-brand text-sage">{label}</dt>
            <dd className="mt-2 text-base">{children}</dd>
        </div>
    );
}

/**
 * Venue of the wedding as shown in the main frame: its name, full address and
 * access notes.
 */
function HeroVenue({ venue }) {
    if (!venue) {
        return 'À définir';
    }

    const cityLine = [venue.postal_code, venue.city].filter(Boolean).join(' ');

    return (
        <>
            <span className="block">{venue.name}</span>
            {(venue.address || cityLine) && (
                <address className="mt-1 text-sm not-italic text-ink/70">
                    {venue.address && <span className="block">{venue.address}</span>}
                    {cityLine && <span className="block">{cityLine}</span>}
                </address>
            )}
            {venue.access_notes && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">
                    {venue.access_notes}
                </p>
            )}
        </>
    );
}

/**
 * Main frame of the page: names of the couple, countdown to the big day, then
 * the date, the venue and the services booked with Jessica.
 */
function WeddingHero({ coupleNames, wedding }) {
    const [figure, caption] = countdownLines(wedding);
    const { services } = wedding;

    return (
        <section className="rounded-lg bg-blush p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-brand text-sage">Notre mariage</p>
            <h1 className="mt-4 font-display text-3xl leading-snug sm:text-4xl">
                {coupleNames || 'Votre grand jour'}
            </h1>

            <p className="mt-8 font-display text-5xl sm:text-6xl">{figure}</p>
            <p className="mt-2 text-base text-ink/70">{caption}</p>

            <dl className="mt-10 grid gap-6 border-t border-ink/10 pt-6 sm:grid-cols-3">
                <HeroDetail label="Date">
                    {wedding.date === null ? (
                        'À définir'
                    ) : (
                        <span className="block first-letter:uppercase">
                            {weddingDateFormatter.format(new Date(wedding.date))}
                        </span>
                    )}
                </HeroDetail>
                <HeroDetail label="Lieu">
                    <HeroVenue venue={wedding.venue} />
                </HeroDetail>
                <HeroDetail label="Prestations">
                    {services.length === 0 ? (
                        'À définir'
                    ) : (
                        <ul>
                            {services.map((service) => (
                                <li key={service}>{service}</li>
                            ))}
                        </ul>
                    )}
                </HeroDetail>
            </dl>
        </section>
    );
}

function Detail({ icon, label, children }) {
    return (
        <div className="flex gap-4 rounded-lg border border-ink/10 p-6">
            <Icone nom={icon} className="text-[24px] text-sage" />
            <div>
                <dt className="text-[11px] uppercase tracking-brand text-sage">{label}</dt>
                <dd className="mt-2 text-base">{children}</dd>
            </div>
        </div>
    );
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
        <div className="rounded-lg border border-ink/10 p-6 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-brand text-sage">
                Prochain rendez-vous
            </p>
            <p className="mt-4 font-display text-3xl">
                {formatStartsIn(appointment.starts_in)}
            </p>
            <p className="mt-3 text-base">{appointment.title}</p>
            <p className="mt-1 text-sm text-ink/70">
                {appointmentDateFormatter.format(new Date(appointment.starts_at))}
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
 * "Notre mariage" tab, the page a couple lands on after logging in: the main
 * frame (names, countdown, date, venue and services), the guests and the
 * progress, then what comes next (appointment, messages, documents).
 */
export default function Home({ coupleNames, wedding, nextAppointment, unreadMessages, documents }) {
    const language = useLanguage().language;
    const t = (key) => translate(language, key);

    return (
        <CoupleLayout active="wedding">
            <Head title={t('myWedding')} />

            {wedding === null ? (
                <>
                    <h1 className="font-display text-3xl leading-snug sm:text-4xl">
                        {t('myWedding')}
                    </h1>
                    <div className="mt-10 border border-ink/10 bg-white px-6 py-10 text-center text-sm text-ink/60">
                        Les informations de votre mariage seront bientôt disponibles.
                    </div>
                </>
            ) : (
                <>
                    <WeddingHero coupleNames={coupleNames} wedding={wedding} />

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Detail icon="groups" label="Invités">
                            {wedding.guest_count === null
                                ? 'Nombre à préciser'
                                : `${wedding.guest_count} invité${wedding.guest_count > 1 ? 's' : ''}`}
                        </Detail>
                        <Detail icon="task_alt" label="Avancement">
                            {wedding.status_label}
                        </Detail>
                    </dl>
                </>
            )}

            <section className="mt-14 grid gap-4 sm:grid-cols-3">
                <NextAppointment appointment={nextAppointment} />
                <UnreadMessages count={unreadMessages} />
            </section>

            <DocumentsSummary documents={documents} />
        </CoupleLayout>
    );
}
