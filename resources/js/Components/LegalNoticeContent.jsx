import { textLink } from '@/brand';
import { CONTACT } from '@/contact';
import { useTranslation } from '@/i18n';

/**
 * Hosting provider, as written in its own legal notice
 * (alwaysdata.com/fr/mentions-legales and alwaysdata.com/fr/contact).
 */
const HOST = {
    name: 'ALWAYSDATA',
    address: '91 rue du Faubourg Saint-Honoré, 75008 Paris',
    phone: '+33 1 84 16 23 40',
    phoneLink: 'tel:+33184162340',
    website: 'https://www.alwaysdata.com',
};

function Section({ title, children }) {
    return (
        <section className="border-t border-ink/10 pt-8">
            <h2 className="font-display text-xl">{title}</h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink/70">{children}</div>
        </section>
    );
}

function ListOfData({ items }) {
    return (
        <ul className="list-disc space-y-1 pl-5">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

/**
 * Legal notice of the site. The public version covers the landing page; the
 * couple space version adds what is specific to a logged-in couple: the data
 * kept in their space, the rules of use, and the scope of the « Lu et
 * approuvé » approval.
 *
 * The texts are in i18n/legal.js. The English version is a translation and
 * says that the French one prevails.
 */
export default function LegalNoticeContent({ forCoupleSpace = false }) {
    const { language, t, content } = useTranslation();
    const collectedData = forCoupleSpace
        ? [...content('legal.personalData.publicData'), ...content('legal.personalData.coupleSpaceData')]
        : content('legal.personalData.publicData');

    return (
        <div className="max-w-3xl space-y-10">
            {language !== 'fr' && (
                <p className="border-l-2 border-sage bg-blush px-4 py-3 text-sm leading-relaxed">
                    {t('legal.translationNotice')}
                </p>
            )}

            <Section title={t('legal.publisher.title')}>
                <p>
                    {t('legal.publisher.before')} <strong className="font-medium text-ink">Jessica Salles</strong>
                    {t('legal.publisher.after')}
                </p>
                <p>
                    {CONTACT.address}
                    <br />
                    {t('legal.siret')} {CONTACT.siret}
                    <br />
                    {t('legal.email')}{' '}
                    <a href={`mailto:${CONTACT.email}`} className={textLink}>
                        {CONTACT.email}
                    </a>
                    <br />
                    {t('legal.phone')}{' '}
                    <a href={CONTACT.phoneLink} className={textLink}>
                        {CONTACT.phone}
                    </a>
                </p>
                <p>{t('legal.publisher.director')}</p>
            </Section>

            <Section title={t('legal.host.title')}>
                <p>{t('legal.host.text', { name: HOST.name })}</p>
                <p>
                    {HOST.address}
                    <br />
                    {t('legal.phone')}{' '}
                    <a href={HOST.phoneLink} className={textLink}>
                        {HOST.phone}
                    </a>
                    <br />
                    <a href={HOST.website} target="_blank" rel="noreferrer" className={textLink}>
                        www.alwaysdata.com
                    </a>
                </p>
            </Section>

            <Section title={t('legal.design.title')}>
                <p>{t('legal.design.text')}</p>
            </Section>

            <Section title={t('legal.intellectualProperty.title')}>
                <p>{t('legal.intellectualProperty.text')}</p>
            </Section>

            {forCoupleSpace && (
                <Section title={t('legal.coupleSpace.title')}>
                    <p>{t('legal.coupleSpace.access')}</p>
                    <p>{t('legal.coupleSpace.approval')}</p>
                    <p>{t('legal.coupleSpace.community')}</p>
                </Section>
            )}

            <Section title={t('legal.personalData.title')}>
                <p>{t('legal.personalData.controller')}</p>
                <p>{t('legal.personalData.collected')}</p>
                <ListOfData items={collectedData} />
                <p>
                    {forCoupleSpace
                        ? t('legal.personalData.purposeCoupleSpace')
                        : t('legal.personalData.purposePublic')}
                </p>
                {forCoupleSpace && <p>{t('legal.personalData.accountDeletion')}</p>}
                <p>
                    {t('legal.personalData.rights')}{' '}
                    <a href={`mailto:${CONTACT.email}`} className={textLink}>
                        {CONTACT.email}
                    </a>
                    . {t('legal.personalData.complaint')} (
                    <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className={textLink}>
                        www.cnil.fr
                    </a>
                    ).
                </p>
            </Section>

            <Section title={t('legal.cookies.title')}>
                <p>{t('legal.cookies.text')}</p>
            </Section>
        </div>
    );
}
