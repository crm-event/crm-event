import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Home() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout title="Notre espace" logoutRoute={route('portail.logout')}>
            <Head title="Notre espace" />

            <p className="text-gray-700">
                Connectés en tant que <strong>{auth.couple?.email}</strong>.
            </p>
        </AuthenticatedLayout>
    );
}
