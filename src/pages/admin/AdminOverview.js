import { useState, useEffect, useCallback } from 'react';
import { getUserStats, getAllCourses, getAllVideos, getAllQuizzes, getAllResources, getAllReviews, getAllUsers } from '../../services/firestore';

export default function AdminOverview({ onNavigate }) {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        teachers: 0,
        students: 0,
        banned: 0,
    });
    const [contentStats, setContentStats] = useState({
        courses: 0,
        videos: 0,
        quizzes: 0,
        resources: 0,
        reviews: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [userStats, courses, videos, quizzes, resources, reviews, users] = await Promise.all([
                getUserStats(),
                getAllCourses(),
                getAllVideos(),
                getAllQuizzes(),
                getAllResources(),
                getAllReviews(),
                getAllUsers(),
            ]);

            setStats(userStats);
            setContentStats({
                courses: courses.length,
                videos: videos.length,
                quizzes: quizzes.length,
                resources: resources.length,
                reviews: reviews.length,
            });

            const sorted = users
                .filter(u => u.status !== 'deleted')
                .sort((a, b) => {
                    const ta = toTimestamp(a.createdAt);
                    const tb = toTimestamp(b.createdAt);
                    return tb - ta;
                })
                .slice(0, 5);
            setRecentUsers(sorted);
        } catch (err) {
            console.error('[AdminOverview] Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toTimestamp = (ts) => {
        if (!ts) return 0;
        if (ts.toDate) return ts.toDate().getTime();
        if (ts instanceof Date) return ts.getTime();
        if (typeof ts === 'number') return ts;
        return 0;
    };

    const formatDate = (ts) => {
        if (!ts) return 'N/A';
        try {
            const date = ts.toDate ? ts.toDate() : new Date(ts);
            return date.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading dashboard...
            </div>
        );
    }

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
                    </div>
                    <div className="admin-stat-value">{stats.total}</div>
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
                    </div>
                    <div className="admin-stat-value">{stats.banned}</div>
                    <div className="admin-stat-label">Banned</div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Content Overview
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'Courses', count: contentStats.courses, color: '#8B5CF6' },
                            { label: 'Videos', count: contentStats.videos, color: '#EF4444' },
                            { label: 'Quizzes', count: contentStats.quizzes, color: '#3B82F6' },
                            { label: 'Resources', count: contentStats.resources, color: '#10B981' },
                            { label: 'Reviews', count: contentStats.reviews, color: '#F59E0B' },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 12px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                            }}>
                                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.label}</span>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: item.color,
                                }}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Recent Users
                    </div>
                    {recentUsers.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            No users registered yet
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentUsers.map(user => (
                                <div key={user.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'var(--accent-gradient)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                    }}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            (user.fullName?.[0] || user.email?.[0] || 'U').toUpperCase()
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user.fullName || 'No name'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                            {user.role || 'No role'} • {formatDate(user.createdAt)}
                                        </div>
                                    </div>
                                    <span className={`admin-status-badge ${user.status || 'active'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                        {user.status || 'active'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
