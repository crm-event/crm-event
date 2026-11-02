/**
 * Shared styles for the public pages (landing, errors, login).
 *
 * These are plain Tailwind class strings: the actual values (colors, fonts,
 * letter spacing) come from the tokens declared in resources/css/app.css.
 * Every new page meant for couples should reuse these constants instead of
 * defining its own buttons or fields.
 */

export const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

export const primaryButton = `${focusRing} inline-flex items-center justify-center bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-ivory transition-opacity hover:opacity-80`;

export const secondaryButton = `${focusRing} inline-flex items-center justify-center border border-ink/20 px-8 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-ink`;

/** Small uppercase caption displayed above a form field. */
export const fieldLabel = 'block text-[10px] uppercase tracking-brand text-sage';

/**
 * Underlined text field, without a box. The underline turns black on focus;
 * the ring added by @tailwindcss/forms is removed to stay within the brand
 * guidelines.
 */
export const textField =
    'block w-full border-0 border-b border-ink/20 bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink/30 transition-colors focus:border-ink focus:ring-0 aria-invalid:border-ink';

/** Discreet text link with a thin underline. */
export const textLink = `${focusRing} underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink`;
