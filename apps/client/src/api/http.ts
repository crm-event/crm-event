import axios, { AxiosError } from 'axios';

/**
 * Client HTTP unique de l'application.
 *
 * - `withCredentials` : envoie le cookie de session Laravel.
 * - `withXSRFToken`   : recopie le cookie XSRF-TOKEN dans l'en-tête X-XSRF-TOKEN
 *                       (protection CSRF de Sanctum).
 */
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

let csrfReady: Promise<void> | null = null;

/**
 * Récupère le cookie CSRF avant la première requête mutante (login, etc.).
 * Idempotent : un seul appel réseau par chargement de page.
 */
export function ensureCsrfCookie(): Promise<void> {
    csrfReady ??= http.get('/sanctum/csrf-cookie').then(() => undefined);
    return csrfReady;
}

/** Forme des erreurs 422 renvoyées par Laravel. */
export interface ValidationErrorBody {
    message: string;
    errors: Record<string, string[]>;
}

export function isValidationError(error: unknown): error is AxiosError<ValidationErrorBody> {
    return axios.isAxiosError(error) && error.response?.status === 422;
}

export function isUnauthenticated(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 401;
}
