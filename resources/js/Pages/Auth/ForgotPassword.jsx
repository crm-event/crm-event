import FieldError from '@/Components/FieldError';
import AuthLayout, { StatusMessage } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { fieldLabel, primaryButton, textField, textLink } from '@/brand';

/**
 * Forgotten password page: the user enters their e-mail address and receives
 * a link to choose a new password.
 *
 * This lets couples get back into their space on their own, without having to
 * ask Jessica. The form and its submission are Breeze's
 * (PasswordResetLinkController), only the presentation changes.
 */
export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout
            caption="Mot de passe oublié"
            title="Retrouvons votre accès."
            intro="Indiquez l’adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe."
        >
            <Head title="Mot de passe oublié" />

            <StatusMessage message={status} />

            <form onSubmit={submit} className="mt-10">
                <label htmlFor="email" className={fieldLabel}>
                    Adresse e-mail
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className={`${textField} mt-2`}
                    autoComplete="username"
                    autoFocus
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    onChange={(e) => setData('email', e.target.value)}
                />
                <FieldError id="email-error" message={errors.email} />

                <button
                    type="submit"
                    className={`${primaryButton} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
                    disabled={processing}
                >
                    {processing ? 'Envoi…' : 'Recevoir le lien'}
                </button>
            </form>

            <p className="mt-10 text-sm text-ink/70">
                Vous l’avez retrouvé ?{' '}
                <Link href={route('login')} className={`${textLink} text-ink`}>
                    Revenir à la connexion
                </Link>
            </p>
        </AuthLayout>
    );
}
