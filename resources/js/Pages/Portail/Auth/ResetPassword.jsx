import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import TextField from '@/Components/TextField';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('portail.password.store'));
    };

    return (
        <GuestLayout title="Nouveau mot de passe">
            <Head title="Nouveau mot de passe" />

            <form onSubmit={submit} className="space-y-4">
                <TextField
                    id="email"
                    label="Adresse e-mail"
                    type="email"
                    value={data.email}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <TextField
                    id="password"
                    label="Nouveau mot de passe"
                    type="password"
                    value={data.password}
                    autoComplete="new-password"
                    autoFocus
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <TextField
                    id="password_confirmation"
                    label="Confirmation"
                    type="password"
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    Enregistrer
                </button>
            </form>
        </GuestLayout>
    );
}
