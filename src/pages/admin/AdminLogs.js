import { useState, useEffect, useRef } from 'react';
import { getLogsRealtime } from '../../services/firestore';
import { exportLogsToExcel } from '../../services/excelExport';
import DateRangePicker from '../../components/admin/DateRangePicker';
import CopyButton from '../../components/admin/CopyButton';

const ACTION_ICONS = {
    register: { icon: '📝', color: '#3B82F6', label: 'Registration' },
    login: { icon: '🔑', color: '#10B981', label: 'Login' },
    logout: { icon: '🚪', color: '#6B7280', label: 'Logout' },
    purchase: { icon: '💳', color: '#F59E0B', label: 'Purchase' },
    subscribe: { icon: '⭐', color: '#8B5CF6', label: 'Subscribe' },
    unsubscribe: { icon: '❌', color: '#EF4444', label: 'Unsubscribe' },
    update_profile: { icon: '✏️', color: '#3B82F6', label: 'Profile Update' },
    quiz_complete: { icon: '📊', color: '#EC4899', label: 'Quiz Complete' },
    video_view: { icon: '🎬', color: '#F59E0B', label: 'Video View' },
    certificate: { icon: '🏆', color: '#10B981', label: 'Certificate' },
};

function getActionInfo(action) {
    return ACTION_ICONS[action] || { icon: '📌', color: '#6B7280', label: action || 'Unknown' };
}

function formatTimestamp(ts) {
    if (!ts) return { date: 'N/A', time: '' };
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
    } catch {
        return { date: 'N/A', time: '' };
    }
}

function toDate(ts) {
    if (!ts) return null;
    try { return ts.toDate ? ts.toDate() : new Date(ts); } catch { return null; }
}

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [live, setLive] = useState(true);
    const [filterAction, setFilterAction] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, uniqueUsers: 0 });
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportMsg, setExportMsg] = useState('');
    const containerRef = useRef(null);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        const unsub = getLogsRealtime((newLogs) => {
            setLogs(newLogs);
            setLoading(false);

            const today = new Date().toISOString().slice(0, 10);
            const uniqueUsers = new Set();
            let todayCount = 0;
            newLogs.forEach(l => {
                if (l.userId) uniqueUsers.add(l.userId);
                try {
                    const lt = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
                    if (lt.toISOString().slice(0, 10) === today) todayCount++;
                } catch {}
            });
            setStats({ total: newLogs.length, today: todayCount, uniqueUsers: uniqueUsers.size });
        });
        unsubscribeRef.current = unsub;
        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
    }, []);

    useEffect(() => {
        if (autoScroll && containerRef.current && live) {
            containerRef.current.scrollTop = 0;
        }
    }, [logs, autoScroll, live]);

    const inDateRange = (log) => {
        if (!startDate || !endDate) return true;
        const d = toDate(log.timestamp);
        if (!d) return true;
        return d >= startDate && d <= endDate;
    };

    const filteredLogs = logs.filter(l => {
        if (filterAction !== 'all' && l.action !== filterAction) return false;
        if (!inDateRange(l)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const meta = JSON.stringify(l).toLowerCase();
            if (!meta.includes(q)) return false;
        }
        return true;
    });

    const actionCounts = {};
    logs.forEach(l => {
        actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
    });

    const handleExport = () => {
        setExporting(true);
        setExportMsg('');
        try {
            const filename = exportLogsToExcel(filteredLogs, {
                startDate,
                endDate,
                actionFilter: filterAction,
                searchQuery,
            });
            setExportMsg(`Exported: ${filename}`);
        } catch (err) {
            setExportMsg('Export failed: ' + err.message);
        } finally {
            setExporting(false);
            setTimeout(() => setExportMsg(''), 4000);
        }
    };

    return (
        <div>
            <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                        <span className={`admin-live-badge ${live ? 'active' : ''}`}
                            onClick={() => setLive(!live)}
                            style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? '#10B981' : '#6B7280', display: 'inline-block' }}></span>
                            {live ? 'LIVE' : 'OFF'}
                        </span>
                    </div>
                    <div className="admin-stat-value">{stats.total}</div>
                    <div className="admin-stat-label">Total Log Events</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{stats.today}</div>
                    <div className="admin-stat-label">Today's Events</div>
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
                    <div className="admin-stat-value">{stats.uniqueUsers}</div>
                    <div className="admin-stat-label">Unique Users</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{logs.filter(l => l.action === 'register').length}</div>
                    <div className="admin-stat-label">Total Registrations</div>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-title">
                        Event Log {live && <span style={{ fontSize: 11, color: '#10B981', marginLeft: 8 }}>● Live</span>}
                        {filteredLogs.length > 0 && (
                            <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8, fontWeight: 400 }}>
                                ({filteredLogs.length} showing)
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="admin-search" style={{ position: 'relative' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#4B5563' }}>
                                <circle cx="11" cy="11" r="8"/><path d="M21 21L16.65 16.65"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ padding: '6px 10px 6px 30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 160 }}
                            />
                        </div>
                        <select
                            value={filterAction}
                            onChange={e => setFilterAction(e.target.value)}
                            style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="all">All Actions</option>
                            {Object.entries(actionCounts).sort().map(([action, count]) => (
                                <option key={action} value={action}>
                                    {ACTION_ICONS[action]?.label || action} ({count})
                                </option>
                            ))}
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
                            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} style={{ accentColor: '#3B82F6' }} />
                            Auto-scroll
                        </label>
                        <button
                            className="admin-filter-btn"
                            onClick={() => { if (unsubscribeRef.current) unsubscribeRef.current(); setLogs([]); setStats({ total: 0, today: 0, uniqueUsers: 0 }); }}
                            style={{ fontSize: 11 }}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="admin-toolbar">
                    <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
                    <button
                        className="admin-btn success admin-export-btn"
                        onClick={handleExport}
                        disabled={exporting || filteredLogs.length === 0}
                    >
                        {exporting ? (
                            <>
                                <div className="mini-spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Export to Excel
                            </>
                        )}
                    </button>
                </div>

                {exportMsg && (
                    <div style={{
                        padding: '10px 16px',
                        margin: '0 16px 8px',
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

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                        <div style={{ width: 32, height: 32, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#60A5FA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                        Connecting to live log stream...
                    </div>
                ) : (
                    <div ref={containerRef} className="admin-logs-container">
                        {filteredLogs.length === 0 ? (
                            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748B' }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                                <div style={{ fontSize: 14 }}>No log entries found</div>
                                <div style={{ fontSize: 12, marginTop: 4 }}>Events will appear here in real-time as users interact with the platform</div>
                            </div>
                        ) : (
                            filteredLogs.map((log, i) => {
                                const actionInfo = getActionInfo(log.action);
                                const ts = formatTimestamp(log.timestamp);
                                return (
                                    <div key={log.id || i} className="admin-log-entry" style={{ animationDelay: `${i * 20}ms` }}>
                                        <div className="admin-log-icon" style={{ background: `${actionInfo.color}15` }}>
                                            <span>{actionInfo.icon}</span>
                                        </div>
                                        <div className="admin-log-content">
                                            <div className="admin-log-header">
                                                <span className="admin-log-action" style={{ color: actionInfo.color }}>{actionInfo.label}</span>
                                                <span className="admin-log-user" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    {log.userId ? (
                                                        <>{log.userId.slice(0, 8)}...<CopyButton text={log.userId} label="Copy User ID" /></>
                                                    ) : 'Anonymous'}
                                                </span>
                                                {log.email && (
                                                    <span className="admin-log-email" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        {log.email}<CopyButton text={log.email} label="Copy Email" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="admin-log-meta">
                                                {log.action === 'purchase' && log.amount && (
                                                    <span className="admin-log-tag" style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24' }}>${log.amount}</span>
                                                )}
                                                {log.action === 'register' && log.provider && (
                                                    <span className="admin-log-tag" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}>{log.provider}</span>
                                                )}
                                                {log.action === 'subscribe' && log.plan && (
                                                    <span className="admin-log-tag" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>{log.plan}</span>
                                                )}
                                                {log.teacherId && (
                                                    <span className="admin-log-tag" style={{ background: 'rgba(236,72,153,0.15)', color: '#F472B6' }}>teacher: {log.teacherId.slice(0, 8)}...</span>
                                                )}
                                            </div>
                                            {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                                                <div className="admin-log-metadata">
                                                    {Object.entries(log.metadata).map(([k, v]) => (
                                                        <span key={k} style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace' }}>{k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="admin-log-time">
                                            <div className="admin-log-date">{ts.date}</div>
                                            <div className="admin-log-time-value">{ts.time}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
