import { useState, useEffect } from 'react';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const stored = localStorage.getItem('teacherReviews');
        if (stored) {
            setReviews(JSON.parse(stored));
        } else {
            const sampleReviews = [
                { id: 1, author: 'Alex M.', avatar: 'A', rating: 5, text: 'Excellent teacher! The explanations were clear and the course material was very well structured. Highly recommended.', date: '2026-04-15' },
                { id: 2, author: 'Sarah K.', avatar: 'S', rating: 4, text: 'Great content and very helpful. Would love to see more advanced topics covered in future courses.', date: '2026-04-10' },
                { id: 3, author: 'David L.', avatar: 'D', rating: 5, text: 'One of the best courses I have taken. The teacher is very knowledgeable and patient.', date: '2026-03-28' },
                { id: 4, author: 'Emma W.', avatar: 'E', rating: 2, text: 'Not what I expected. The content was outdated and the teacher was not responsive.', date: '2026-04-20' },
            ];
            setReviews(sampleReviews);
            localStorage.setItem('teacherReviews', JSON.stringify(sampleReviews));
        }
    }, []);

    const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.rating <= 2);

    const handleDelete = (id) => {
        const updated = reviews.filter(r => r.id !== id);
        setReviews(updated);
        localStorage.setItem('teacherReviews', JSON.stringify(updated));
    };

    const handleEditRating = (id, newRating) => {
        const updated = reviews.map(r => r.id === id ? { ...r, rating: newRating } : r);
        setReviews(updated);
        localStorage.setItem('teacherReviews', JSON.stringify(updated));
    };

    return (
        <div>
            <div className="admin-table-container" style={{ marginBottom: 24 }}>
                <div className="admin-table-header">
                    <div className="admin-table-title">Reviews Overview</div>
                    <div className="admin-table-filters">
                        <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({reviews.length})</button>
                        <button className={`admin-filter-btn ${filter === 'flagged' ? 'active' : ''}`} onClick={() => setFilter('flagged')}>
                            Flagged ({reviews.filter(r => r.rating <= 2).length})
                        </button>
                    </div>
                </div>
            </div>

            {filteredReviews.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">💬</div>
                    <div className="admin-empty-text">No reviews to display</div>
                    <div className="admin-empty-subtext">Reviews will appear here when users submit them</div>
                </div>
            ) : (
                filteredReviews.map(review => (
                    <div key={review.id} className="review-moderation-item">
                        <div className="review-moderation-header">
                            <div className="review-moderation-user">
                                <div className="review-moderation-avatar">{review.avatar}</div>
                                <div className="review-moderation-info">
                                    <div className="review-moderation-name">{review.author}</div>
                                    <div className="review-moderation-date">{review.date}</div>
                                </div>
                            </div>
                            <div className="review-moderation-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <svg key={star} viewBox="0 0 24 24" fill={star <= review.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ color: star <= review.rating ? '#FBBF24' : '#4B5563', width: 18, height: 18, cursor: 'pointer' }} onClick={() => handleEditRating(review.id, star)}>
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="review-moderation-text">{review.text}</p>
                        <div className="review-moderation-actions">
                            {review.rating <= 2 && <span style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', borderRadius: 6, fontSize: 12, color: '#FCA5A5' }}>⚠️ Flagged</span>}
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                <button className="admin-btn secondary" onClick={() => handleEditRating(review.id, review.rating === 5 ? 1 : 5)} style={{ padding: '6px 12px', fontSize: 12 }}>
                                    Toggle Rating
                                </button>
                                <button className="admin-btn danger" onClick={() => handleDelete(review.id)} style={{ padding: '6px 12px', fontSize: 12 }}>
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
