import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isValidationError } from '@/api/http';
import { useAuth } from '@/auth/AuthContext';

export function LoginPage() {
    const { status, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (status === 'authenticated') {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await login(email, password, remember);
            const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(
                isValidationError(err)
                    ? (err.response?.data.errors.email?.[0] ?? err.response?.data.message ?? 'Connexion refusée.')
                    : 'Impossible de contacter le serveur.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
                <h1 className="text-xl font-semibold">Espace coordination</h1>

                <label className="block">
                    <span className="text-sm text-gray-700">Email</span>
                    <input
                        type="email"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>

                <label className="block">
                    <span className="text-sm text-gray-700">Mot de passe</span>
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Se souvenir de moi
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
                >
                    {submitting ? 'Connexion…' : 'Se connecter'}
                </button>
            </form>
        </main>
    );
}
