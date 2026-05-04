import { db, auth } from './src/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

async function testFirestore() {
    console.log('=== FIRESTORE DIAGNOSTIC TEST ===\n');

    console.log('1. Checking Firebase config...');
    const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
    console.log('   Project ID:', projectId || 'MISSING');

    if (!projectId) {
        console.log('   FAIL: REACT_APP_FIREBASE_PROJECT_ID is not set');
        return;
    }
    console.log('   OK: Config loaded\n');

    console.log('2. Testing Firestore connection...');
    try {
        console.log('   Attempting anonymous sign-in...');
        const cred = await signInAnonymously(auth);
        console.log('   Auth OK, uid:', cred.user.uid, '\n');

        const testRef = doc(db, '_connection_test', cred.user.uid);
        console.log('   Writing test document to: _connection_test/' + cred.user.uid);

        await setDoc(testRef, {
            uid: cred.user.uid,
            timestamp: serverTimestamp(),
            test: true,
        });

        console.log('   Write OK\n');

        console.log('   Reading back test document...');
        const snap = await getDoc(testRef);

        if (snap.exists()) {
            console.log('   Read OK, data:', snap.data());
        } else {
            console.log('   FAIL: Document not found after write');
        }
    } catch (error) {
        console.log('   FAIL:', error.code, '-', error.message);
        console.log('');
        console.log('=== TROUBLESHOOTING ===');
        console.log('');
        console.log('If error.code is "permission-denied":');
        console.log('  1. Go to Firebase Console > Firestore Database > Rules');
        console.log('  2. Replace rules with:');
        console.log('     rules_version = \'2\';');
        console.log('     service cloud.firestore {');
        console.log('       match /databases/{database}/documents {');
        console.log('         match /{document=**} {');
        console.log('           allow read, write: if request.auth != null;');
        console.log('         }');
        console.log('       }');
        console.log('     }');
        console.log('  3. Click Publish');
        console.log('');
        console.log('If error.code is "unavailable":');
        console.log('  1. Check your internet connection');
        console.log('  2. Check if Firestore is enabled for your project');
        console.log('');
        console.log('If error.code is "not-found":');
        console.log('  1. Firestore database may not be created yet');
        console.log('  2. Go to Firebase Console > Firestore Database > Create Database');
        console.log('  3. Choose "Start in production mode" or "Test mode"');
    }
}

testFirestore();
