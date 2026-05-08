import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { createReview, getReviewsByTeacher } from '../../services/firestore';

export default function ReviewsSection() {
    const { language } = useLanguage();
    const { userProfile, firebaseUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(0);
    const [newText, setNewText] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const uid = userProfile?.uid || firebaseUser?.uid;

    useEffect(() => {
        if (!uid) return;
        setLoading(true);
        getReviewsByTeacher(uid).then(data => {
            setReviews(data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [uid]);

    const handleSubmit = async () => {
        if (newRating === 0 || !newText.trim() || !uid) return;
        setSubmitting(true);
        try {
            await createReview(uid, {
                reviewerId: uid,
                reviewerName: userProfile?.fullName || 'Anonymous',
                rating: newRating,
                comment: newText.trim(),
            });
            const updated = await getReviewsByTeacher(uid);
            setReviews(updated || []);
            setNewRating(0);
            setNewText('');
        } catch (e) {
            console.error('Failed to submit review:', e);
        } finally {
            setSubmitting(false);
        }
    };

    const average = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

    const breakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => (r.rating || 0) === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => (r.rating || 0) === star).length / reviews.length) * 100
            : 0,
    }));

    const t = (ru, en) => language === 'ru' ? ru : en;

    return (
        <div>
            <div className="profile-section">
                <div className="profile-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    {t('Отзывы', 'Reviews')}
                </div>

                {loading ? (
                    <div className="profile-section-subtitle">{t('Загрузка...', 'Loading...')}</div>
                ) : reviews.length === 0 ? (
                    <div className="reviews-empty" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>💬</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {t('Отзывов пока нет', 'No reviews yet')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="reviews-summary">
                            <div className="reviews-average">
                                <div className="reviews-score">{average}</div>
                                <div className="reviews-count">{reviews.length} {t('отзывов', 'reviews')}</div>
                                <div className="reviews-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg
                                            key={star}
                                            className={`star ${star <= Math.round(parseFloat(average || '0')) ? '' : 'empty'}`}
                                            viewBox="0 0 24 24" fill="currentColor"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                    ))}
                                </div>
                            </div>

                            <div className="reviews-breakdown">
                                {breakdown.map(({ star, count, percentage }) => (
                                    <div key={star} className="review-bar-row">
                                        <span className="review-bar-label">{star}</span>
                                        <div className="review-bar-track">
                                            <div className="review-bar-fill" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <span className="review-bar-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="reviews-list" style={{ marginTop: '24px' }}>
                            {reviews.map(review => (
                                <div key={review.id} className="review-item">
                                    <div className="review-header">
                                        <div className="review-author">
                                            <div className="review-avatar">
                                                {review.reviewerName?.[0] || '?'}
                                            </div>
                                            <div className="review-author-info">
                                                <span className="review-author-name">{review.reviewerName || t('Аноним', 'Anonymous')}</span>
                                                <span className="review-date">
                                                    {review.createdAt?.toDate
                                                        ? review.createdAt.toDate().toLocaleDateString()
                                                        : review.createdAt
                                                            ? new Date(review.createdAt).toLocaleDateString()
                                                            : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="review-rating">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg
                                                    key={star}
                                                    className={`star ${star <= (review.rating || 0) ? '' : 'empty'}`}
                                                    viewBox="0 0 24 24" fill="currentColor"
                                                >
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="review-text">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {userProfile?.role === 'student' && (
                    <div className="review-form" style={{ marginTop: '24px' }}>
                        <div className="review-form-title">
                            {t('Оставить отзыв', 'Leave a Review')}
                        </div>
                        <div className="rating-selector">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    className={`rating-star-btn ${(hoverRating || newRating) >= star ? 'active' : ''}`}
                                    onClick={() => setNewRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="review-textarea"
                            placeholder={t('Поделитесь своим опытом...', 'Share your experience...')}
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        />
                        <button
                            className="review-submit-btn"
                            onClick={handleSubmit}
                            disabled={newRating === 0 || !newText.trim() || submitting}
                        >
                            {submitting ? t('Отправка...', 'Sending...') : t('Отправить отзыв', 'Submit Review')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}