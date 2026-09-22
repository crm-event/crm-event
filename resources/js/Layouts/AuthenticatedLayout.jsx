import { useForm } from '@inertiajs/react';

/**
 * `logoutRoute` diffère selon l'espace : chaque guard a sa propre route de
 * déconnexion, on ne peut donc pas la coder en dur ici.
 */
export default function AuthenticatedLayout({ title, logoutRoute, children }) {
    const { post, processing } = useForm();

    const logout = (event) => {
        event.preventDefault();
        post(logoutRoute);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
                    <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                    <form onSubmit={logout}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Se déconnecter
                        </button>
                    </form>
                </div>
            </header>
            <main className="mx-auto max-w-5xl p-6">{children}</main>
        </div>
    );
}
