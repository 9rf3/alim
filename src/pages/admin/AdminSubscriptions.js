import { useState, useEffect } from 'react';
import { getAllSubscriptions, cancelSubscription } from '../../services/firestore';
import { exportSubscriptionsToExcel } from '../../services/excelExport';
import DateRangePicker from '../../components/admin/DateRangePicker';
import CopyButton from '../../components/admin/CopyButton';

const STATUS_STYLES = {
    active: { bg: 'rgba(16,185,129,0.15)', color: '#34D399' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
    expired: { bg: 'rgba(245,158,11,0.15)', color: '#FBBF24' },
    pending: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
};

function formatDate(ts) {
    if (!ts) return 'N/A';
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return 'N/A';
    }
}

function formatCurrency(amount) {
    if (!amount) return '—';
    return `$${Number(amount).toFixed(2)}`;
}

function toDate(ts) {
    if (!ts) return null;
    try { return ts.toDate ? ts.toDate() : new Date(ts); } catch { return null; }
}

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportMsg, setExportMsg] = useState('');

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        setLoading(true);
        setError('');
        try {
            const subs = await getAllSubscriptions();
            setSubscriptions(subs);
        } catch (err) {
            console.error('[AdminSubscriptions] Error:', err);
            setError('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (sub) => {
        if (!sub.id) return;
        setActionLoading(sub.id);
        setError('');
        setSuccess('');
        try {
            await cancelSubscription(sub.id);
            setSuccess(`Subscription ${sub.id.slice(0, 8)}... cancelled`);
            await loadSubscriptions();
        } catch (err) {
            setError('Failed to cancel subscription');
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const inDateRange = (s) => {
        if (!startDate || !endDate) return true;
        const d = toDate(s.createdAt || s.startedAt);
        if (!d) return true;
        return d >= startDate && d <= endDate;
    };

    const filtered = subscriptions.filter(s => {
        if (filter !== 'all' && s.status !== filter) return false;
        if (!inDateRange(s)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const searchStr = `${s.userId || ''} ${s.plan || ''} ${s.type || ''} ${s.id || ''}`.toLowerCase();
            if (!searchStr.includes(q)) return false;
        }
        return true;
    });

    const statusCounts = {};
    subscriptions.forEach(s => {
        const st = s.status || 'unknown';
        statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    const revenue = subscriptions
        .filter(s => s.amount && s.status === 'active')
        .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const activeCount = subscriptions.filter(s => s.status === 'active').length;

    const handleExport = () => {
        setExporting(true);
        setExportMsg('');
        try {
            const filename = exportSubscriptionsToExcel(filtered, {
                startDate,
                endDate,
                statusFilter: filter,
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
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{subscriptions.length}</div>
                    <div className="admin-stat-label">Total Subscriptions</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                <polyline points="17 6 23 6 23 12"/>
                            </svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{activeCount}</div>
                    <div className="admin-stat-label">Active</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">${revenue.toFixed(0)}</div>
                    <div className="admin-stat-label">Active Revenue</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                    </div>
                    <div className="admin-stat-value">{(revenue / (activeCount || 1)).toFixed(0)}</div>
                    <div className="admin-stat-label">Avg. Per Active</div>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: 8, marginBottom: 16, color: '#EF4444', fontSize: 14 }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: 8, marginBottom: 16, color: '#10B981', fontSize: 14 }}>
                    {success}
                </div>
            )}

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-title">
                        All Subscriptions ({filtered.length})
                        {subscriptions.length > 0 && filtered.length !== subscriptions.length && (
                            <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8, fontWeight: 400 }}>
                                filtered from {subscriptions.length}
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
                                placeholder="Search subs..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ padding: '6px 10px 6px 30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 140 }}
                            />
                        </div>
                        <div className="admin-table-filters">
                            <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({subscriptions.length})</button>
                            <button className={`admin-filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active ({statusCounts['active'] || 0})</button>
                            <button className={`admin-filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>Cancelled ({statusCounts['cancelled'] || 0})</button>
                            <button className={`admin-filter-btn ${filter === 'expired' ? 'active' : ''}`} onClick={() => setFilter('expired')}>Expired ({statusCounts['expired'] || 0})</button>
                        </div>
                    </div>
                </div>

                <div className="admin-toolbar">
                    <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
                    <button
                        className="admin-btn success admin-export-btn"
                        onClick={handleExport}
                        disabled={exporting || filtered.length === 0}
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
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading subscriptions...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Plan / Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Started</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No subscriptions found</td>
                                </tr>
                            ) : (
                                filtered.map(sub => {
                                    const st = STATUS_STYLES[sub.status] || { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' };
                                    return (
                                        <tr key={sub.id}>
                                            <td>
                                                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {sub.userId ? (
                                                        <>{sub.userId.slice(0, 12)}...<CopyButton text={sub.userId} label="Copy User ID" /></>
                                                    ) : 'N/A'}
                                                </div>
                                                {sub.id && (
                                                    <div style={{ fontSize: 10, color: '#4B5563', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        ID: {sub.id.slice(0, 8)}...<CopyButton text={sub.id} label="Copy Sub ID" />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                                                    {sub.plan || sub.type || 'Standard'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: '#34D399' }}>
                                                    {formatCurrency(sub.amount)}
                                                </span>
                                                {sub.interval && (
                                                    <span style={{ fontSize: 11, color: '#64748B', marginLeft: 4 }}>/ {sub.interval}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    background: st.bg,
                                                    color: st.color,
                                                    textTransform: 'capitalize',
                                                }}>
                                                    {sub.status || 'unknown'}
                                                </span>
                                            </td>
                                            <td style={{ color: '#64748B', fontSize: 13 }}>{formatDate(sub.createdAt || sub.startedAt)}</td>
                                            <td>
                                                <div className="admin-actions-cell">
                                                    <button
                                                        className="admin-action-btn ban"
                                                        onClick={() => handleCancel(sub)}
                                                        disabled={actionLoading === sub.id || sub.status === 'cancelled'}
                                                        title={sub.status === 'cancelled' ? 'Already cancelled' : 'Cancel subscription'}
                                                    >
                                                        {actionLoading === sub.id ? (
                                                            <div className="mini-spinner" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
