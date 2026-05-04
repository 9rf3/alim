import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { logUserAction } from '../services/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBanned, setIsBanned] = useState(false);

    const fetchUserProfile = useCallback(async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserProfile(data);
                return data;
            }
            return null;
        } catch (error) {
            console.error('[Auth] Profile fetch error:', error.code, error.message);
            return null;
        }
    }, []);

    const createNewUserDocument = useCallback(async (firebaseUser) => {
        if (!firebaseUser || !firebaseUser.uid) {
            throw new Error('Cannot create user profile: missing user ID');
        }

        const newUserDoc = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || null,
            role: null,
            fullName: firebaseUser.displayName || '',
            age: null,
            subjects: [],
            status: 'active',
            profileCompleted: false,
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userRef, newUserDoc);
            await logUserAction(firebaseUser.uid, 'register', {
                email: firebaseUser.email,
                provider: firebaseUser.providerData?.[0]?.providerId || 'unknown',
            });
            setUserProfile(newUserDoc);
            return newUserDoc;
        } catch (error) {
            if (error.code === 'permission-denied') {
                throw new Error('Firestore permission denied. Check your security rules.');
            }
            throw new Error(error.message || 'Failed to create user profile');
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setFirebaseUser(firebaseUser);

                const existingProfile = await fetchUserProfile(firebaseUser.uid);

                if (!existingProfile) {
                    try {
                        await createNewUserDocument(firebaseUser);
                    } catch (error) {
                        console.error('[Auth] Failed to create user document:', error);
                    }
                } else {
                    if (existingProfile.status === 'banned') {
                        setIsBanned(true);
                        await signOut(auth);
                        setFirebaseUser(null);
                        setUserProfile(null);
                    } else if (existingProfile.status === 'deleted') {
                        await signOut(auth);
                        setFirebaseUser(null);
                        setUserProfile(null);
                    } else {
                        setIsBanned(false);
                        await logUserAction(firebaseUser.uid, 'login');
                    }
                }
            } else {
                setFirebaseUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchUserProfile, createNewUserDocument]);

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    };

    const loginWithEmail = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    const registerWithEmail = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    const logout = async () => {
        if (firebaseUser) {
            await logUserAction(firebaseUser.uid, 'logout');
        }
        await signOut(auth);
        setFirebaseUser(null);
        setUserProfile(null);
    };

    const updateUserProfile = async (data) => {
        if (!firebaseUser) throw new Error('No authenticated user');

        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const updateData = { ...data, updatedAt: serverTimestamp() };
            await updateDoc(userRef, updateData);
            setUserProfile((prev) => ({ ...prev, ...updateData }));
            return true;
        } catch (error) {
            if (error.code === 'permission-denied') {
                throw new Error('Firestore permission denied. Check your security rules.');
            }
            throw new Error(error.message || 'Failed to save profile');
        }
    };

    const completeOnboarding = async (profileData) => {
        if (!firebaseUser) throw new Error('No authenticated user');

        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const updateData = {
                ...profileData,
                profileCompleted: true,
                onboardingCompleted: true,
                updatedAt: serverTimestamp(),
            };
            await updateDoc(userRef, updateData);
            setUserProfile((prev) => ({ ...prev, ...updateData }));
            return true;
        } catch (error) {
            if (error.code === 'permission-denied') {
                throw new Error('Firestore permission denied. Check your security rules.');
            }
            throw new Error(error.message || 'Failed to save profile');
        }
    };

    const value = {
        firebaseUser,
        userProfile,
        loading,
        isBanned,
        isAuthenticated: !!firebaseUser,
        isAdmin: userProfile?.role === 'admin',
        isOnboardingComplete: userProfile?.onboardingCompleted === true,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserProfile,
        completeOnboarding,
        refreshProfile: () => firebaseUser && fetchUserProfile(firebaseUser.uid),
    };

    return (
        <AuthContext.Provider value={value}>
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
