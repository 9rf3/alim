// Auth Context for managing authentication state
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('authUser');
            }
        }
        setLoading(false);
    }, []);

    const login = async (googleUser) => {
        const userData = {
            uid: googleUser.uid,
            displayName: googleUser.displayName,
            email: googleUser.email,
            photoURL: googleUser.photoURL,
            role: googleUser.role || null,
            profileComplete: googleUser.profileComplete || false
        };
        localStorage.setItem('authUser', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('authUser');
        localStorage.removeItem('userProfile');
        setUser(null);
    };

    const updateUser = (data) => {
        const updated = { ...user, ...data };
        localStorage.setItem('authUser', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
