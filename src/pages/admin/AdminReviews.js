import { useState, useEffect } from 'react';
import { getAllReviews, deleteDocument } from '../../services/firestore';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        setError('');
        try {
            const all = await getAllReviews();
            setReviews(all);
        } catch (err) {
            console.error('[AdminReviews] Error loading:', err);
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (review) => {
        setError('');
        setSuccess('');
        try {
            await deleteDocument('reviews', review.id);
            setSuccess('Review deleted');
            await loadReviews();
        } catch (err) {
            console.error('[AdminReviews] Delete error:', err);
            setError('Failed to delete review');
        } finally {
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const filteredReviews = filter === 'flagged' ? reviews.filter(r => r.rating <= 2) : reviews;

    const formatDate = (ts) => {
        if (!ts) return 'N/A';
        try {
            const date = ts.toDate ? ts.toDate() : new Date(ts);
            return date.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    return (
        <div>
            {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: '8px', marginBottom: '16px', color: '#EF4444', fontSize: '14px' }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: '8px', marginBottom: '16px', color: '#10B981', fontSize: '14px' }}>
                    {success}
                </div>
            )}

            <div className="admin-table-container" style={{ marginBottom: 24 }}>
                <div className="admin-table-header">
                    <div className="admin-table-title">Reviews ({filteredReviews.length})</div>
                    <div className="admin-table-filters">
                        <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({reviews.length})</button>
                        <button className={`admin-filter-btn ${filter === 'flagged' ? 'active' : ''}`} onClick={() => setFilter('flagged')}>
                            Flagged ({reviews.filter(r => r.rating <= 2).length})
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reviews...</div>
            ) : filteredReviews.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">💬</div>
                    <div className="admin-empty-text">No reviews to display</div>
                    <div className="admin-empty-subtext">Reviews will appear here when users submit them</div>
                </div>
            ) : (
                filteredReviews.map(review => (
                    <div key={review.id} className="review-moderation-item" style={{
                        padding: '16px',
                        marginBottom: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                    }}>
                        <div className="review-moderation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div className="review-moderation-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="review-moderation-avatar" style={{
                                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px',
                                }}>
                                    {(review.studentName || review.userName || 'U')[0].toUpperCase()}
                                </div>
                                <div className="review-moderation-info">
                                    <div className="review-moderation-name" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {review.studentName || review.userName || 'Anonymous'}
                                    </div>
                                    <div className="review-moderation-date" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <svg key={star} viewBox="0 0 24 24" fill={star <= review.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ color: star <= review.rating ? '#FBBF24' : '#4B5563', width: 18, height: 18 }}>
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: '1.5' }}>
                            {review.comment || review.text || 'No comment'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {review.rating <= 2 && (
                                <span style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', borderRadius: 6, fontSize: 12, color: '#FCA5A5' }}>⚠️ Flagged</span>
                            )}
                            <div style={{ marginLeft: 'auto' }}>
                                <button
                                    className="admin-btn danger"
                                    onClick={() => handleDelete(review)}
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
