import FieldError from '@/Components/FieldError';
import PasswordField from '@/Components/PasswordField';
import AuthLayout, { StatusMessage } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { fieldLabel, primaryButton, textField, textLink } from '@/brand';
import { useTranslation } from '@/i18n';

/**
 * Login page, following the project's brand guidelines.
 *
 * This is the only login page of the application: couples and Jessica both
 * use it. There is deliberately no sign-up link, accounts are created by hand
 * by the coordinator; a visitor without an account is sent to the "Votre
 * accès" section of the landing page.
 *
 * The form and its submission are Breeze's (AuthenticatedSessionController),
 * only the presentation changes.
 */
export default function Login({ status, canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            caption={t('auth.login.caption')}
            title={t('auth.login.title')}
            intro={t('auth.login.intro')}
        >
            <Head title={t('auth.login.caption')} />

            <StatusMessage message={status} />

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
                        autoFocus
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
                        label={t('auth.password')}
                        value={data.password}
                        error={errors.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            className="size-4 rounded-none border-ink/30 text-ink focus:ring-sage"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-ink/70">{t('auth.login.remember')}</span>
                    </label>

                    {canResetPassword && (
                        <Link href={route('password.request')} className={`${textLink} text-ink/70`}>
                            {t('auth.login.forgotPassword')}
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    className={`${primaryButton} mt-12 w-full disabled:cursor-wait disabled:opacity-50`}
                    disabled={processing}
                >
                    {processing ? t('auth.login.submitting') : t('auth.login.submit')}
                </button>
            </form>

            <div className="mt-14 border-t border-ink/10 pt-8">
                <p className="font-display text-lg leading-snug">{t('auth.login.noAccessTitle')}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {t('auth.login.noAccessText')}{' '}
                    <a href={`${route('home')}#access`} className={`${textLink} text-ink`}>
                        {t('auth.login.requestAccess')}
                    </a>
                </p>
            </div>
        </AuthLayout>
    );
}
