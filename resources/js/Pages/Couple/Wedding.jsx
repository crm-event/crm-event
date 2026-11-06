import Icone from '@/Components/Icone';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head } from '@inertiajs/react';

// The wedding date has no time: read it as UTC so it never shifts by one day.
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
});

function formatDate(date) {
    return dateFormatter.format(new Date(date));
}

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

function HeroDetail({ label, children }) {
    return (
        <div>
            <dt className="text-[11px] uppercase tracking-brand text-sage">{label}</dt>
            <dd className="mt-2 text-base">{children}</dd>
        </div>
    );
}

/**
 * Main frame of the tab: names of the couple, countdown to the big day, then
 * the date and the services booked with Jessica.
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

            <dl className="mt-10 grid gap-6 border-t border-ink/10 pt-6 sm:grid-cols-2">
                <HeroDetail label="Date">
                    {wedding.date === null ? (
                        'À définir'
                    ) : (
                        <span className="first-letter:uppercase">{formatDate(wedding.date)}</span>
                    )}
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

function Detail({ icon, label, className = '', children }) {
    return (
        <div className={`flex gap-4 rounded-lg border border-ink/10 p-6 ${className}`}>
            <Icone nom={icon} className="text-[24px] text-sage" />
            <div>
                <dt className="text-[11px] uppercase tracking-brand text-sage">{label}</dt>
                <dd className="mt-2 text-base">{children}</dd>
            </div>
        </div>
    );
}

/**
 * Venue of the wedding: its name, full address and access notes.
 */
function VenueDetail({ venue }) {
    if (!venue) {
        return (
            <Detail icon="location_on" label="Lieu" className="sm:col-span-2">
                À définir
            </Detail>
        );
    }

    const cityLine = [venue.postal_code, venue.city].filter(Boolean).join(' ');

    return (
        <Detail icon="location_on" label="Lieu" className="sm:col-span-2">
            <span className="block font-display text-xl">{venue.name}</span>
            {(venue.address || cityLine) && (
                <address className="mt-1 not-italic text-ink/70">
                    {venue.address && <span className="block">{venue.address}</span>}
                    {cityLine && <span className="block">{cityLine}</span>}
                </address>
            )}
            {venue.access_notes && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">
                    {venue.access_notes}
                </p>
            )}
        </Detail>
    );
}

/**
 * "Notre mariage" tab: the main frame (names, countdown, date and services),
 * then the guests, the progress and the venue.
 */
export default function Wedding({ coupleNames, wedding }) {
    return (
        <CoupleLayout active="wedding">
            <Head title="Notre mariage" />

            {wedding === null ? (
                <>
                    <h1 className="font-display text-3xl leading-snug sm:text-4xl">
                        Notre mariage
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
                        <VenueDetail venue={wedding.venue} />
                    </dl>
                </>
            )}
        </CoupleLayout>
    );
}
