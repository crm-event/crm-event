import type { components, paths } from '@crm-event/api-types';
import { ensureCsrfCookie, http } from './http';

// Types dérivés du contrat OpenAPI (packages/api-types) : si l'API change,
// `npm run types` puis `npm run typecheck` signalent ici ce qui casse.
export type Coordinator = components['schemas']['CoordinatorResource'];

type LoginBody = paths['/v1/gestion/auth/login']['post']['requestBody']['content']['application/json'];

interface DataEnvelope<T> {
    data: T;
}

const BASE = '/api/v1/gestion/auth';

export async function login(credentials: LoginBody): Promise<Coordinator> {
    await ensureCsrfCookie();
    const { data } = await http.post<DataEnvelope<Coordinator>>(`${BASE}/login`, credentials);
    return data.data;
}

export async function logout(): Promise<void> {
    await http.post(`${BASE}/logout`);
}

export async function me(): Promise<Coordinator> {
    const { data } = await http.get<DataEnvelope<Coordinator>>(`${BASE}/me`);
    return data.data;
}
