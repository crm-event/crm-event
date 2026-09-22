import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { RequireAuth } from '@/auth/RequireAuth';
import { HomePage } from '@/pages/HomePage';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage, RouteErrorBoundary } from '@/pages/NotFoundPage';

/*
|--------------------------------------------------------------------------
| Routes du portail client
|--------------------------------------------------------------------------
|
| "/"        page d'accueil publique — c'est ici qu'arrive un visiteur.
| "/login"   formulaire de connexion, public lui aussi.
| "/espace"  et tout ce qui suivra : réservé, derrière <RequireAuth />.
| "*"        seulement si aucune route ci-dessus ne correspond → page 404.
|
| `errorElement` remplace l'écran de debug de React Router par notre propre
| page : un couple ne doit jamais tomber sur une trace technique.
|
*/
const router = createBrowserRouter([
    {
        errorElement: <RouteErrorBoundary />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'login', element: <LoginPage /> },
            {
                element: <RequireAuth />,
                children: [
                    { path: 'espace', element: <HomePage /> },
                    // Les pages du portail client s'ajoutent ici, toutes derrière RequireAuth.
                ],
            },
            // Doit rester la dernière : elle n'attrape que ce qui n'a pas matché.
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

export function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
