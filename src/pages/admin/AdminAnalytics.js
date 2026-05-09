import { useState, useEffect } from 'react';
import { getAnalyticsData } from '../../services/firestore';
import { exportAnalyticsToExcel } from '../../services/excelExport';

function BarChart({ data, color = '#3B82F6', height = 160 }) {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d[1]), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, paddingTop: 8 }}>
            {data.map(([label, val], i) => {
                const pct = (val / maxVal) * 100;
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{val}</span>
                        <div style={{
                            width: '100%',
                            height: `${Math.max(pct, 2)}%`,
                            background: `linear-gradient(180deg, ${color}, ${color}60)`,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease',
                            minHeight: 2,
                        }} />
                        <span style={{ fontSize: 9, color: '#4B5563', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: 4 }}>{label.slice(5)}</span>
                    </div>
                );
            })}
        </div>
    );
}

function DoughnutChart({ data, size = 160 }) {
    if (!data || data.length === 0) return null;
    const total = data.reduce((s, d) => s + d[1], 0) || 1;
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
    let offset = 0;
    const radius = size / 2 - 16;
    const circumference = 2 * Math.PI * radius;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`translate(${size / 2}, ${size / 2})`}>
                    {data.map(([label, val], i) => {
                        const pct = val / total;
                        const dashLen = pct * circumference;
                        const dashOffset = -offset;
                        offset += dashLen;
                        return (
                            <circle key={i}
                                r={radius}
                                fill="none"
                                stroke={colors[i % colors.length]}
                                strokeWidth="20"
                                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90)"
                                style={{ transition: 'all 0.5s ease' }}
                            />
                        );
                    })}
                    <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="700">
                        {total}
                    </text>
                    <text textAnchor="middle" dominantBaseline="central" fill="#64748B" fontSize="10" dy="18">
                        Total
                    </text>
                </g>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.map(([label, val], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportMsg, setExportMsg] = useState('');

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const data = await getAnalyticsData();
            setAnalytics(data);
        } catch (err) {
            console.error('[AdminAnalytics] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (metrics) => {
        if (!analytics) return;
        setExporting(true);
        setExportMsg('');
        try {
            const filename = exportAnalyticsToExcel(analytics, metrics);
            setExportMsg(`Report exported: ${filename}`);
        } catch (err) {
            setExportMsg('Export failed: ' + err.message);
        } finally {
            setExporting(false);
            setTimeout(() => setExportMsg(''), 4000);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                <div style={{ width: 32, height: 32, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#60A5FA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                Loading analytics...
            </div>
        );
    }

    if (!analytics) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                Failed to load analytics data
            </div>
        );
    }

    const roleData = Object.entries(analytics.userRoleDistribution).filter(([_, v]) => v > 0);
    const planData = Object.entries(analytics.subscriptionsByPlan);
    const actionData = Object.entries(analytics.logActions).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return (
        <div>
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{analytics.totalUsers}</div>
                    <div className="admin-stat-label">Total Users</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{analytics.activeUsers}</div>
                    <div className="admin-stat-label">Active This Week</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{analytics.newUsersThisMonth}</div>
                    <div className="admin-stat-label">New This Month</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{analytics.totalLogs}</div>
                    <div className="admin-stat-label">Total Events</div>
                </div>
            </div>

            {exportMsg && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: 20,
                    background: exportMsg.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${exportMsg.includes('failed') ? '#EF4444' : '#10B981'}`,
                    borderRadius: 8,
                    color: exportMsg.includes('failed') ? '#EF4444' : '#10B981',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        {exportMsg.includes('failed') ? (
                            <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
                        ) : (
                            <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                        )}
                    </svg>
                    {exportMsg}
                </div>
            )}

            <div className="analytics-grid">
                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        Registrations (Last 30 Days)
                    </div>
                    {analytics.registrationsByDay.length > 0 ? (
                        <BarChart data={analytics.registrationsByDay} color="#3B82F6" />
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No registration data yet</div>
                    )}
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Activity (Last 30 Days)
                    </div>
                    {analytics.logsByDay.length > 0 ? (
                        <BarChart data={analytics.logsByDay} color="#10B981" />
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No activity data yet</div>
                    )}
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        User Roles
                    </div>
                    {roleData.length > 0 ? (
                        <DoughnutChart data={roleData} />
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No user data</div>
                    )}
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Top Actions
                    </div>
                    {actionData.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {actionData.map(([action, count], i) => {
                                const maxCount = actionData[0][1] || 1;
                                const pct = (count / maxCount) * 100;
                                const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];
                                return (
                                    <div key={action} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ width: 20, fontSize: 11, color: '#4B5563', textAlign: 'right' }}>{i + 1}</span>
                                        <span style={{ fontSize: 13, color: '#cbd5e1', width: 120, flexShrink: 0 }}>{action}</span>
                                        <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}80)`, borderRadius: 10, transition: 'width 0.5s ease' }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', width: 40, textAlign: 'right' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No action data</div>
                    )}
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Subscriptions by Plan
                    </div>
                    {planData.length > 0 ? (
                        <DoughnutChart data={planData} size={140} />
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No subscriptions yet</div>
                    )}
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Subscription Status
                    </div>
                    {analytics.subscriptionsByStatus && Object.keys(analytics.subscriptionsByStatus).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {Object.entries(analytics.subscriptionsByStatus).map(([status, count]) => {
                                const total = Object.values(analytics.subscriptionsByStatus).reduce((s, v) => s + v, 0) || 1;
                                const pct = ((count / total) * 100).toFixed(0);
                                const colors = { active: '#10B981', cancelled: '#EF4444', expired: '#F59E0B', pending: '#3B82F6' };
                                const color = colors[status] || '#6B7280';
                                return (
                                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#cbd5e1', flex: 1, textTransform: 'capitalize' }}>{status}</span>
                                        <span style={{ fontSize: 12, color: '#64748B', width: 36 }}>{pct}%</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', width: 40, textAlign: 'right' }}>{count}</span>
                                        <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No subscription data</div>
                    )}
                </div>
            </div>

            <div className="admin-export-section">
                <div className="admin-export-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, color: '#60A5FA' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export Reports
                </div>
                <div className="admin-export-actions">
                    <button
                        className="admin-btn success"
                        onClick={() => handleExport({ registrationsByDay: true, logsByDay: true })}
                        disabled={exporting}
                    >
                        {exporting ? 'Exporting...' : 'Export Activity Charts'}
                    </button>
                    <button
                        className="admin-btn primary"
                        onClick={() => handleExport({ logActions: true, subscriptionsByPlan: true, userRoleDistribution: true })}
                        disabled={exporting}
                    >
                        {exporting ? 'Exporting...' : 'Export Full Analytics Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
