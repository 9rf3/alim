import { useState, useEffect } from 'react'; //useMemo

export default function AdminOverview({ onNavigate }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        teachers: 0,
        students: 0,
        reviews: 0,
        subjects: 0,
    });

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        const authUser = localStorage.getItem('authUser');
        const reviews = JSON.parse(localStorage.getItem('teacherReviews') || '[]');
        const subjects = JSON.parse(localStorage.getItem('adminSubjects') || '[]');

        const users = [];
        if (authUser) users.push(JSON.parse(authUser));
        if (profile) users.push({ ...JSON.parse(authUser || '{}'), ...JSON.parse(profile) });

        setStats({
            totalUsers: Math.max(users.length, 1),
            teachers: users.filter(u => u.role === 'teacher').length || 1,
            students: users.filter(u => u.role === 'student').length || 1,
            reviews: reviews.length,
            subjects: subjects.length || 20,
        });
    }, []);

    return (
        <div>
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <span className="admin-stat-change up">+12%</span>
                    </div>
                    <div className="admin-stat-value">{stats.totalUsers}</div>
                    <div className="admin-stat-label">Total Users</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                            </svg>
                        </div>
                        <span className="admin-stat-change up">+5%</span>
                    </div>
                    <div className="admin-stat-value">{stats.teachers}</div>
                    <div className="admin-stat-label">Teachers</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <span className="admin-stat-change up">+18%</span>
                    </div>
                    <div className="admin-stat-value">{stats.students}</div>
                    <div className="admin-stat-label">Students</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <span className="admin-stat-change up">+8%</span>
                    </div>
                    <div className="admin-stat-value">{stats.reviews}</div>
                    <div className="admin-stat-label">Reviews</div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        Popular Subjects
                    </div>
                    <div className="popular-subjects-list">
                        {[
                            { name: 'Mathematics', count: 45, icon: '📐' },
                            { name: 'Programming', count: 38, icon: '💻' },
                            { name: 'English', count: 32, icon: '📖' },
                            { name: 'Physics', count: 28, icon: '⚛️' },
                            { name: 'Chemistry', count: 24, icon: '🧪' },
                        ].map((subject, i) => (
                            <div key={subject.name} className="popular-subject-item">
                                <div className="popular-subject-rank">{i + 1}</div>
                                <span style={{ fontSize: 18 }}>{subject.icon}</span>
                                <div className="popular-subject-name">{subject.name}</div>
                                <div className="popular-subject-count">{subject.count} users</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Top Teachers
                    </div>
                    <div className="top-teachers-list">
                        {[
                            { name: 'Dr. Sarah Chen', subjects: 'Mathematics, Physics', rating: 4.9 },
                            { name: 'Prof. Alex Rivera', subjects: 'Programming, Design', rating: 4.8 },
                            { name: 'Maria Johnson', subjects: 'English, Literature', rating: 4.7 },
                        ].map((teacher, i) => (
                            <div key={teacher.name} className="top-teacher-item">
                                <div className="top-teacher-avatar">{teacher.name[0]}</div>
                                <div className="top-teacher-info">
                                    <div className="top-teacher-name">{teacher.name}</div>
                                    <div className="top-teacher-subjects">{teacher.subjects}</div>
                                </div>
                                <div className="top-teacher-rating">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                    {teacher.rating}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-title">Recent Activity</div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { user: 'John Doe', action: 'Completed registration', time: '2 min ago', status: 'active' },
                            { user: 'Jane Smith', action: 'Updated profile', time: '15 min ago', status: 'active' },
                            { user: 'Mike Wilson', action: 'Submitted review', time: '1 hour ago', status: 'active' },
                            { user: 'Sarah Lee', action: 'Enrolled in course', time: '3 hours ago', status: 'active' },
                        ].map((activity, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="admin-user-cell">
                                        <div className="admin-user-cell-avatar">{activity.user[0]}</div>
                                        <div className="admin-user-cell-info">
                                            <div className="admin-user-cell-name">{activity.user}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{activity.action}</td>
                                <td style={{ color: '#64748B' }}>{activity.time}</td>
                                <td><span className={`admin-status-badge ${activity.status}`}>{activity.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
