import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    addDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const COLLECTIONS = {
    USERS: 'users',
    COURSES: 'courses',
    VIDEOS: 'videos',
    QUIZZES: 'quizzes',
    QUIZ_ATTEMPTS: 'quizAttempts',
    RESOURCES: 'resources',
    SUBSCRIPTIONS: 'subscriptions',
    PROGRESS: 'progress',
    NOTES: 'notes',
    STUDY_PLANS: 'studyPlans',
    TASKS: 'tasks',
    CERTIFICATES: 'certificates',
    PROJECTS: 'projects',
    ORDERS: 'orders',
    MARKETPLACE: 'marketplace',
    PRICING: 'pricing',
    REVIEWS: 'reviews',
};

/* ================================================================
   CORE — safeQuery wraps getDocs, strips orderBy, sorts client-side
   This eliminates Firestore composite index requirements entirely.
   ================================================================ */

function toTimestamp(ts) {
    if (!ts) return 0;
    if (ts.toDate) return ts.toDate().getTime();
    if (ts instanceof Date) return ts.getTime();
    if (typeof ts === 'number') return ts;
    return 0;
}

async function safeQuery(collectionName, field, value, sortBy = 'createdAt', sortDir = 'desc') {
    try {
        console.log(`[Firestore] safeQuery: ${collectionName} where ${field} == ${value}`);
        const colRef = collection(db, collectionName);
        const q = query(colRef, where(field, '==', value));
        const snap = await getDocs(q);
        let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log(`[Firestore] safeQuery returned ${results.length} docs`);

        // Client-side sort — avoids composite index requirement
        if (sortBy) {
            results.sort((a, b) => {
                const ta = toTimestamp(a[sortBy]);
                const tb = toTimestamp(b[sortBy]);
                return sortDir === 'desc' ? tb - ta : ta - tb;
            });
        }
        return results;
    } catch (error) {
        console.error(`[Firestore] safeQuery error on ${collectionName}:`, error.code, error.message);
        return [];
    }
}

async function safeQueryNoWhere(collectionName, sortBy = 'createdAt', sortDir = 'desc') {
    try {
        console.log(`[Firestore] safeQueryNoWhere: ${collectionName}`);
        const colRef = collection(db, collectionName);
        const snap = await getDocs(colRef);
        let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log(`[Firestore] safeQueryNoWhere returned ${results.length} docs`);

        if (sortBy) {
            results.sort((a, b) => {
                const ta = toTimestamp(a[sortBy]);
                const tb = toTimestamp(b[sortBy]);
                return sortDir === 'desc' ? tb - ta : ta - tb;
            });
        }
        return results;
    } catch (error) {
        console.error(`[Firestore] safeQueryNoWhere error on ${collectionName}:`, error.code, error.message);
        return [];
    }
}

/* ================================================================
   GENERIC CRUD
   ================================================================ */

export async function createDocument(collectionName, data, customId = null) {
    const docData = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    if (customId) {
        await setDoc(doc(db, collectionName, customId), docData);
        return { id: customId, ...docData };
    }
    const docRef = await addDoc(collection(db, collectionName), docData);
    return { id: docRef.id, ...docData };
}

export async function getDocument(collectionName, docId) {
    const snap = await getDoc(doc(db, collectionName, docId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateDocument(collectionName, docId, data) {
    await updateDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() });
    return true;
}

export async function deleteDocument(collectionName, docId) {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
}

export async function deleteFile(path) {
    await deleteObject(ref(storage, path));
    return true;
}

/* ================================================================
   VIDEO UPLOAD — resumable with real progress
   ================================================================ */

export function uploadVideoResumable(file, teacherId, courseId, metadata, onProgress) {
    return new Promise((resolve, reject) => {
        const path = `videos/${teacherId}/${courseId}/${Date.now()}_${file.name}`;
        const uploadTask = uploadBytesResumable(ref(storage, path));

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                console.log(`[Storage] Upload ${pct}%`);
                if (onProgress) onProgress(pct);
            },
            (error) => {
                console.error('[Storage] Upload failed:', error);
                reject(error);
            },
            async () => {
                try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    const videoDoc = await createDocument(COLLECTIONS.VIDEOS, {
                        ...metadata,
                        teacherId,
                        courseId,
                        videoURL: url,
                        storagePath: path,
                        duration: metadata.duration || 0,
                        views: 0,
                    });
                    console.log('[Storage] Upload complete, doc saved:', videoDoc.id);
                    resolve(videoDoc);
                } catch (e) {
                    reject(e);
                }
            }
        );
    });
}

/* ================================================================
   USER
   ================================================================ */

export async function getUserProfile(uid) {
    return getDocument(COLLECTIONS.USERS, uid);
}

export async function updateUserProfile(uid, data) {
    return updateDocument(COLLECTIONS.USERS, uid, data);
}

/* ================================================================
   COURSE
   ================================================================ */

export async function createCourse(teacherId, courseData) {
    return createDocument(COLLECTIONS.COURSES, {
        ...courseData,
        teacherId,
        studentCount: 0,
        rating: 0,
        lessonCount: 0,
    });
}

export async function getCoursesByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.COURSES, 'teacherId', teacherId, 'createdAt', 'desc');
}

export async function getAllCourses() {
    return safeQueryNoWhere(COLLECTIONS.COURSES, 'createdAt', 'desc');
}

/* ================================================================
   VIDEO
   ================================================================ */

export async function getVideosByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.VIDEOS, 'teacherId', teacherId, 'createdAt', 'desc');
}

export async function getVideosByCourse(courseId) {
    return safeQuery(COLLECTIONS.VIDEOS, 'courseId', courseId, 'createdAt', 'asc');
}

export async function getAllVideos() {
    return safeQueryNoWhere(COLLECTIONS.VIDEOS, 'createdAt', 'desc');
}

export async function updateVideoProgress(videoId, userId, progress) {
    const existing = await safeQuery(COLLECTIONS.PROGRESS, 'videoId', videoId);
    const userProgress = existing.filter(p => p.userId === userId);
    if (userProgress.length > 0) {
        return updateDocument(COLLECTIONS.PROGRESS, userProgress[0].id, { progress });
    }
    return createDocument(COLLECTIONS.PROGRESS, { userId, videoId, progress, type: 'video' });
}

export async function getVideoProgress(userId, videoId) {
    const all = await safeQuery(COLLECTIONS.PROGRESS, 'videoId', videoId);
    return all.find(p => p.userId === userId) || null;
}

export async function getProgressByUser(userId) {
    return safeQuery(COLLECTIONS.PROGRESS, 'userId', userId, 'updatedAt', 'desc');
}

/* ================================================================
   QUIZ
   ================================================================ */

export async function createQuiz(teacherId, quizData) {
    return createDocument(COLLECTIONS.QUIZZES, {
        ...quizData,
        teacherId,
        attempts: 0,
        avgScore: 0,
    });
}

export async function getQuizzesByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.QUIZZES, 'teacherId', teacherId, 'createdAt', 'desc');
}

export async function getAllQuizzes() {
    return safeQueryNoWhere(COLLECTIONS.QUIZZES, 'createdAt', 'desc');
}

export async function getQuiz(quizId) {
    return getDocument(COLLECTIONS.QUIZZES, quizId);
}

export async function submitQuizAttempt(userId, quizId, answers, score) {
    const attempt = await createDocument(COLLECTIONS.QUIZ_ATTEMPTS, {
        userId, quizId, answers, score,
        completedAt: serverTimestamp(),
    });

    // Update quiz aggregate
    const allAttempts = await safeQuery(COLLECTIONS.QUIZ_ATTEMPTS, 'quizId', quizId);
    const quizDoc = await getQuiz(quizId);
    if (quizDoc) {
        const avgScore = allAttempts.length > 0
            ? allAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / allAttempts.length
            : 0;
        await updateDocument(COLLECTIONS.QUIZZES, quizId, {
            attempts: allAttempts.length,
            avgScore: Math.round(avgScore * 10) / 10,
        });
    }
    return attempt;
}

export async function getQuizAttemptsByUser(userId) {
    return safeQuery(COLLECTIONS.QUIZ_ATTEMPTS, 'userId', userId, 'completedAt', 'desc');
}

export async function getQuizAttemptsByQuiz(quizId) {
    return safeQuery(COLLECTIONS.QUIZ_ATTEMPTS, 'quizId', quizId, 'completedAt', 'desc');
}

/* ================================================================
   RESOURCE
   ================================================================ */

export async function uploadResource(file, teacherId, metadata) {
    const path = `resources/${teacherId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            'state_changed',
            () => {},
            (error) => reject(error),
            async () => {
                try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    const doc = await createDocument(COLLECTIONS.RESOURCES, {
                        ...metadata,
                        teacherId,
                        fileURL: url,
                        storagePath: path,
                        fileSize: file.size,
                        downloads: 0,
                    });
                    resolve(doc);
                } catch (e) {
                    reject(e);
                }
            }
        );
    });
}

export async function getResourcesByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.RESOURCES, 'teacherId', teacherId, 'createdAt', 'desc');
}

export async function getAllResources() {
    return safeQueryNoWhere(COLLECTIONS.RESOURCES, 'createdAt', 'desc');
}

/* ================================================================
   NOTES
   ================================================================ */

export async function createNote(userId, noteData) {
    return createDocument(COLLECTIONS.NOTES, { ...noteData, userId });
}

export async function getNotesByUser(userId) {
    return safeQuery(COLLECTIONS.NOTES, 'userId', userId, 'updatedAt', 'desc');
}

export async function updateNote(noteId, data) {
    return updateDocument(COLLECTIONS.NOTES, noteId, data);
}

export async function deleteNote(noteId) {
    return deleteDocument(COLLECTIONS.NOTES, noteId);
}

/* ================================================================
   STUDY PLANS
   ================================================================ */

export async function createStudyPlan(userId, planData) {
    return createDocument(COLLECTIONS.STUDY_PLANS, {
        ...planData,
        userId,
        tasksCompleted: 0,
        totalTasks: 0,
    });
}

export async function getStudyPlansByUser(userId) {
    return safeQuery(COLLECTIONS.STUDY_PLANS, 'userId', userId, 'createdAt', 'desc');
}

/* ================================================================
   TASKS
   ================================================================ */

export async function createTask(userId, planId, taskData) {
    const task = await createDocument(COLLECTIONS.TASKS, {
        ...taskData,
        userId,
        planId,
        completed: false,
    });
    const plans = await safeQuery(COLLECTIONS.STUDY_PLANS, 'userId', userId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
        await updateDocument(COLLECTIONS.STUDY_PLANS, planId, { totalTasks: plan.totalTasks + 1 });
    }
    return task;
}

export async function createSimpleTask(userId, taskData) {
    return createDocument(COLLECTIONS.TASKS, { ...taskData, userId, completed: false });
}

export async function toggleTaskComplete(taskId, planId, completed) {
    await updateDocument(COLLECTIONS.TASKS, taskId, { completed });
    if (planId) {
        const tasks = await safeQuery(COLLECTIONS.TASKS, 'userId', '');
        const planTasks = tasks.filter(t => t.planId === planId);
        const done = planTasks.filter(t => t.completed).length;
        await updateDocument(COLLECTIONS.STUDY_PLANS, planId, { tasksCompleted: done });
    }
}

export async function toggleSimpleTask(taskId) {
    const task = await getDocument(COLLECTIONS.TASKS, taskId);
    if (task) {
        await updateDocument(COLLECTIONS.TASKS, taskId, { completed: !task.completed });
    }
}

export async function deleteTask(taskId, planId) {
    await deleteDocument(COLLECTIONS.TASKS, taskId);
    if (planId) {
        const plan = await getDocument(COLLECTIONS.STUDY_PLANS, planId);
        if (plan) {
            await updateDocument(COLLECTIONS.STUDY_PLANS, planId, {
                totalTasks: Math.max(0, plan.totalTasks - 1),
            });
        }
    }
}

export async function getTasksByPlan(planId) {
    const all = await safeQueryNoWhere(COLLECTIONS.TASKS, 'createdAt', 'asc');
    return all.filter(t => t.planId === planId);
}

export async function getTasksByUser(userId) {
    const all = await safeQueryNoWhere(COLLECTIONS.TASKS, 'createdAt', 'desc');
    return all.filter(t => t.userId === userId);
}

/* ================================================================
   CERTIFICATES
   ================================================================ */

export async function createCertificate(userId, certificateData) {
    return createDocument(COLLECTIONS.CERTIFICATES, {
        ...certificateData,
        userId,
        issuedAt: serverTimestamp(),
    });
}

export async function getCertificatesByUser(userId) {
    return safeQuery(COLLECTIONS.CERTIFICATES, 'userId', userId, 'issuedAt', 'desc');
}

/* ================================================================
   SUBSCRIPTIONS
   ================================================================ */

export async function getSubscriptionsByUser(userId) {
    return safeQuery(COLLECTIONS.SUBSCRIPTIONS, 'userId', userId, 'createdAt', 'desc');
}

export async function createSubscription(userId, subscriptionData) {
    return createDocument(COLLECTIONS.SUBSCRIPTIONS, {
        ...subscriptionData,
        userId,
        status: 'active',
        startedAt: serverTimestamp(),
    });
}

export async function cancelSubscription(subscriptionId) {
    return updateDocument(COLLECTIONS.SUBSCRIPTIONS, subscriptionId, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
    });
}

export async function subscribeToCourse(userId, courseId) {
    return createDocument(COLLECTIONS.SUBSCRIPTIONS, {
        userId, courseId,
        type: 'course',
        subscribedAt: serverTimestamp(),
    });
}

export async function getSubscribedCourses(studentId) {
    return safeQuery(COLLECTIONS.SUBSCRIPTIONS, 'userId', studentId);
}

export async function unsubscribeFromCourse(subscriptionId) {
    return deleteDocument(COLLECTIONS.SUBSCRIPTIONS, subscriptionId);
}

export async function subscribeToCourseWithTeacher(userId, courseId, teacherId) {
    return createDocument(COLLECTIONS.SUBSCRIPTIONS, {
        userId, courseId, teacherId,
        type: 'course',
        subscribedAt: serverTimestamp(),
    });
}

export async function getSubscriptionsByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.SUBSCRIPTIONS, 'teacherId', teacherId, 'subscribedAt', 'desc');
}

/* ================================================================
   PRICING
   ================================================================ */

export async function setCoursePricing(teacherId, courseId, pricingData) {
    return createDocument(COLLECTIONS.PRICING, {
        ...pricingData,
        teacherId,
        courseId,
        updatedAt: serverTimestamp(),
    }, `${teacherId}_${courseId}`);
}

export async function getCoursePricing(teacherId, courseId) {
    return getDocument(COLLECTIONS.PRICING, `${teacherId}_${courseId}`);
}

/* ================================================================
   PROJECTS
   ================================================================ */

export async function createProject(teacherId, projectData) {
    return createDocument(COLLECTIONS.PROJECTS, {
        ...projectData,
        teacherId,
        status: 'draft',
    });
}

export async function getProjectsByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.PROJECTS, 'teacherId', teacherId, 'createdAt', 'desc');
}

export async function publishProject(projectId) {
    return updateDocument(COLLECTIONS.PROJECTS, projectId, {
        status: 'published',
        publishedAt: serverTimestamp(),
    });
}

export async function getPublishedProjects() {
    const all = await safeQueryNoWhere(COLLECTIONS.PROJECTS, 'createdAt', 'desc');
    return all.filter(p => p.status === 'published');
}

export async function getProjectsByStudent(userId) {
    const all = await safeQueryNoWhere(COLLECTIONS.PROJECTS, 'createdAt', 'desc');
    return all.filter(p => p.studentId === userId);
}

export async function orderProject(projectId, studentId) {
    const order = await createDocument(COLLECTIONS.ORDERS, {
        projectId, studentId,
        status: 'pending',
        orderedAt: serverTimestamp(),
    });
    await updateDocument(COLLECTIONS.PROJECTS, projectId, {
        studentId,
        status: 'in_progress',
    });
    return order;
}

/* ================================================================
   MARKETPLACE
   ================================================================ */

export async function createMarketplaceListing(userId, listingData) {
    return createDocument(COLLECTIONS.MARKETPLACE, {
        ...listingData,
        sellerId: userId,
        status: 'active',
        createdAt: serverTimestamp(),
    });
}

export async function getMarketplaceListings() {
    const all = await safeQueryNoWhere(COLLECTIONS.MARKETPLACE, 'createdAt', 'desc');
    return all.filter(l => l.status === 'active');
}

export async function getListingsByUser(userId) {
    return safeQuery(COLLECTIONS.MARKETPLACE, 'sellerId', userId, 'createdAt', 'desc');
}

export async function updateListingStatus(listingId, status) {
    return updateDocument(COLLECTIONS.MARKETPLACE, listingId, { status });
}

export async function deleteMarketplaceListing(listingId) {
    return deleteDocument(COLLECTIONS.MARKETPLACE, listingId);
}

/* ================================================================
   REVIEWS
   ================================================================ */

export async function createReview(teacherId, reviewData) {
    return createDocument(COLLECTIONS.REVIEWS, { ...reviewData, teacherId, createdAt: serverTimestamp() });
}

export async function getReviewsByTeacher(teacherId) {
    return safeQuery(COLLECTIONS.REVIEWS, 'teacherId', teacherId, 'createdAt', 'desc');
}

export async function getAllReviews() {
    return safeQueryNoWhere(COLLECTIONS.REVIEWS, 'createdAt', 'desc');
}

/* ================================================================
    ADMIN — user management
    ================================================================ */

export async function getAllUsers() {
    try {
        const colRef = collection(db, COLLECTIONS.USERS);
        const snap = await getDocs(colRef);
        let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        results.sort((a, b) => {
            const ta = toTimestamp(a.createdAt);
            const tb = toTimestamp(b.createdAt);
            return tb - ta;
        });
        return results;
    } catch (error) {
        console.error('[Firestore] getAllUsers error:', error.code, error.message);
        return [];
    }
}

export async function getUserById(uid) {
    return getDocument(COLLECTIONS.USERS, uid);
}

export async function updateUserById(uid, data) {
    return updateDocument(COLLECTIONS.USERS, uid, data);
}

export async function banUser(uid) {
    return updateDocument(COLLECTIONS.USERS, uid, {
        status: 'banned',
        bannedAt: serverTimestamp(),
    });
}

export async function unbanUser(uid) {
    return updateDocument(COLLECTIONS.USERS, uid, {
        status: 'active',
        bannedAt: null,
    });
}

export async function deleteUserById(uid) {
    return updateDocument(COLLECTIONS.USERS, uid, {
        status: 'deleted',
        deletedAt: serverTimestamp(),
    });
}

export async function getUserStats() {
    const allUsers = await getAllUsers();
    const activeUsers = allUsers.filter(u => u.status !== 'deleted');
    const teachers = activeUsers.filter(u => u.role === 'teacher');
    const students = activeUsers.filter(u => u.role === 'student');
    const banned = allUsers.filter(u => u.status === 'banned');
    return {
        total: allUsers.length,
        active: activeUsers.length,
        teachers: teachers.length,
        students: students.length,
        banned: banned.length,
    };
}

/* ================================================================
    LOGGING
    ================================================================ */

export async function logUserAction(userId, action, metadata = {}) {
    try {
        const colRef = collection(db, 'logs');
        await addDoc(colRef, {
            userId,
            action,
            timestamp: serverTimestamp(),
            ...metadata,
        });
    } catch (error) {
        console.error('[Firestore] Log error:', error.code, error.message);
    }
}

/* ================================================================
    STATS
    ================================================================ */

export async function getTeacherStats(teacherId) {
    const courses = await safeQuery(COLLECTIONS.COURSES, 'teacherId', teacherId);
    const videos = await safeQuery(COLLECTIONS.VIDEOS, 'teacherId', teacherId);
    const quizzes = await safeQuery(COLLECTIONS.QUIZZES, 'teacherId', teacherId);
    const resources = await safeQuery(COLLECTIONS.RESOURCES, 'teacherId', teacherId);
    const reviews = await safeQuery(COLLECTIONS.REVIEWS, 'teacherId', teacherId);

    const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

    return {
        courses: courses.length,
        videos: videos.length,
        quizzes: quizzes.length,
        resources: resources.length,
        students: totalStudents,
        rating: Math.round(avgRating * 10) / 10,
        reviews: reviews.length,
    };
}

export async function getStudentStats(userId) {
    const subscriptions = await safeQuery(COLLECTIONS.SUBSCRIPTIONS, 'userId', userId);
    const quizAttempts = await safeQuery(COLLECTIONS.QUIZ_ATTEMPTS, 'userId', userId);
    const progress = await safeQuery(COLLECTIONS.PROGRESS, 'userId', userId);
    const certificates = await safeQuery(COLLECTIONS.CERTIFICATES, 'userId', userId);
    const notes = await safeQuery(COLLECTIONS.NOTES, 'userId', userId);
    const tasks = await getTasksByUser(userId);

    const completedTasks = tasks.filter(t => t.completed).length;
    const avgScore = quizAttempts.length > 0
        ? quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length
        : 0;

    return {
        courses: subscriptions.length,
        quizAttempts: quizAttempts.length,
        avgScore: Math.round(avgScore * 10) / 10,
        certificates: certificates.length,
        notes: notes.length,
        tasksCompleted: completedTasks,
        totalTasks: tasks.length,
        videosWatched: progress.length,
    };
}
