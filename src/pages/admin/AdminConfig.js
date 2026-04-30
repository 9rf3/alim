import { useState, useEffect } from 'react';

const CONFIG_KEY = 'adminPlatformConfig';

const defaultConfig = {
    platformName: 'Alim-lab',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: false,
    maxCoursePrice: 500,
    featuredTeachers: [],
    reviewModeration: true,
    autoApproveReviews: false,
    enableActivityTracking: true,
    enableGoals: true,
    enableHeatmap: true,
};

export default function AdminConfig() {
    const [config, setConfig] = useState(() => {
        const stored = localStorage.getItem(CONFIG_KEY);
        return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }, [config]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setConfig(defaultConfig);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
    };

    return (
        <div>
            {saved && (
                <div style={{ padding: '12px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, marginBottom: 24, color: '#34D399', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Settings saved successfully
                </div>
            )}

            <div className="config-section">
                <div className="config-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    General Settings
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Platform Name</div>
                        <div className="config-item-desc">Display name for the platform</div>
                    </div>
                    <input
                        value={config.platformName}
                        onChange={e => updateConfig('platformName', e.target.value)}
                        style={{ width: 200, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                    />
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Maintenance Mode</div>
                        <div className="config-item-desc">Take the platform offline for maintenance</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.maintenanceMode} onChange={e => updateConfig('maintenanceMode', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Allow Registrations</div>
                        <div className="config-item-desc">Enable new user sign-ups</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.allowRegistrations} onChange={e => updateConfig('allowRegistrations', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Email Verification</div>
                        <div className="config-item-desc">Require users to verify their email</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.requireEmailVerification} onChange={e => updateConfig('requireEmailVerification', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Max Course Price ($)</div>
                        <div className="config-item-desc">Maximum allowed price for courses</div>
                    </div>
                    <input
                        type="number"
                        value={config.maxCoursePrice}
                        onChange={e => updateConfig('maxCoursePrice', parseInt(e.target.value))}
                        style={{ width: 100, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', textAlign: 'right' }}
                    />
                </div>
            </div>

            <div className="config-section">
                <div className="config-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Content Moderation
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Review Moderation</div>
                        <div className="config-item-desc">Enable admin review approval system</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.reviewModeration} onChange={e => updateConfig('reviewModeration', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Auto-Approve Reviews</div>
                        <div className="config-item-desc">Automatically publish reviews without moderation</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.autoApproveReviews} onChange={e => updateConfig('autoApproveReviews', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="config-section">
                <div className="config-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Features
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Activity Tracking</div>
                        <div className="config-item-desc">Track user activity for heatmap</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.enableActivityTracking} onChange={e => updateConfig('enableActivityTracking', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Goals System</div>
                        <div className="config-item-desc">Enable user goal planning</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.enableGoals} onChange={e => updateConfig('enableGoals', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
                <div className="config-item">
                    <div className="config-item-info">
                        <div className="config-item-label">Activity Heatmap</div>
                        <div className="config-item-desc">Show GitHub-style activity graph</div>
                    </div>
                    <label className="admin-toggle">
                        <input type="checkbox" checked={config.enableHeatmap} onChange={e => updateConfig('enableHeatmap', e.target.checked)} />
                        <span className="admin-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="admin-btn secondary" onClick={handleReset}>Reset to Defaults</button>
                <button className="admin-btn primary" onClick={handleSave}>Save Settings</button>
            </div>
        </div>
    );
}
