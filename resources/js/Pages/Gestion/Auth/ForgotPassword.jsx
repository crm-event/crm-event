import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import TextField from '@/Components/TextField';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (event) => {
        event.preventDefault();
        post(route('gestion.password.email'));
    };

    return (
        <GuestLayout title="Mot de passe oublié">
            <Head title="Mot de passe oublié" />

            <p className="mb-4 text-sm text-gray-600">
                Indiquez votre adresse e-mail : vous recevrez un lien pour
                définir un nouveau mot de passe.
            </p>

            {status && <p className="mb-4 text-sm text-green-700">{status}</p>}

            <form onSubmit={submit} className="space-y-4">
                <TextField
                    id="email"
                    label="Adresse e-mail"
                    type="email"
                    value={data.email}
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    Envoyer le lien
                </button>
            </form>
        </GuestLayout>
    );
}
