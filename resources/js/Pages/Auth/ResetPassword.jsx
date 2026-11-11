import FieldError from '@/Components/FieldError';
import PasswordField from '@/Components/PasswordField';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { fieldLabel, primaryButton, textField } from '@/brand';
import { useTranslation } from '@/i18n';

/**
 * Password reset page, reached from the link received by e-mail.
 *
 * The e-mail address comes pre-filled from the link. Once the new password is
 * saved, Breeze (NewPasswordController) sends the user back to the login page
 * with a confirmation message; only the presentation changes here.
 */
export default function ResetPassword({ token, email }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            caption={t('auth.resetPassword.caption')}
            title={t('auth.resetPassword.title')}
            intro={t('auth.resetPassword.intro')}
        >
            <Head title={t('auth.resetPassword.caption')} />

            <form onSubmit={submit} className="mt-10">
                <div>
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
                        required
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <FieldError id="email-error" message={errors.email} />
                </div>

                <div className="mt-8">
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
                </div>

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
                    {processing ? t('auth.saving') : t('auth.resetPassword.submit')}
                </button>
            </form>
        </AuthLayout>
    );
}
