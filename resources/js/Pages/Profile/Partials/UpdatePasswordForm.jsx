import PasswordField from '@/Components/PasswordField';
import { primaryButton } from '@/brand';
import { useTranslation } from '@/i18n';
import { useForm } from '@inertiajs/react';

/**
 * Change of password, which requires the current one.
 */
export default function UpdatePasswordForm() {
    const { t } = useTranslation();
    const { data, setData, put, errors, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onFinish: () => reset(),
        });
    };

    return (
        <form onSubmit={submit}>
            <h2 className="font-display text-xl">{t('profile.password.title')}</h2>
            <p className="mt-2 text-sm text-ink/60">{t('profile.password.intro')}</p>

            <div className="mt-8 space-y-8">
                <PasswordField
                    id="current_password"
                    label={t('profile.password.current')}
                    value={data.current_password}
                    error={errors.current_password}
                    autoComplete="current-password"
                    onChange={(event) => setData('current_password', event.target.value)}
                />
                <div className="grid gap-8 sm:grid-cols-2">
                    <PasswordField
                        id="password"
                        label={t('profile.password.new')}
                        value={data.password}
                        error={errors.password}
                        autoComplete="new-password"
                        onChange={(event) => setData('password', event.target.value)}
                    />
                    <PasswordField
                        id="password_confirmation"
                        label={t('profile.password.confirm')}
                        value={data.password_confirmation}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                    />
                </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
                <button type="submit" disabled={processing} className={`${primaryButton} disabled:opacity-50`}>
                    {processing ? t('saving') : t('profile.password.submit')}
                </button>
                {recentlySuccessful && (
                    <p role="status" className="text-sm text-sage">{t('profile.password.saved')}</p>
                )}
            </div>
        </form>
    );
}
