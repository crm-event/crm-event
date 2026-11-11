import PasswordField from '@/Components/PasswordField';
import AuthLayout from '@/Layouts/AuthLayout';
import { primaryButton, textLink } from '@/brand';
import { useTranslation } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Page shown at the first login: the user replaces the temporary password
 * given by Jessica. Until then they cannot open anything else, except logging
 * out (see EnsurePasswordIsChosen).
 */
export default function FirstPassword() {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(route('password.first.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            caption={t('auth.firstPassword.caption')}
            title={t('auth.firstPassword.title')}
            intro={t('auth.firstPassword.intro')}
        >
            <Head title={t('auth.firstPassword.caption')} />

            <form onSubmit={submit} className="mt-10">
                <PasswordField
                    id="password"
                    label={t('auth.newPassword')}
                    value={data.password}
                    error={errors.password}
                    autoComplete="new-password"
                    autoFocus
                    hint={t('auth.passwordHint')}
                    onChange={(e) => setData('password', e.target.value)}
                />

                <div className="mt-8">
                    <PasswordField
                        id="password_confirmation"
                        label={t('auth.confirmPassword')}
                        value={data.password_confirmation}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className={`${primaryButton} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
                    disabled={processing}
                >
                    {processing ? t('auth.saving') : t('auth.firstPassword.submit')}
                </button>
            </form>

            <p className="mt-8 text-center text-sm">
                <Link href={route('logout')} method="post" as="button" className={textLink}>
                    {t('auth.firstPassword.logout')}
                </Link>
            </p>
        </AuthLayout>
    );
}
