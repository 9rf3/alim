import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (uid) => {
        try {
            console.log('[Auth] Fetching profile for uid:', uid);
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                console.log('[Auth] Existing profile found');
                const data = userSnap.data();
                setUserProfile(data);
                return data;
            }
            console.log('[Auth] No existing profile found');
            return null;
        } catch (error) {
            console.error('[Auth] FULL FIRESTORE READ ERROR:', error);
            console.error('[Auth] Error code:', error.code);
            console.error('[Auth] Error message:', error.message);
            return null;
        }
    }, []);

    const createNewUserDocument = useCallback(async (firebaseUser) => {
        if (!firebaseUser || !firebaseUser.uid) {
            console.error('[Auth] Cannot create user: firebaseUser is missing or has no uid');
            throw new Error('Cannot create user profile: missing user ID');
        }

        console.log('[Auth] Creating new user document:');
        console.log('[Auth] - uid:', firebaseUser.uid);
        console.log('[Auth] - email:', firebaseUser.email);
        console.log('[Auth] - displayName:', firebaseUser.displayName);
        console.log('[Auth] - photoURL:', firebaseUser.photoURL);

        const newUserDoc = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || null,
            role: null,
            fullName: firebaseUser.displayName || '',
            age: null,
            subjects: [],
            profileCompleted: false,
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        console.log('[Auth] Payload:', JSON.stringify(newUserDoc, null, 2));

        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            console.log('[Auth] Writing to path: users/' + firebaseUser.uid);

            await setDoc(userRef, newUserDoc);

            console.log('[Auth] User document created successfully');
            setUserProfile(newUserDoc);
            return newUserDoc;
        } catch (error) {
            console.error('[Auth] FULL FIRESTORE WRITE ERROR:', error);
            console.error('[Auth] Error code:', error.code);
            console.error('[Auth] Error message:', error.message);
            console.error('[Auth] Error name:', error.name);

            if (error.code === 'permission-denied') {
                throw new Error('Firestore permission denied. Please check your Firestore security rules. Set rules to allow read/write for authenticated users.');
            }

            if (error.code === 'unavailable') {
                throw new Error('Firestore service unavailable. Check your network connection.');
            }

            throw new Error(error.message || 'Failed to create user profile in database');
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log('[Auth] Auth state changed: user authenticated');
                console.log('[Auth] User uid:', firebaseUser.uid);
                console.log('[Auth] User email:', firebaseUser.email);

                setFirebaseUser(firebaseUser);

                const existingProfile = await fetchUserProfile(firebaseUser.uid);

                if (!existingProfile) {
                    console.log('[Auth] No existing profile, creating new document...');
                    try {
                        await createNewUserDocument(firebaseUser);
                    } catch (error) {
                        console.error('[Auth] Failed to create user document:', error);
                        console.error('[Auth] Full error:', error);
                    }
                } else {
                    console.log('[Auth] Using existing profile');
                }
            } else {
                console.log('[Auth] Auth state changed: user signed out');
                setFirebaseUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchUserProfile, createNewUserDocument]);

    const login = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('[Auth] Login successful:', result.user.uid);
            return result.user;
        } catch (error) {
            console.error('[Auth] FULL LOGIN ERROR:', error);
            console.error('[Auth] Error code:', error.code);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setFirebaseUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error('[Auth] Logout error:', error);
            throw error;
        }
    };

    const updateUserProfile = async (data) => {
        if (!firebaseUser) throw new Error('No authenticated user');

        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const updateData = {
                ...data,
                updatedAt: serverTimestamp(),
            };
            await updateDoc(userRef, updateData);

            setUserProfile((prev) => ({ ...prev, ...updateData }));
            return true;
        } catch (error) {
            console.error('[Auth] FULL UPDATE ERROR:', error);
            console.error('[Auth] Error code:', error.code);
            console.error('[Auth] Error message:', error.message);

            if (error.code === 'permission-denied') {
                throw new Error('Firestore permission denied. Check your security rules.');
            }

            throw new Error(error.message || 'Failed to save profile to database');
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
            console.error('[Auth] FULL ONBOARDING ERROR:', error);
            console.error('[Auth] Error code:', error.code);
            console.error('[Auth] Error message:', error.message);

            if (error.code === 'permission-denied') {
                throw new Error('Firestore permission denied. Check your security rules.');
            }

            throw new Error(error.message || 'Failed to save profile to database');
        }
    };

    const value = {
        firebaseUser,
        userProfile,
        loading,
        isAuthenticated: !!firebaseUser,
        isOnboardingComplete: userProfile?.onboardingCompleted === true,
        login,
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
