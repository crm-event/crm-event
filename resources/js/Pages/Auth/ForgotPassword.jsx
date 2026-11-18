import FieldError from '@/Components/FieldError';
import AuthLayout, { StatusMessage } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { fieldLabel, primaryButton, textField, textLink } from '@/brand';
import { useTranslation } from '@/i18n';

/**
 * Forgotten password page: the user enters their e-mail address and receives
 * a link to choose a new password.
 *
 * This lets couples get back into their space on their own, without having to
 * ask Jessica. The form and its submission are Breeze's
 * (PasswordResetLinkController), only the presentation changes.
 */
export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout
            caption={t('auth.forgotPassword.caption')}
            title={t('auth.forgotPassword.title')}
            intro={t('auth.forgotPassword.intro')}
        >
            <Head title={t('auth.forgotPassword.caption')} />

            <StatusMessage message={status} />

            <form onSubmit={submit} className="mt-10">
                <label htmlFor="email" className={fieldLabel}>
                    {t('auth.email')}
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className={`${textField} mt-2`}
                    autoComplete="username"
                    autoFocus
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    onChange={(e) => setData('email', e.target.value)}
                />
                <FieldError id="email-error" message={errors.email} />

                <button
                    type="submit"
                    className={`${primaryButton} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
                    disabled={processing}
                >
                    {processing ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
                </button>
            </form>

            <p className="mt-10 text-sm text-ink/70">
                {t('auth.forgotPassword.remembered')}{' '}
                <Link href={route('login')} className={`${textLink} text-ink`}>
                    {t('auth.forgotPassword.backToLogin')}
                </Link>
            </p>
        </AuthLayout>
    );
}
