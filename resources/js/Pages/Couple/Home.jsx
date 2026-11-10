import Icone from '@/Components/Icone';
import { useLanguage } from '@/Components/LanguageSwitcher';
import { translate } from '@/i18n';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { secondaryButton } from '@/brand';
import { Head, Link } from '@inertiajs/react';

function getWeddingDateFormatter(language) {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function getAppointmentDateFormatter(language) {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function buildModeLabels(t) {
    return {
        in_person: t('modeInPersonHome'),
        video: t('modeVideoHome'),
        phone: t('modePhoneHome'),
    };
}

/**
 * Days left before the wedding, sent by the server (negative once the day has
 * passed, null while the date is not set): the figure, then its caption on the
 * next line.
 */
function countdownLines({ date, days_until: daysUntil }, t) {
    if (date === null) {
        return [t('dateToDefine'), t('forTheBigDay')];
    }

    if (daysUntil >= 1) {
        return [t('daysBeforeBigDay', { value: daysUntil }), t('beforeTheBigDay')];
    }

    if (daysUntil === 0) {
        return [t('today'), t('itsTheBigDay')];
    }

    return [t('weddingCelebrated'), t('thankYouTrust')];
}

/**
 * Time left before an appointment, as sent by the server: whole days, whole
 * hours when less than a day remains, or less than an hour.
 */
function formatStartsIn({ unit, value }, t) {
    if (unit === 'days') {
        return t('inDays', { value });
    }

    if (unit === 'hours') {
        return t('inHours', { value });
    }

    return t('inLessThanHour');
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
function HeroVenue({ venue, t }) {
    if (!venue) {
        return t('toDefine');
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
function WeddingHero({ coupleNames, wedding, t, language }) {
    const [figure, caption] = countdownLines(wedding, t);
    const { services } = wedding;
    const weddingDateFormatter = getWeddingDateFormatter(language);

    return (
        <section className="rounded-lg bg-blush p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-brand text-sage">{t('myWedding')}</p>
            <h1 className="mt-4 font-display text-3xl leading-snug sm:text-4xl">
                {coupleNames || t('yourBigDay')}
            </h1>

            <p className="mt-8 font-display text-5xl sm:text-6xl">{figure}</p>
            <p className="mt-2 text-base text-ink/70">{caption}</p>

            <dl className="mt-10 grid gap-6 border-t border-ink/10 pt-6 sm:grid-cols-3">
                <HeroDetail label={t('date')}>
                    {wedding.date === null ? (
                        t('toDefine')
                    ) : (
                        <span className="block first-letter:uppercase">
                            {weddingDateFormatter.format(new Date(wedding.date))}
                        </span>
                    )}
                </HeroDetail>
                <HeroDetail label={t('place')}>
                    <HeroVenue venue={wedding.venue} t={t} />
                </HeroDetail>
                <HeroDetail label={t('services')}>
                    {services.length === 0 ? (
                        t('toDefine')
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

function NextAppointment({ appointment, language, t }) {
    const appointmentDateFormatter = getAppointmentDateFormatter(language);
    const modeLabels = buildModeLabels(t);

    if (!appointment) {
        return (
            <div className="rounded-lg border border-ink/10 p-6 sm:col-span-2">
                <p className="text-[11px] uppercase tracking-brand text-sage">
                    {t('nextAppointment')}
                </p>
                <p className="mt-4 text-base text-ink/70">
                    {t('noAppointmentPlanned')}
                </p>
            </div>
        );
    }

    const details = [modeLabels[appointment.mode], appointment.location].filter(Boolean);

    return (
        <div className="rounded-lg border border-ink/10 p-6 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-brand text-sage">
                {t('nextAppointment')}
            </p>
            <p className="mt-4 font-display text-3xl">
                {formatStartsIn(appointment.starts_in, t)}
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

function UnreadMessages({ count, t }) {
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
                {count === 0 && t('noNewMessage')}
                {count === 1 && t('newMessage')}
                {count > 1 && t('newMessages')}
            </p>
            <div className="mt-auto pt-6">
                <Link href={route('couple.messages.index')} className={`${secondaryButton} w-full`}>
                    {t('accessMessages')}
                </Link>
            </div>
        </div>
    );
}

/**
 * Key figures about the documents of the couple, grouped in their own panel
 * so they are not mistaken for the appointment and messages cards above.
 */
function DocumentsSummary({ documents, t }) {
    const stats = [
        { label: t('availableDocuments'), value: documents.total },
        { label: t('unseenDocuments'), value: documents.unseen },
        { label: t('documentsToSign'), value: documents.to_sign },
    ];

    return (
        <section aria-labelledby="documents-summary-title" className="mt-14">
            <h2
                id="documents-summary-title"
                className="border-b border-ink/10 pb-4 font-display text-xl"
            >
                {t('yourDocuments')}
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
                {t('seeYourDocuments')}
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
    const { language } = useLanguage();
    const t = (key, params = {}) => {
        const value = translate(language, key);

        if (typeof value !== 'string') {
            return key;
        }

        return value.replace(/\{(\w+)\}/g, (_, paramName) => String(params[paramName] ?? `{${paramName}}`));
    };

    return (
        <CoupleLayout active="wedding">
            <Head title={t('myWedding')} />

            {wedding === null ? (
                <>
                    <h1 className="font-display text-3xl leading-snug sm:text-4xl">
                        {t('myWedding')}
                    </h1>
                    <div className="mt-10 border border-ink/10 bg-white px-6 py-10 text-center text-sm text-ink/60">
                        {t('weddingInfoSoon')}
                    </div>
                </>
            ) : (
                <>
                    <WeddingHero coupleNames={coupleNames} wedding={wedding} t={t} language={language} />

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Detail icon="groups" label={t('guests')}>
                            {wedding.guest_count === null
                                ? t('guestCountToSpecify')
                                : t('guestCount', { value: wedding.guest_count })}
                        </Detail>
                        <Detail icon="task_alt" label={t('progress')}>
                            {wedding.status_label}
                        </Detail>
                    </dl>
                </>
            )}

            <section className="mt-14 grid gap-4 sm:grid-cols-3">
                <NextAppointment appointment={nextAppointment} language={language} t={t} />
                <UnreadMessages count={unreadMessages} t={t} />
            </section>

            <DocumentsSummary documents={documents} t={t} />
        </CoupleLayout>
    );
}
