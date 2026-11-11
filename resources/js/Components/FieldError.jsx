/**
 * Server-side error message displayed under a form field, for the pages that
 * follow the brand guidelines.
 *
 * It stays within the brand palette (no red): the field underline turns black
 * through `aria-invalid`, and the message is announced to screen readers. The
 * field must reference it with `aria-describedby={id}`.
 */
export default function FieldError({ id, message }) {
    if (!message) {
        return null;
    }

    return (
        <p id={id} role="alert" className="mt-3 text-sm leading-relaxed text-ink">
            {message}
        </p>
    );
}
