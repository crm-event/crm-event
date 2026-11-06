import FieldError from '@/Components/FieldError';
import { fieldLabel, focusRing, textField } from '@/brand';
import { useState } from 'react';

/**
 * Labelled password field with a "show / hide" toggle and its error message,
 * following the brand guidelines.
 */
export default function PasswordField({
    id,
    label,
    value,
    error,
    autoComplete,
    onChange,
    autoFocus = false,
    hint = null,
}) {
    const [isVisible, setIsVisible] = useState(false);

    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(' ');

    return (
        <div>
            <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={id} className={fieldLabel}>
                    {label}
                </label>
                <button
                    type="button"
                    className={`${focusRing} text-[10px] uppercase tracking-[0.18em] text-sage transition-colors hover:text-ink`}
                    aria-controls={id}
                    aria-pressed={isVisible}
                    onClick={() => setIsVisible((wasVisible) => !wasVisible)}
                >
                    {isVisible ? 'Masquer' : 'Afficher'}
                </button>
            </div>

            <input
                id={id}
                type={isVisible ? 'text' : 'password'}
                name={id}
                value={value}
                className={`${textField} mt-2`}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy || undefined}
                onChange={onChange}
            />

            {hint && (
                <p id={hintId} className="mt-2 text-xs text-ink/50">
                    {hint}
                </p>
            )}

            <FieldError id={errorId} message={error} />
        </div>
    );
}
