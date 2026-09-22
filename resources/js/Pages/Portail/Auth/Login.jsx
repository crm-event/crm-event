import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import TextField from '@/Components/TextField';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('portail.login'), { onFinish: () => setData('password', '') });
    };

    return (
        <GuestLayout title="Espace des mariés">
            <Head title="Connexion" />

            {status && <p className="mb-4 text-sm text-green-700">{status}</p>}

            <form onSubmit={submit} className="space-y-4">
                <TextField
                    id="email"
                    label="Adresse e-mail"
                    type="email"
                    value={data.email}
                    autoComplete="username"
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <TextField
                    id="password"
                    label="Mot de passe"
                    type="password"
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <div className="flex items-center justify-between">
                    <Link
                        href={route('portail.password.request')}
                        className="text-sm text-gray-600 underline hover:text-gray-900"
                    >
                        Mot de passe oublié ?
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                        Se connecter
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
