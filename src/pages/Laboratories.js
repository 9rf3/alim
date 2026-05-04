import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLab } from '../contexts/LabContext';
import Navbar from '../components/Navbar';
import '../styles/main.css';
import '../styles/laboratories.css';

export default function Laboratories() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {
        courses, subscriptions, subjectsList,
        subscribeSubject, subscribeCourse,
        followTeacher, unfollowTeacher, isCourseSubscribed, isTeacherFollowed,
        getSubjectName, getSubjectIcon, getSubjectColor, getSubscribedCourses,
        getSubscribedTeachers, getSubjectCourses,
        addCourse, deleteCourse
    } = useLab();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('my-courses');
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', subject: '', price: 'free', lessons: '' });
    const [filterSubject, setFilterSubject] = useState(null);

    useEffect(() => {
        if (!userProfile) {
            navigate('/signin?redirect=/labs');
            return;
        }

        const subjectParam = searchParams.get('subject');
        const courseParam = searchParams.get('course');
        const teacherParam = searchParams.get('teacher');

        if (subjectParam) setFilterSubject(subjectParam);
        if (courseParam) setActiveTab('browse');
        if (teacherParam) setActiveTab('teachers');
    }, [userProfile, searchParams, navigate]);

    const isTeacher = userProfile?.role === 'teacher';

    const subscribedCourses = getSubscribedCourses();
    const subscribedTeachers = getSubscribedTeachers();
    const availableSubjects = subjectsList;

    const handleSubscribeSubject = (subjectId) => {
        subscribeSubject(subjectId);
    };

    const handleSubscribeCourse = (courseId) => {
        subscribeCourse(courseId);
        setActiveTab('my-courses');
    };

    const handleFollowTeacher = (teacherId) => {
        followTeacher(teacherId);
    };

    const handleAddCourse = () => {
        if (!newCourse.title || !newCourse.subject) return;
        addCourse({
            ...newCourse,
            teacherId: userProfile?.uid || 'teacher_demo',
            teacherName: userProfile?.fullName || 'Teacher',
            lessons: parseInt(newCourse.lessons) || 0,
            rating: 0,
            studentCount: 0
        });
        setNewCourse({ title: '', description: '', subject: '', price: 'free', lessons: '' });
        setShowAddCourse(false);
    };

    // Sort courses: user's subjects first, then others
    // "Browse All" shows only subscribed subjects' courses
    const getSortedCourses = () => {
        if (filterSubject) {
            return getSubjectCourses(filterSubject);
        }
        
        // Only show courses for user's subscribed subjects
        const userSubjects = subscriptions.subjects;
        if (userSubjects.length > 0) {
            return courses.filter(c => userSubjects.includes(c.subject));
        }
        
        // If no subjects subscribed, show none (user must pick subjects first)
        return [];
    };
    
    const filteredCourses = getSortedCourses();

    const teacherMyCourses = isTeacher ? courses.filter(c => c.teacherId === userProfile?.uid) : [];

    if (!userProfile) return null;

    return (
        <>
            <Navbar />
            <div className="labs-page">
                {/* Mobile Sidebar Toggle */}
                <button className="labs-mobile-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {sidebarOpen ? (
                            <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                        ) : (
                            <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                        )}
                    </svg>
                </button>

                {/* Overlay */}
                {sidebarOpen && <div className="labs-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

                {/* Sidebar */}
                <aside className={`labs-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="labs-sidebar-header">
                        <h3>{isTeacher ? 'Teaching Hub' : 'Learning Hub'}</h3>
                    </div>

                    <div className="labs-sidebar-content">
                        {/* Your Subjects */}
                        <div className="labs-sidebar-section">
                            <div className="labs-sidebar-label">
                                {isTeacher ? 'My Subjects' : 'My Subjects'}
                            </div>
                            {subscriptions.subjects.length > 0 ? (
                                subscriptions.subjects.map(subjectId => {
                                    const subject = subjectsList.find(s => s.id === subjectId);
                                    if (!subject) return null;
                                    return (
                                        <button
                                            key={subjectId}
                                            className={`labs-sidebar-item active ${filterSubject === subjectId ? 'selected' : ''}`}
                                            onClick={() => { setFilterSubject(filterSubject === subjectId ? null : subjectId); setSidebarOpen(false); }}
                                        >
                                            <span className="labs-item-icon">{subject.icon}</span>
                                            <span className="labs-item-text">{subject.en}</span>
                                            <span className="labs-item-count">{getSubjectCourses(subjectId).length}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="labs-sidebar-empty">No subjects yet</div>
                            )}
                        </div>

                        <div className="labs-sidebar-divider"></div>

                        {/* Other Subjects */}
                        <div className="labs-sidebar-section">
                            <div className="labs-sidebar-label">Explore Subjects</div>
                            {availableSubjects.filter(s => !subscriptions.subjects.includes(s.id)).map(subject => (
                                <button
                                    key={subject.id}
                                    className="labs-sidebar-item"
                                    onClick={() => handleSubscribeSubject(subject.id)}
                                >
                                    <span className="labs-item-icon">{subject.icon}</span>
                                    <span className="labs-item-text">{subject.en}</span>
                                    <span className="labs-subscribe-badge">+</span>
                                </button>
                            ))}
                        </div>

                        {isTeacher && (
                            <>
                                <div className="labs-sidebar-divider"></div>
                                <div className="labs-sidebar-section">
                                    <div className="labs-sidebar-label">Quick Actions</div>
                                    <button
                                        className="labs-sidebar-action"
                                        onClick={() => { setShowAddCourse(true); setSidebarOpen(false); }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                        </svg>
                                        Add New Course
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="labs-main">
                    {/* Header */}
                    <div className="labs-header">
                        <div className="labs-header-left">
                            <h1 className="labs-title">
                                {isTeacher ? 'My Teaching Hub' : 'Laboratories'}
                            </h1>
                            <p className="labs-subtitle">
                                {isTeacher
                                    ? 'Manage your courses and reach more students'
                                    : 'Explore courses, follow teachers, and continue learning'
                                }
                            </p>
                        </div>
                        {isTeacher && (
                            <button className="labs-add-course-btn" onClick={() => setShowAddCourse(true)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Add Course
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="labs-tabs">
                        {isTeacher ? (
                            <>
                                <button className={`labs-tab ${activeTab === 'my-courses' ? 'active' : ''}`} onClick={() => setActiveTab('my-courses')}>
                                    My Courses ({teacherMyCourses.length})
                                </button>
                                <button className={`labs-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
                                    Explore
                                </button>
                                <button className={`labs-tab ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}>
                                    Subscribers
                                </button>
                            </>
                        ) : (
                            <>
                                <button className={`labs-tab ${activeTab === 'my-courses' ? 'active' : ''}`} onClick={() => setActiveTab('my-courses')}>
                                    My Courses ({subscribedCourses.length})
                                </button>
                                <button className={`labs-tab ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
                                    My Teachers ({subscribedTeachers.length})
                                </button>
                                <button className={`labs-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
                                    Browse All
                                </button>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="labs-content">
                        {activeTab === 'my-courses' && (
                            <div className="labs-courses-grid">
                                {isTeacher ? (
                                    teacherMyCourses.length > 0 ? (
                                        teacherMyCourses.map(course => (
                                            <div key={course.id} className="labs-course-card teacher-card">
                                                <div className="labs-course-badge" style={{ background: getSubjectColor(course.subject) }}>
                                                    {getSubjectIcon(course.subject)} {getSubjectName(course.subject)}
                                                </div>
                                                <h3 className="labs-course-title">{course.title}</h3>
                                                <p className="labs-course-desc">{course.description}</p>
                                                <div className="labs-course-meta">
                                                    <span className="labs-course-stat">{course.lessons} lessons</span>
                                                    <span className="labs-course-stat">{course.studentCount} students</span>
                                                    <span className="labs-course-price">{course.price === 'free' ? 'Free' : 'Premium'}</span>
                                                </div>
                                                <div className="labs-course-actions">
                                                    <button className="labs-course-action-btn edit">Edit</button>
                                                    <button className="labs-course-action-btn delete" onClick={() => deleteCourse(course.id)}>Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="labs-empty">
                                            <div className="labs-empty-icon">📚</div>
                                            <h3>No courses yet</h3>
                                            <p>Create your first course to start teaching</p>
                                            <button className="labs-cta-btn" onClick={() => setShowAddCourse(true)}>Create Course</button>
                                        </div>
                                    )
                                ) : (
                                    subscribedCourses.length > 0 ? (
                                        subscribedCourses.map(course => (
                                            <div key={course.id} className="labs-course-card">
                                                <div className="labs-course-badge" style={{ background: getSubjectColor(course.subject) }}>
                                                    {getSubjectIcon(course.subject)} {getSubjectName(course.subject)}
                                                </div>
                                                <h3 className="labs-course-title">{course.title}</h3>
                                                <p className="labs-course-desc">{course.description}</p>
                                                <div className="labs-course-teacher">
                                                    <div className="labs-teacher-avatar">{course.teacherName[0]}</div>
                                                    <span>{course.teacherName}</span>
                                                </div>
                                                <div className="labs-course-meta">
                                                    <span className="labs-course-stat">⭐ {course.rating}</span>
                                                    <span className="labs-course-stat">{course.studentCount} students</span>
                                                    <span className="labs-course-stat">{course.lessons} lessons</span>
                                                </div>
                                                <button className="labs-continue-btn" onClick={() => navigate(`/labs?course=${course.id}`)}>Continue Learning</button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="labs-empty">
                                            <div className="labs-empty-icon">🎓</div>
                                            <h3>No courses yet</h3>
                                            <p>Subscribe to courses to start your learning journey</p>
                                            <button className="labs-cta-btn" onClick={() => setActiveTab('browse')}>Browse Courses</button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {activeTab === 'teachers' && !isTeacher && (
                            <div className="labs-teachers-grid">
                                {subscribedTeachers.length > 0 ? (
                                    subscribedTeachers.map(teacher => (
                                        <div key={teacher.id} className="labs-teacher-card">
                                            <div className="labs-teacher-avatar-large">{teacher.name[0]}</div>
                                            <h3 className="labs-teacher-name">{teacher.name}</h3>
                                            <p className="labs-teacher-subject">{getSubjectIcon(teacher.subject)} {getSubjectName(teacher.subject)}</p>
                                            <p className="labs-teacher-bio">{teacher.bio}</p>
                                            <div className="labs-teacher-stats">
                                                <span>⭐ {teacher.rating}</span>
                                                <span>👥 {teacher.students}</span>
                                                <span>📚 {teacher.courses}</span>
                                            </div>
                                            <button className="labs-unfollow-btn" onClick={() => unfollowTeacher(teacher.id)}>Following</button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="labs-empty">
                                        <div className="labs-empty-icon">👨‍🏫</div>
                                        <h3>No followed teachers</h3>
                                        <p>Follow teachers to receive updates about new courses and lessons</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'browse' && (
                            <div className="labs-courses-grid">
                                {filteredCourses.map(course => {
                                    const subscribed = isCourseSubscribed(course.id);
                                    return (
                                        <div key={course.id} className={`labs-course-card ${subscribed ? 'subscribed' : ''}`}>
                                            <div className="labs-course-badge" style={{ background: getSubjectColor(course.subject) }}>
                                                {getSubjectIcon(course.subject)} {getSubjectName(course.subject)}
                                            </div>
                                            <h3 className="labs-course-title">{course.title}</h3>
                                            <p className="labs-course-desc">{course.description}</p>
                                            <div className="labs-course-teacher">
                                                <div className="labs-teacher-avatar">{course.teacherName[0]}</div>
                                                <span>{course.teacherName}</span>
                                                {!isTeacherFollowed(course.teacherId) && (
                                                    <button className="labs-follow-mini" onClick={() => handleFollowTeacher(course.teacherId)}>Follow</button>
                                                )}
                                            </div>
                                            <div className="labs-course-meta">
                                                <span className="labs-course-stat">⭐ {course.rating}</span>
                                                <span className="labs-course-stat">{course.studentCount} students</span>
                                                <span className="labs-course-stat">{course.lessons} lessons</span>
                                            </div>
                                            <div className="labs-course-footer">
                                                <span className={`labs-price-tag ${course.price === 'free' ? 'free' : 'premium'}`}>
                                                    {course.price === 'free' ? 'Free' : 'Premium'}
                                                </span>
                                                {subscribed ? (
                                                    <button className="labs-continue-btn" onClick={() => navigate(`/labs?course=${course.id}`)}>Continue</button>
                                                ) : (
                                                    <button className="labs-subscribe-btn" onClick={() => handleSubscribeCourse(course.id)}>
                                                        Enroll Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'subscribers' && isTeacher && (
                            <div className="labs-subscribers-view">
                                <div className="labs-stats-row">
                                    <div className="labs-stat-box">
                                        <span className="labs-stat-number">{teacherMyCourses.reduce((sum, c) => sum + c.studentCount, 0)}</span>
                                        <span className="labs-stat-label">Total Students</span>
                                    </div>
                                    <div className="labs-stat-box">
                                        <span className="labs-stat-number">{teacherMyCourses.length}</span>
                                        <span className="labs-stat-label">Courses</span>
                                    </div>
                                    <div className="labs-stat-box">
                                        <span className="labs-stat-number">{subscriptions.teachers.includes(userProfile?.uid) ? 'Active' : 'Building'}</span>
                                        <span className="labs-stat-label">Audience</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Add Course Modal */}
            {showAddCourse && (
                <div className="labs-modal-overlay" onClick={() => setShowAddCourse(false)}>
                    <div className="labs-modal" onClick={e => e.stopPropagation()}>
                        <div className="labs-modal-header">
                            <h3>Create New Course</h3>
                            <button className="labs-modal-close" onClick={() => setShowAddCourse(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="labs-modal-body">
                            <div className="labs-form-group">
                                <label>Course Title</label>
                                <input value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="e.g. Advanced Physics" />
                            </div>
                            <div className="labs-form-group">
                                <label>Description</label>
                                <textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} placeholder="Describe your course..." rows="3" />
                            </div>
                            <div className="labs-form-row">
                                <div className="labs-form-group">
                                    <label>Subject</label>
                                    <select value={newCourse.subject} onChange={e => setNewCourse({...newCourse, subject: e.target.value})}>
                                        <option value="">Select subject</option>
                                        {subjectsList.map(s => <option key={s.id} value={s.id}>{s.icon} {s.en}</option>)}
                                    </select>
                                </div>
                                <div className="labs-form-group">
                                    <label>Pricing</label>
                                    <select value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})}>
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                            </div>
                            <div className="labs-form-group">
                                <label>Number of Lessons</label>
                                <input type="number" value={newCourse.lessons} onChange={e => setNewCourse({...newCourse, lessons: e.target.value})} placeholder="e.g. 24" min="1" />
                            </div>
                        </div>
                        <div className="labs-modal-footer">
                            <button className="labs-btn secondary" onClick={() => setShowAddCourse(false)}>Cancel</button>
                            <button className="labs-btn primary" onClick={handleAddCourse}>Create Course</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
