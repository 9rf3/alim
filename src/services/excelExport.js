import * as XLSX from 'xlsx';

function toPlainDate(ts) {
    if (!ts) return '';
    try {
        if (ts.toDate) return ts.toDate();
        if (ts instanceof Date) return ts;
        if (typeof ts === 'number') return new Date(ts);
        return new Date(ts);
    } catch {
        return null;
    }
}

function formatDateCell(ts) {
    const d = toPlainDate(ts);
    if (!d || isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

function formatDateTimeCell(ts) {
    const d = toPlainDate(ts);
    if (!d || isNaN(d.getTime())) return '';
    return d.toISOString().replace('T', ' ').slice(0, 19);
}

function buildSheet(data, headers) {
    const wsData = [headers.map(h => h.label), ...data.map(row => headers.map(h => h.accessor(row)))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = headers.map(h => {
        const labelLen = h.label.length;
        const maxDataLen = data.reduce((max, row) => {
            const val = String(h.accessor(row) || '');
            return Math.max(max, val.length);
        }, 0);
        return { wch: Math.max(labelLen, maxDataLen, 12) };
    });
    ws['!cols'] = colWidths;

    return ws;
}

function buildWorkbook(sheets) {
    const wb = XLSX.utils.book_new();
    sheets.forEach(({ name, data, headers }) => {
        const ws = buildSheet(data, headers);
        XLSX.utils.book_append_sheet(wb, ws, name);
    });
    return wb;
}

function download(wb, filename) {
    XLSX.writeFile(wb, filename);
}

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function generateTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', '_');
}

function getDateRangeLabel(startDate, endDate) {
    if (!startDate && !endDate) return 'all';
    const s = startDate ? startDate.toISOString().slice(0, 10) : 'begin';
    const e = endDate ? endDate.toISOString().slice(0, 10) : 'now';
    return `${s}_to_${e}`;
}

export function exportLogsToExcel(logs, { startDate, endDate, actionFilter, searchQuery } = {}) {
    const rangeLabel = getDateRangeLabel(startDate, endDate);
    const actionLabel = actionFilter && actionFilter !== 'all' ? actionFilter : 'all-actions';
    const filename = sanitizeFilename(`logs-report-${actionLabel}-${rangeLabel}-${generateTimestamp()}.xlsx`);

    const headers = [
        { label: 'Timestamp', accessor: (l) => formatDateTimeCell(l.timestamp) },
        { label: 'Action', accessor: (l) => l.action || '' },
        { label: 'User ID', accessor: (l) => l.userId || '' },
        { label: 'Email', accessor: (l) => l.email || '' },
        { label: 'Provider', accessor: (l) => l.provider || '' },
        { label: 'Plan', accessor: (l) => l.plan || '' },
        { label: 'Amount', accessor: (l) => l.amount != null ? String(l.amount) : '' },
        { label: 'Metadata', accessor: (l) => l.metadata ? JSON.stringify(l.metadata) : '' },
    ];

    const wb = buildWorkbook([{ name: 'Logs', data: logs, headers }]);

    const summaryHeaders = [
        { label: 'Metric', accessor: (r) => r.metric },
        { label: 'Value', accessor: (r) => r.value },
    ];
    const totalLogs = logs.length;
    const actionCounts = {};
    logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1; });
    const summaryData = [
        { metric: 'Total Events', value: totalLogs },
        { metric: 'Unique Users', value: new Set(logs.map(l => l.userId).filter(Boolean)).size },
        { metric: 'Date Range', value: rangeLabel },
        ...Object.entries(actionCounts).sort().map(([action, count]) => ({ metric: `Action: ${action}`, value: count })),
    ];
    const summaryWs = buildSheet(summaryData, summaryHeaders);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    download(wb, filename);
    return filename;
}

export function exportSubscriptionsToExcel(subscriptions, { startDate, endDate, statusFilter, searchQuery } = {}) {
    const rangeLabel = getDateRangeLabel(startDate, endDate);
    const statusLabel = statusFilter && statusFilter !== 'all' ? statusFilter : 'all-statuses';
    const filename = sanitizeFilename(`subscriptions-${statusLabel}-${rangeLabel}-${generateTimestamp()}.xlsx`);

    const headers = [
        { label: 'Subscription ID', accessor: (s) => s.id || '' },
        { label: 'User ID', accessor: (s) => s.userId || '' },
        { label: 'Plan / Type', accessor: (s) => s.plan || s.type || 'Standard' },
        { label: 'Amount', accessor: (s) => s.amount != null ? `$${Number(s.amount).toFixed(2)}` : '' },
        { label: 'Interval', accessor: (s) => s.interval || '' },
        { label: 'Status', accessor: (s) => s.status || 'unknown' },
        { label: 'Start Date', accessor: (s) => formatDateCell(s.createdAt || s.startedAt) },
        { label: 'End Date', accessor: (s) => formatDateCell(s.endedAt || s.cancelledAt) },
    ];

    const wb = buildWorkbook([{ name: 'Subscriptions', data: subscriptions, headers }]);

    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const totalRevenue = activeSubs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const summaryHeaders = [
        { label: 'Metric', accessor: (r) => r.metric },
        { label: 'Value', accessor: (r) => r.value },
    ];
    const statusCounts = {};
    subscriptions.forEach(s => { const st = s.status || 'unknown'; statusCounts[st] = (statusCounts[st] || 0) + 1; });
    const summaryData = [
        { metric: 'Total Subscriptions', value: subscriptions.length },
        { metric: 'Active Subscriptions', value: activeSubs.length },
        { metric: 'Active Revenue (Monthly)', value: `$${totalRevenue.toFixed(2)}` },
        { metric: 'Avg. Revenue Per Active', value: `$${(totalRevenue / (activeSubs.length || 1)).toFixed(2)}` },
        ...Object.entries(statusCounts).map(([status, count]) => ({ metric: `Status: ${status}`, value: count })),
    ];
    const summaryWs = buildSheet(summaryData, summaryHeaders);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    download(wb, filename);
    return filename;
}

export function exportAnalyticsToExcel(analytics, metrics) {
    const filename = sanitizeFilename(`analytics-report-${generateTimestamp()}.xlsx`);
    const wb = XLSX.utils.book_new();

    if (metrics.registrationsByDay && analytics.registrationsByDay?.length) {
        const headers = [
            { label: 'Date', accessor: (r) => r[0] },
            { label: 'Registrations', accessor: (r) => r[1] },
        ];
        const ws = buildSheet(analytics.registrationsByDay, headers);
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    }

    if (metrics.logsByDay && analytics.logsByDay?.length) {
        const headers = [
            { label: 'Date', accessor: (r) => r[0] },
            { label: 'Events', accessor: (r) => r[1] },
        ];
        const ws = buildSheet(analytics.logsByDay, headers);
        XLSX.utils.book_append_sheet(wb, ws, 'Activity');
    }

    if (metrics.logActions && analytics.logActions) {
        const data = Object.entries(analytics.logActions).sort((a, b) => b[1] - a[1]);
        const headers = [
            { label: 'Action', accessor: (r) => r[0] },
            { label: 'Count', accessor: (r) => r[1] },
        ];
        const ws = buildSheet(data, headers);
        XLSX.utils.book_append_sheet(wb, ws, 'Actions');
    }

    if (metrics.subscriptionsByPlan && analytics.subscriptionsByPlan) {
        const data = Object.entries(analytics.subscriptionsByPlan);
        const headers = [
            { label: 'Plan', accessor: (r) => r[0] },
            { label: 'Count', accessor: (r) => r[1] },
        ];
        const ws = buildSheet(data, headers);
        XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
    }

    if (metrics.userRoleDistribution && analytics.userRoleDistribution) {
        const data = Object.entries(analytics.userRoleDistribution).filter(([_, v]) => v > 0);
        const headers = [
            { label: 'Role', accessor: (r) => r[0] },
            { label: 'Count', accessor: (r) => r[1] },
        ];
        const ws = buildSheet(data, headers);
        XLSX.utils.book_append_sheet(wb, ws, 'User Roles');
    }

    const overviewHeaders = [
        { label: 'Metric', accessor: (r) => r.metric },
        { label: 'Value', accessor: (r) => r.value },
    ];
    const overviewData = [
        { metric: 'Total Users', value: analytics.totalUsers },
        { metric: 'Active This Week', value: analytics.activeUsers },
        { metric: 'New This Month', value: analytics.newUsersThisMonth },
        { metric: 'Total Events', value: analytics.totalLogs },
        { metric: 'Total Subscriptions', value: analytics.totalSubscriptions },
    ];
    const overviewWs = buildSheet(overviewData, overviewHeaders);
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview');

    download(wb, filename);
    return filename;
}
