import { useState } from 'react';

const PRESETS = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'All time', days: null },
];

export default function DateRangePicker({ startDate, endDate, onChange }) {
    const [preset, setPreset] = useState('custom');
    const [customStart, setCustomStart] = useState(
        startDate ? startDate.toISOString().slice(0, 10) : ''
    );
    const [customEnd, setCustomEnd] = useState(
        endDate ? endDate.toISOString().slice(0, 10) : ''
    );

    const handlePreset = (days) => {
        if (days === null) {
            setPreset('all');
            onChange(null, null);
            setCustomStart('');
            setCustomEnd('');
            return;
        }
        setPreset(String(days));
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);
        onChange(start, end);
        setCustomStart(start.toISOString().slice(0, 10));
        setCustomEnd(end.toISOString().slice(0, 10));
    };

    const handleCustom = () => {
        setPreset('custom');
        const s = customStart ? new Date(customStart + 'T00:00:00') : null;
        const e = customEnd ? new Date(customEnd + 'T23:59:59') : null;
        onChange(s, e);
    };

    return (
        <div className="date-range-picker">
            <div className="date-range-presets">
                {PRESETS.map(p => (
                    <button
                        key={p.label}
                        className={`date-range-preset-btn ${preset === (p.days === null ? 'all' : String(p.days)) ? 'active' : ''}`}
                        onClick={() => handlePreset(p.days)}
                    >
                        {p.label}
                    </button>
                ))}
                <button
                    className={`date-range-preset-btn ${preset === 'custom' ? 'active' : ''}`}
                    onClick={() => setPreset('custom')}
                >
                    Custom
                </button>
            </div>
            {preset === 'custom' && (
                <div className="date-range-custom">
                    <div className="date-range-field">
                        <label>From</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={e => setCustomStart(e.target.value)}
                            max={customEnd || undefined}
                        />
                    </div>
                    <div className="date-range-field">
                        <label>To</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={e => setCustomEnd(e.target.value)}
                            min={customStart || undefined}
                            max={new Date().toISOString().slice(0, 10)}
                        />
                    </div>
                    <button
                        className="admin-btn primary"
                        onClick={handleCustom}
                        style={{ padding: '8px 16px', fontSize: 12, alignSelf: 'flex-end' }}
                        disabled={!customStart || !customEnd}
                    >
                        Apply
                    </button>
                </div>
            )}
            {startDate && endDate && preset !== 'custom' && (
                <div className="date-range-active">
                    {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
                </div>
            )}
        </div>
    );
}
