import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { isUnauthenticated } from '@/api/http';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
    status: Status;
    user: authApi.Client | null;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<Status>('loading');
    const [user, setUser] = useState<authApi.Client | null>(null);

    // Au chargement : la session cookie est-elle encore valide ?
    useEffect(() => {
        authApi
            .me()
            .then((current) => {
                setUser(current);
                setStatus('authenticated');
            })
            .catch((error: unknown) => {
                if (!isUnauthenticated(error)) console.error(error);
                setUser(null);
                setStatus('anonymous');
            });
    }, []);

    const login = useCallback(async (email: string, password: string, remember = false) => {
        const current = await authApi.login({ email, password, remember });
        setUser(current);
        setStatus('authenticated');
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
        setStatus('anonymous');
    }, []);

    const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
    return context;
}
