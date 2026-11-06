import FieldError from '@/Components/FieldError';
import Icone from '@/Components/Icone';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const inputClasses = 'w-full border border-hairline bg-ivory px-3 py-3 text-body';

/**
 * Client spaces: Jessica opens the space of a couple, then gives them the
 * temporary code displayed here, which they replace at their first login.
 */
export default function Index({ couples, temporaryCode }) {
    return (
        <BackOfficeLayout actif="espaces-clients" filAriane="Espaces clients">
            <Head title="Espaces clients" />

            <div className="flex w-full max-w-3xl flex-col gap-8">
                <header>
                    <h1 className="font-display text-3xl tracking-tight text-ink">Espaces clients</h1>
                    <p className="mt-2 text-body text-sage">
                        Ouvrez l’espace d’un couple, puis transmettez-lui son code provisoire.
                    </p>
                </header>

                {temporaryCode && <TemporaryCode key={temporaryCode.code} temporaryCode={temporaryCode} />}

                <NewCoupleForm />

                <section aria-labelledby="couples-title">
                    <h2 id="couples-title" className="font-display text-xl text-ink">
                        Espaces ouverts
                    </h2>

                    {couples.length === 0 ? (
                        <p className="mt-4 rounded-lg border border-hairline bg-white px-6 py-10 text-center text-body text-sage">
                            Aucun espace n’a encore été ouvert.
                        </p>
                    ) : (
                        <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-white">
                            {couples.map((couple) => (
                                <CoupleRow key={couple.id} couple={couple} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </BackOfficeLayout>
    );
}

/**
 * The code just generated, displayed only once: after that, the only way to
 * get one is to generate a new code.
 */
function TemporaryCode({ temporaryCode }) {
    const [isCopied, setIsCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(temporaryCode.code);
        setIsCopied(true);
    };

    return (
        <section role="status" className="rounded-lg border border-ink bg-white p-6 sm:p-8">
            <p className="text-caps uppercase tracking-wider text-sage">Code provisoire · {temporaryCode.couple}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
                <code className="break-all font-mono text-2xl text-ink">{temporaryCode.code}</code>
                <button
                    type="button"
                    onClick={copy}
                    className={`${anneauFocus} inline-flex items-center gap-2 border border-hairline px-3 py-2 text-label text-ink hover:bg-ivory`}
                >
                    <Icone nom={isCopied ? 'check' : 'content_copy'} className="text-[16px]" />
                    {isCopied ? 'Copié' : 'Copier'}
                </button>
            </div>
            <p className="mt-4 text-body-sm text-sage">
                Identifiant : {temporaryCode.email}. Notez ce code et transmettez-le au couple : il ne sera plus
                affiché. Il devra le remplacer par son propre mot de passe à sa première connexion.
            </p>
        </section>
    );
}

function NewCoupleForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        partner1_first_name: '',
        partner1_last_name: '',
        partner2_first_name: '',
        partner2_last_name: '',
        email: '',
        wedding_date: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.couples.store'), { onSuccess: () => reset() });
    };

    const textField = (name, label, type = 'text') => (
        <Field label={label}>
            <input
                type={type}
                value={data[name]}
                onChange={(event) => setData(name, event.target.value)}
                aria-invalid={Boolean(errors[name])}
                className={inputClasses}
            />
            <FieldError message={errors[name]} />
        </Field>
    );

    return (
        <form onSubmit={submit} className="space-y-6 rounded-lg border border-hairline bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl text-ink">Ouvrir un espace</h2>

            <div className="grid gap-6 sm:grid-cols-2">
                {textField('partner1_first_name', 'Prénom')}
                {textField('partner1_last_name', 'Nom (facultatif)')}
                {textField('partner2_first_name', 'Prénom du conjoint (facultatif)')}
                {textField('partner2_last_name', 'Nom du conjoint (facultatif)')}
                {textField('email', 'Adresse e-mail (identifiant)', 'email')}
                {textField('wedding_date', 'Date du mariage (facultative)', 'date')}
            </div>

            <button
                type="submit"
                disabled={processing}
                className={`${anneauFocus} bg-ink px-6 py-3 text-caps uppercase tracking-wider text-white disabled:opacity-50`}
            >
                {processing ? 'Création…' : 'Créer l’espace et le code'}
            </button>
        </form>
    );
}

function CoupleRow({ couple }) {
    const issueNewCode = () => {
        if (window.confirm(`Générer un nouveau code pour ${couple.names} ? L’ancien ne fonctionnera plus.`)) {
            router.post(route('admin.couples.temporary-code', couple.id));
        }
    };

    return (
        <li className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="min-w-0">
                <p className="text-body text-ink">{couple.names}</p>
                <p className="break-all text-body-sm text-sage">
                    {couple.email}
                    {couple.wedding_date &&
                        ` · ${dateFormatter.format(new Date(`${couple.wedding_date}T12:00:00`))}`}
                </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span className="rounded-full bg-ivory px-3 py-1 text-[11px] text-sage">
                    {couple.is_waiting_first_login ? 'En attente de première connexion' : 'Accès actif'}
                </span>
                {couple.is_waiting_first_login && (
                    <button
                        type="button"
                        onClick={issueNewCode}
                        className={`${anneauFocus} border border-hairline px-3 py-2 text-label text-ink hover:bg-ivory`}
                    >
                        Nouveau code
                    </button>
                )}
            </div>
        </li>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-caps uppercase tracking-wider text-sage">{label}</span>
            {children}
        </label>
    );
}
