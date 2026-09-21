import type { components, paths } from '@crm-event/api-types';
import { ensureCsrfCookie, http } from './http';

// Types dérivés du contrat OpenAPI (packages/api-types) : si l'API change,
// `npm run types` puis `npm run typecheck` signalent ici ce qui casse.
export type Client = components['schemas']['ClientResource'];

type LoginBody = paths['/v1/client/auth/login']['post']['requestBody']['content']['application/json'];

interface DataEnvelope<T> {
    data: T;
}

const BASE = '/api/v1/client/auth';

export async function login(credentials: LoginBody): Promise<Client> {
    await ensureCsrfCookie();
    const { data } = await http.post<DataEnvelope<Client>>(`${BASE}/login`, credentials);
    return data.data;
}

export async function logout(): Promise<void> {
    await http.post(`${BASE}/logout`);
}

export async function me(): Promise<Client> {
    const { data } = await http.get<DataEnvelope<Client>>(`${BASE}/me`);
    return data.data;
}
