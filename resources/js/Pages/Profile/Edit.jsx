import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import CoupleLayout from '@/Layouts/CoupleLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

/**
 * "Mon compte" page, shown inside the space of the logged-in user: the couple
 * space for a couple, the back office for Jessica.
 *
 * Only couples can delete their account (personal data, GDPR): deleting the
 * administrator account would lock Jessica out of her own application.
 */
export default function Edit({ canDeleteAccount }) {
    const isAdmin = usePage().props.auth.user.role === 'admin';

    const content = (
        <>
            <Head title="Mon compte" />

            <div className="w-full max-w-3xl">
                <p className="text-[11px] uppercase tracking-brand text-sage">Vos informations</p>
                <h1 className="mt-6 font-display text-3xl leading-snug sm:text-4xl">Mon compte</h1>

                <div className="mt-10 space-y-6">
                    <Panel>
                        <UpdateProfileInformationForm />
                    </Panel>
                    <Panel>
                        <UpdatePasswordForm />
                    </Panel>
                    {canDeleteAccount && (
                        <Panel>
                            <DeleteUserForm />
                        </Panel>
                    )}
                </div>
            </div>
        </>
    );

    return isAdmin ? (
        <BackOfficeLayout actif="parametres" filAriane="Paramètres">
            {content}
        </BackOfficeLayout>
    ) : (
        <CoupleLayout active="account">{content}</CoupleLayout>
    );
}

function Panel({ children }) {
    return (
        <section className="border border-ink/5 bg-white px-5 py-7 shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:px-8">
            {children}
        </section>
    );
}
