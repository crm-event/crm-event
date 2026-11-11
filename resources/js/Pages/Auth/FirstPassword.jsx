import PasswordField from '@/Components/PasswordField';
import AuthLayout from '@/Layouts/AuthLayout';
import { primaryButton, textLink } from '@/brand';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Page shown at the first login: the user replaces the temporary password
 * given by Jessica. Until then they cannot open anything else, except logging
 * out (see EnsurePasswordIsChosen).
 */
export default function FirstPassword() {
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(route('password.first.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            caption="Première connexion"
            title="Choisissez votre mot de passe."
            intro="Il remplacera le code provisoire que vous avez reçu de Jessica."
        >
            <Head title="Première connexion" />

            <form onSubmit={submit} className="mt-10">
                <PasswordField
                    id="password"
                    label="Nouveau mot de passe"
                    value={data.password}
                    error={errors.password}
                    autoComplete="new-password"
                    autoFocus
                    hint="8 caractères minimum."
                    onChange={(e) => setData('password', e.target.value)}
                />

                <div className="mt-8">
                    <PasswordField
                        id="password_confirmation"
                        label="Confirmez le mot de passe"
                        value={data.password_confirmation}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className={`${primaryButton} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
                    disabled={processing}
                >
                    {processing ? 'Enregistrement…' : 'Enregistrer et accéder à mon espace'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm">
                <Link href={route('logout')} method="post" as="button" className={textLink}>
                    Se déconnecter
                </Link>
            </p>
        </AuthLayout>
    );
}
