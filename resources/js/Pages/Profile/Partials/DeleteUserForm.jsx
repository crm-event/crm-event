import PasswordField from '@/Components/PasswordField';
import { focusRing, secondaryButton } from '@/brand';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Deletion of a couple's account, confirmed with the password.
 */
export default function DeleteUserForm() {
    const [isConfirming, setIsConfirming] = useState(false);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteAccount = (event) => {
        event.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onFinish: () => reset(),
        });
    };

    const cancel = () => {
        setIsConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <div>
            <h2 className="font-display text-xl">Supprimer mon compte</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">
                Vous ne pourrez plus vous connecter à votre espace. Les documents liés à votre contrat
                restent conservés par La Dernière Touche, comme la loi l’impose.
            </p>

            {isConfirming ? (
                <form onSubmit={deleteAccount} className="mt-8 max-w-sm">
                    <PasswordField
                        id="delete_password"
                        label="Votre mot de passe, pour confirmer"
                        value={data.password}
                        error={errors.password}
                        autoComplete="current-password"
                        autoFocus
                        onChange={(event) => setData('password', event.target.value)}
                    />
                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className={`${focusRing} inline-flex items-center justify-center border border-ink bg-ivory px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50`}
                        >
                            Supprimer définitivement
                        </button>
                        <button type="button" onClick={cancel} className={`${secondaryButton} px-6 py-3`}>
                            Annuler
                        </button>
                    </div>
                </form>
            ) : (
                <button type="button" onClick={() => setIsConfirming(true)} className={`${secondaryButton} mt-8 px-6 py-3`}>
                    Supprimer mon compte
                </button>
            )}
        </div>
    );
}
