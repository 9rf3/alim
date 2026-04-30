import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin',
};

export function AdminProvider({ children }) {
    const [adminAuth, setAdminAuth] = useState(() => {
        const stored = localStorage.getItem('adminSession');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
                    return { isAuthenticated: true, user: parsed.user };
                }
                localStorage.removeItem('adminSession');
            } catch (e) {}
        }
        return { isAuthenticated: false, user: null };
    });

    const login = (username, password) => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            const session = {
                isAuthenticated: true,
                user: { username, role: 'superadmin', loginAt: new Date().toISOString() },
            };
            const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem('adminSession', JSON.stringify({ ...session, expiresAt }));
            setAdminAuth(session);
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const logout = () => {
        localStorage.removeItem('adminSession');
        setAdminAuth({ isAuthenticated: false, user: null });
    };

    return (
        <AdminContext.Provider value={{ adminAuth, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
}
