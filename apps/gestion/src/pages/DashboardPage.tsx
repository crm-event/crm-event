import { useAuth } from '@/auth/AuthContext';

export function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <main className="mx-auto max-w-4xl p-8">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Tableau de bord</h1>
                <button onClick={() => void logout()} className="rounded border px-3 py-1 text-sm">
                    Se déconnecter
                </button>
            </header>

            <p className="mt-6 text-gray-700">
                Connectée en tant que <strong>{user?.name}</strong> ({user?.email}).
            </p>
        </main>
    );
}
