import '../../styles/dashboard/cards.css';

export default function StatCard({ icon, label, value, trend, color = 'blue' }) {
    return (
        <div className={`dash-stat-card dash-stat-${color}`}>
            <div className="dash-stat-glow"></div>
            <div className="dash-stat-icon">
                {icon}
            </div>
            <div className="dash-stat-content">
                <span className="dash-stat-label">{label}</span>
                <span className="dash-stat-value">{value}</span>
                {trend && <span className="dash-stat-trend">{trend}</span>}
            </div>
            <div className="dash-stat-shine"></div>
        </div>
    );
}
