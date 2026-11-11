import FieldError from '@/Components/FieldError';
import { fieldLabel, primaryButton, textField } from '@/brand';
import { useTranslation } from '@/i18n';
import { useForm, usePage } from '@inertiajs/react';

/**
 * Name and e-mail of the account. The e-mail is also the login.
 */
export default function UpdateProfileInformationForm() {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit}>
            <h2 className="font-display text-xl">{t('profile.information.title')}</h2>
            <p className="mt-2 text-sm text-ink/60">
                {t('profile.information.intro')}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className={fieldLabel}>{t('profile.information.name')}</label>
                    <input
                        id="name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        autoComplete="name"
                        required
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`${textField} mt-2`}
                    />
                    <FieldError id="name-error" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className={fieldLabel}>{t('profile.information.email')}</label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        autoComplete="username"
                        required
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`${textField} mt-2`}
                    />
                    <FieldError id="email-error" message={errors.email} />
                </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
                <button type="submit" disabled={processing} className={`${primaryButton} disabled:opacity-50`}>
                    {processing ? t('saving') : t('save')}
                </button>
                {recentlySuccessful && (
                    <p role="status" className="text-sm text-sage">{t('profile.information.saved')}</p>
                )}
            </div>
        </form>
    );
}
