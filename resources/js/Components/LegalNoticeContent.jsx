import { textLink } from '@/brand';
import { CONTACT } from '@/contact';

/**
 * Hosting provider, as written in its own legal notice
 * (alwaysdata.com/fr/mentions-legales and alwaysdata.com/fr/contact).
 */
const HOST = {
    name: 'ALWAYSDATA',
    company: 'SARL au capital de 200 000 €, immatriculée au RCS de Paris sous le numéro 492 893 490',
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

const PUBLIC_DATA = [
    'les prénoms du couple, son adresse e-mail, la date envisagée du mariage et la langue choisie, saisis dans le formulaire « Parler de votre projet ».',
];

const COUPLE_SPACE_DATA = [
    'votre identité et vos coordonnées (prénoms, noms, e-mail, téléphone, adresse) ;',
    'les informations de votre mariage : date, lieu, nombre d’invités, prestations choisies, avancement ;',
    'les documents partagés avec vous (contrats, conditions générales, devis) et les dates auxquelles vous les consultez et les approuvez ;',
    'vos messages écrits et vocaux échangés avec Jessica ;',
    'votre brief de design et les photos d’inspiration que vous ajoutez ;',
    'les messages que vous publiez dans l’espace Communauté.',
];

/**
 * Legal notice of the site. The public version covers the landing page; the
 * couple space version adds what is specific to a logged-in couple: the data
 * kept in their space, the rules of use, and the scope of the « Lu et
 * approuvé » approval.
 */
export default function LegalNoticeContent({ forCoupleSpace = false }) {
    return (
        <div className="max-w-3xl space-y-10">
            <Section title="Éditeur du site">
                <p>
                    Le site est édité par <strong className="font-medium text-ink">Jessica Salles</strong>,
                    entrepreneur individuel (EI) exerçant sous le nom commercial La Dernière Touche.
                </p>
                <p>
                    {CONTACT.address}
                    <br />
                    SIRET : {CONTACT.siret}
                    <br />
                    E-mail :{' '}
                    <a href={`mailto:${CONTACT.email}`} className={textLink}>
                        {CONTACT.email}
                    </a>
                    <br />
                    Téléphone :{' '}
                    <a href={CONTACT.phoneLink} className={textLink}>
                        {CONTACT.phone}
                    </a>
                </p>
                <p>Directrice de la publication : Jessica Salles.</p>
            </Section>

            <Section title="Hébergement">
                <p>
                    Le site et ses données sont hébergés en France par {HOST.name}, {HOST.company}.
                </p>
                <p>
                    {HOST.address}
                    <br />
                    Téléphone :{' '}
                    <a href={HOST.phoneLink} className={textLink}>
                        {HOST.phone}
                    </a>
                    <br />
                    <a href={HOST.website} target="_blank" rel="noreferrer" className={textLink}>
                        www.alwaysdata.com
                    </a>
                </p>
            </Section>

            <Section title="Conception">
                <p>L’application a été conçue et développée dans le cadre d’un projet étudiant, pour La Dernière Touche.</p>
            </Section>

            <Section title="Propriété intellectuelle">
                <p>
                    Les textes, photographies, logos et éléments graphiques du site appartiennent à La Dernière Touche
                    ou sont utilisés avec l’autorisation de leurs auteurs. Toute reproduction, même partielle, sans
                    accord écrit préalable est interdite.
                </p>
            </Section>

            {forCoupleSpace && (
                <Section title="Votre espace client">
                    <p>
                        L’espace client est réservé aux couples accompagnés par La Dernière Touche. Son accès est
                        ouvert par Jessica. Vos identifiants sont personnels : ne les communiquez à personne et
                        prévenez Jessica si vous pensez qu’ils ont été utilisés par un tiers.
                    </p>
                    <p>
                        L’approbation d’un document par la mention « Lu et approuvé » enregistre la date de votre
                        accord. Ce n’est pas une signature électronique certifiée.
                    </p>
                    <p>
                        Les messages publiés dans l’espace Communauté sont visibles par les autres couples inscrits.
                        Ils doivent rester courtois et respectueux ; Jessica peut retirer un message qui ne l’est pas.
                    </p>
                </Section>
            )}

            <Section title="Données personnelles">
                <p>
                    Jessica Salles est responsable du traitement des données personnelles collectées sur ce site.
                    Elles ne sont ni vendues ni transmises à des tiers, en dehors de l’hébergeur qui les stocke.
                </p>
                <p>Les données collectées sont :</p>
                <ListOfData items={forCoupleSpace ? [...PUBLIC_DATA, ...COUPLE_SPACE_DATA] : PUBLIC_DATA} />
                <p>
                    {forCoupleSpace
                        ? 'Elles servent à organiser votre mariage et à suivre la prestation prévue au contrat. Elles sont conservées pendant la durée du contrat, puis le temps des obligations légales de conservation.'
                        : 'Elles servent à répondre à votre demande et, si vous le souhaitez, à préparer votre projet. Elles sont conservées le temps de traiter votre demande, puis au plus trois ans après le dernier contact.'}
                </p>
                {forCoupleSpace && (
                    <p>
                        Vous pouvez supprimer votre compte depuis la page Mon compte. Les échanges et documents de
                        votre mariage restent alors rattachés à votre dossier, sans lien avec un compte de connexion.
                    </p>
                )}
                <p>
                    Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et
                    de portabilité de vos données. Pour l’exercer, écrivez à{' '}
                    <a href={`mailto:${CONTACT.email}`} className={textLink}>
                        {CONTACT.email}
                    </a>
                    . Vous pouvez aussi adresser une réclamation à la CNIL (
                    <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className={textLink}>
                        www.cnil.fr
                    </a>
                    ).
                </p>
            </Section>

            <Section title="Cookies">
                <p>
                    Le site n’utilise ni cookie publicitaire ni outil de mesure d’audience. Il dépose seulement les
                    cookies nécessaires à son fonctionnement : le maintien de votre session et la protection des
                    formulaires. Ils ne demandent donc pas votre consentement.
                </p>
                {!forCoupleSpace && (
                    <p>Votre navigateur garde aussi en mémoire la langue que vous avez choisie pour le site.</p>
                )}
            </Section>
        </div>
    );
}
