import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subjects as subjectsList } from '../data/subjects';
import { useAuth } from './AuthContext';

const LabContext = createContext();

const DEFAULT_COURSES = [
    { id: 'math_basic_1', title: 'Mathematics Fundamentals', subject: 'math', teacherId: 'teacher_1', teacherName: 'Dr. Sarah Chen', description: 'Master the basics of algebra, geometry, and calculus in this comprehensive course.', price: 'free', rating: 4.8, studentCount: 1240, lessons: 24, category: 'basics', createdAt: '2026-01-15' },
    { id: 'math_adv_1', title: 'Advanced Mathematics', subject: 'math', teacherId: 'teacher_2', teacherName: 'Prof. James Wilson', description: 'Deep dive into linear algebra, differential equations, and discrete math.', price: 'premium', rating: 4.9, studentCount: 890, lessons: 36, category: 'advanced', createdAt: '2026-02-20' },
    { id: 'physics_basic_1', title: 'Physics for Beginners', subject: 'physics', teacherId: 'teacher_3', teacherName: 'Dr. Elena Petrova', description: 'Explore mechanics, thermodynamics, and wave physics through interactive labs.', price: 'free', rating: 4.7, studentCount: 2100, lessons: 20, category: 'basics', createdAt: '2026-01-20' },
    { id: 'physics_quantum', title: 'Quantum Physics Intro', subject: 'physics', teacherId: 'teacher_3', teacherName: 'Dr. Elena Petrova', description: 'Introduction to quantum mechanics, wave-particle duality, and quantum computing.', price: 'premium', rating: 4.9, studentCount: 650, lessons: 30, category: 'advanced', createdAt: '2026-03-10' },
    { id: 'chem_organic', title: 'Organic Chemistry', subject: 'chemistry', teacherId: 'teacher_4', teacherName: 'Prof. Alex Turner', description: 'Study carbon compounds, reactions, and mechanisms in organic chemistry.', price: 'premium', rating: 4.6, studentCount: 780, lessons: 28, category: 'basics', createdAt: '2026-02-05' },
    { id: 'bio_cell', title: 'Cell Biology', subject: 'biology', teacherId: 'teacher_5', teacherName: 'Dr. Maria Santos', description: 'Explore cell structure, function, division, and molecular biology.', price: 'free', rating: 4.5, studentCount: 1560, lessons: 22, category: 'basics', createdAt: '2026-01-30' },
    { id: 'prog_python', title: 'Python Programming', subject: 'programming', teacherId: 'teacher_6', teacherName: 'Dev. Ryan Park', description: 'Learn Python from scratch — variables, OOP, data structures, and more.', price: 'free', rating: 4.8, studentCount: 3200, lessons: 40, category: 'basics', createdAt: '2026-02-15' },
    { id: 'prog_react', title: 'React Development', subject: 'programming', teacherId: 'teacher_7', teacherName: 'Dev. Lisa Chang', description: 'Build modern web applications with React, hooks, and state management.', price: 'premium', rating: 4.7, studentCount: 1890, lessons: 35, category: 'advanced', createdAt: '2026-03-01' },
    { id: 'eng_grammar', title: 'English Grammar Masterclass', subject: 'english', teacherId: 'teacher_8', teacherName: 'Prof. Emma Davis', description: 'Comprehensive guide to English grammar, from basics to advanced usage.', price: 'free', rating: 4.6, studentCount: 2800, lessons: 30, category: 'basics', createdAt: '2026-01-10' },
    { id: 'hist_modern', title: 'Modern History', subject: 'history', teacherId: 'teacher_9', teacherName: 'Prof. Robert King', description: 'Study the 20th century — World Wars, Cold War, and globalization.', price: 'premium', rating: 4.4, studentCount: 920, lessons: 26, category: 'basics', createdAt: '2026-02-25' },
];

const DEFAULT_TEACHERS = [
    { id: 'teacher_1', name: 'Dr. Sarah Chen', subject: 'math', rating: 4.8, students: 2130, courses: 3, bio: 'PhD in Mathematics, 15 years teaching experience.' },
    { id: 'teacher_2', name: 'Prof. James Wilson', subject: 'math', rating: 4.9, students: 1450, courses: 2, bio: 'Specialist in advanced mathematics and applied calculus.' },
    { id: 'teacher_3', name: 'Dr. Elena Petrova', subject: 'physics', rating: 4.8, students: 2750, courses: 4, bio: 'Quantum physicist and award-winning educator.' },
    { id: 'teacher_4', name: 'Prof. Alex Turner', subject: 'chemistry', rating: 4.6, students: 1200, courses: 2, bio: 'Organic chemistry researcher with 10+ years experience.' },
    { id: 'teacher_5', name: 'Dr. Maria Santos', subject: 'biology', rating: 4.5, students: 2100, courses: 3, bio: 'Cell biologist passionate about making science accessible.' },
    { id: 'teacher_6', name: 'Dev. Ryan Park', subject: 'programming', rating: 4.8, students: 4200, courses: 5, bio: 'Full-stack developer and coding bootcamp instructor.' },
    { id: 'teacher_7', name: 'Dev. Lisa Chang', subject: 'programming', rating: 4.7, students: 2800, courses: 3, bio: 'Frontend specialist and React community contributor.' },
    { id: 'teacher_8', name: 'Prof. Emma Davis', subject: 'english', rating: 4.6, students: 3500, courses: 4, bio: 'English linguist with expertise in grammar and composition.' },
    { id: 'teacher_9', name: 'Prof. Robert King', subject: 'history', rating: 4.4, students: 1100, courses: 2, bio: 'Modern history scholar and published author.' },
];

export function LabProvider({ children }) {
    const { user } = useAuth();

    const [courses, setCourses] = useState(() => {
        const stored = localStorage.getItem('labCourses');
        return stored ? JSON.parse(stored) : DEFAULT_COURSES;
    });

    const [teachers, setTeachers] = useState(() => {
        const stored = localStorage.getItem('labTeachers');
        return stored ? JSON.parse(stored) : DEFAULT_TEACHERS;
    });

    const [subscriptions, setSubscriptions] = useState(() => {
        if (!user) return { subjects: [], courses: [], teachers: [] };
        const stored = localStorage.getItem(`labSubs_${user.uid}`);
        return stored ? JSON.parse(stored) : { subjects: [], courses: [], teachers: [] };
    });

    const [notifications, setNotifications] = useState(() => {
        if (!user) return [];
        const stored = localStorage.getItem(`labNotifs_${user.uid}`);
        return stored ? JSON.parse(stored) : [];
    });

    const [activeSubject, setActiveSubject] = useState(null);
    const [labView, setLabView] = useState('courses');

    useEffect(() => {
        localStorage.setItem('labCourses', JSON.stringify(courses));
    }, [courses]);

    useEffect(() => {
        localStorage.setItem('labTeachers', JSON.stringify(teachers));
    }, [teachers]);

    useEffect(() => {
        if (!user) return;
        localStorage.setItem(`labSubs_${user.uid}`, JSON.stringify(subscriptions));
    }, [subscriptions, user]);

    useEffect(() => {
        if (!user) return;
        localStorage.setItem(`labNotifs_${user.uid}`, JSON.stringify(notifications));
    }, [notifications, user]);

    // Sync subjects from userProfile (onboarding) to Lab subscriptions
    // Also watch for profile changes to keep in sync
    useEffect(() => {
        if (!user) {
            setSubscriptions({ subjects: [], courses: [], teachers: [] });
            setNotifications([]);
            return;
        }
        
        // Read user's selected subjects from profile setup
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                const profileSubjects = profile.subjectsToStudy || profile.subjectsToTeach || [];
                
                setSubscriptions(prev => {
                    // Always sync profile subjects to subscriptions
                    const merged = [...prev.subjects];
                    let changed = false;
                    
                    profileSubjects.forEach(s => {
                        if (!merged.includes(s)) {
                            merged.push(s);
                            changed = true;
                        }
                    });
                    
                    if (changed) {
                        return { ...prev, subjects: merged };
                    }
                    return prev;
                });
            } catch (e) {
                console.error('Error syncing subjects from profile:', e);
            }
        }
    }, [user, subscriptions]); // Re-run when subscriptions change to keep in sync

    // Two-way sync: when Lab subscriptions change, also update userProfile
    useEffect(() => {
        if (!user || !subscriptions.subjects.length) return;
        
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                const isTeacher = user.role === 'teacher';
                const field = isTeacher ? 'subjectsToTeach' : 'subjectsToStudy';
                
                // Only update if different
                const current = profile[field] || [];
                if (JSON.stringify(current.sort()) !== JSON.stringify(subscriptions.subjects.sort())) {
                    profile[field] = subscriptions.subjects;
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                }
            } catch (e) {
                console.error('Error syncing subjects to profile:', e);
            }
        }
    }, [subscriptions.subjects, user]);

    const addNotification = useCallback((notif) => {
        const newNotif = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...notif,
            read: false,
            timestamp: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const subscribeSubject = useCallback((subjectId) => {
        if (!user) return;
        setSubscriptions(prev => {
            if (prev.subjects.includes(subjectId)) return prev;
            return { ...prev, subjects: [...prev.subjects, subjectId] };
        });
        addNotification({
            type: 'subject',
            title: 'Subject Added',
            message: `${getSubjectName(subjectId)} has been added to your learning subjects.`,
            linkTo: `/labs?subject=${subjectId}`
        });
    }, [user, addNotification]);

    const unsubscribeSubject = useCallback((subjectId) => {
        setSubscriptions(prev => ({
            ...prev,
            subjects: prev.subjects.filter(s => s !== subjectId)
        }));
    }, []);

    const subscribeCourse = useCallback((courseId) => {
        if (!user) return;
        setSubscriptions(prev => {
            if (prev.courses.includes(courseId)) return prev;
            const course = courses.find(c => c.id === courseId);
            const updated = { ...prev, courses: [...prev.courses, courseId] };
            if (course && !prev.subjects.includes(course.subject)) {
                updated.subjects = [...prev.subjects, course.subject];
            }
            return updated;
        });
        const course = courses.find(c => c.id === courseId);
        addNotification({
            type: 'course',
            title: 'Course Enrolled',
            message: `You've enrolled in "${course?.title}". Happy learning!`,
            linkTo: `/labs?course=${courseId}`
        });
    }, [user, courses, addNotification]);

    const unsubscribeCourse = useCallback((courseId) => {
        setSubscriptions(prev => ({
            ...prev,
            courses: prev.courses.filter(c => c !== courseId)
        }));
    }, []);

    const followTeacher = useCallback((teacherId) => {
        if (!user) return;
        setSubscriptions(prev => {
            if (prev.teachers.includes(teacherId)) return prev;
            return { ...prev, teachers: [...prev.teachers, teacherId] };
        });
        const teacher = teachers.find(t => t.id === teacherId);
        addNotification({
            type: 'teacher',
            title: 'Teacher Followed',
            message: `You're now following ${teacher?.name}. You'll receive updates about new courses and lessons.`,
            linkTo: `/labs?teacher=${teacherId}`
        });
    }, [user, teachers, addNotification]);

    const unfollowTeacher = useCallback((teacherId) => {
        setSubscriptions(prev => ({
            ...prev,
            teachers: prev.teachers.filter(t => t !== teacherId)
        }));
    }, []);

    const markNotificationRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllNotificationsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const deleteNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const addCourse = useCallback((courseData) => {
        const newCourse = {
            id: `course_${Date.now()}`,
            ...courseData,
            rating: 0,
            studentCount: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setCourses(prev => [newCourse, ...prev]);

        if (courseData.teacherId) {
            setTeachers(prev => prev.map(t =>
                t.id === courseData.teacherId
                    ? { ...t, courses: t.courses + 1 }
                    : t
            ));
        }

        subscriptions.teachers.forEach(followerId => {
            addNotification({
                type: 'new_course',
                title: 'New Course Published',
                message: `${courseData.teacherName || 'A teacher'} published a new course: "${courseData.title}"`,
                linkTo: `/labs?course=${newCourse.id}`
            });
        });

        return newCourse;
    }, [subscriptions.teachers, addNotification]);

    const updateCourse = useCallback((courseId, updates) => {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updates } : c));

        const course = courses.find(c => c.id === courseId);
        if (course && updates.lessons) {
            subscriptions.courses.forEach(subId => {
                if (subId === courseId) {
                    addNotification({
                        type: 'lesson_update',
                        title: 'Course Updated',
                        message: `"${course.title}" has been updated with new content.`,
                        linkTo: `/labs?course=${courseId}`
                    });
                }
            });
        }
    }, [courses, subscriptions.courses, addNotification]);

    const deleteCourse = useCallback((courseId) => {
        const course = courses.find(c => c.id === courseId);
        setCourses(prev => prev.filter(c => c.id !== courseId));
        if (course?.teacherId) {
            setTeachers(prev => prev.map(t =>
                t.id === course.teacherId ? { ...t, courses: Math.max(0, t.courses - 1) } : t
            ));
        }
        setSubscriptions(prev => ({
            ...prev,
            courses: prev.courses.filter(c => c !== courseId)
        }));
    }, [courses]);

    const getSubjectName = (subjectId) => {
        const subject = subjectsList.find(s => s.id === subjectId);
        return subject ? subject.en : subjectId;
    };

    const getSubjectIcon = (subjectId) => {
        const subject = subjectsList.find(s => s.id === subjectId);
        return subject ? subject.icon : '📚';
    };

    const getSubjectColor = (subjectId) => {
        const subject = subjectsList.find(s => s.id === subjectId);
        return subject ? subject.color : '#6B7280';
    };

    const getSubscribedCourses = useCallback(() => {
        return courses.filter(c => subscriptions.courses.includes(c.id));
    }, [courses, subscriptions.courses]);

    const getSubscribedTeachers = useCallback(() => {
        return teachers.filter(t => subscriptions.teachers.includes(t.id));
    }, [teachers, subscriptions.teachers]);

    const getTeacherCourses = useCallback((teacherId) => {
        return courses.filter(c => c.teacherId === teacherId);
    }, [courses]);

    const getSubjectCourses = useCallback((subjectId) => {
        return courses.filter(c => c.subject === subjectId);
    }, [courses]);

    const getSubjectTeachers = useCallback((subjectId) => {
        return teachers.filter(t => t.subject === subjectId);
    }, [teachers]);

    const isSubjectSubscribed = (subjectId) => subscriptions.subjects.includes(subjectId);
    const isCourseSubscribed = (courseId) => subscriptions.courses.includes(courseId);
    const isTeacherFollowed = (teacherId) => subscriptions.teachers.includes(teacherId);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <LabContext.Provider value={{
            courses,
            teachers,
            subscriptions,
            notifications,
            unreadCount,
            activeSubject,
            setActiveSubject,
            labView,
            setLabView,
            subscribeSubject,
            unsubscribeSubject,
            subscribeCourse,
            unsubscribeCourse,
            followTeacher,
            unfollowTeacher,
            addNotification,
            markNotificationRead,
            markAllNotificationsRead,
            deleteNotification,
            clearAllNotifications,
            addCourse,
            updateCourse,
            deleteCourse,
            getSubjectName,
            getSubjectIcon,
            getSubjectColor,
            getSubscribedCourses,
            getSubscribedTeachers,
            getTeacherCourses,
            getSubjectCourses,
            getSubjectTeachers,
            isSubjectSubscribed,
            isCourseSubscribed,
            isTeacherFollowed,
            subjectsList
        }}>
            {children}
        </LabContext.Provider>
    );
}

export function useLab() {
    const context = useContext(LabContext);
    if (!context) {
        throw new Error('useLab must be used within LabProvider');
    }
    return context;
}
