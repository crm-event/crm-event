import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout title="Tableau de bord" logoutRoute={route('gestion.logout')}>
            <Head title="Tableau de bord" />

            <p className="text-gray-700">
                Connectée en tant que <strong>{auth.manager?.email}</strong>.
            </p>
        </AuthenticatedLayout>
    );
}
