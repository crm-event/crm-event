import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Garde de route : redirige vers /login tant que la session n'est pas
 * confirmée par l'API. La vraie protection reste côté serveur (guard
 * "client") ; ceci n'est que du confort d'interface.
 */
export function RequireAuth() {
    const { status } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <p className="p-8 text-gray-500">Chargement…</p>;
    }

    if (status === 'anonymous') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
