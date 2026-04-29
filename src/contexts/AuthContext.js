// Auth Context for managing authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Check if we have additional profile data in localStorage
                const storedProfile = localStorage.getItem('userProfile');
                const storedAuth = localStorage.getItem('authUser');

                let userData = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    role: null,
                    profileComplete: false
                };

                // Merge with stored auth data if available
                if (storedAuth) {
                    try {
                        const parsed = JSON.parse(storedAuth);
                        userData = { ...userData, ...parsed };
                    } catch (e) { }
                }

                // Check if profile setup is complete
                if (storedProfile) {
                    try {
                        const parsed = JSON.parse(storedProfile);
                        userData.profileComplete = true;
                        userData.role = parsed.role || userData.role;
                    } catch (e) { }
                }

                setUser(userData);
                localStorage.setItem('authUser', JSON.stringify(userData));
            } else {
                setUser(null);
                localStorage.removeItem('authUser');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Perform Google sign in - this function handles everything
    const login = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("✅ Login success:", result.user);
            // The onAuthStateChanged listener will handle the rest
            return result.user;
        } catch (error) {
            console.error("❌ Login error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('authUser');
            localStorage.removeItem('userProfile');
            setUser(null);
        } catch (error) {
            console.error("❌ Logout error:", error);
        }
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
