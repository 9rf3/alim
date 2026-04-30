import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const REVIEWS_KEY = 'teacherReviews';

const sampleReviews = [
    {
        id: 1,
        author: 'Alex M.',
        avatar: 'A',
        rating: 5,
        text: 'Excellent teacher! The explanations were clear and the course material was very well structured. Highly recommended.',
        date: '2026-04-15',
    },
    {
        id: 2,
        author: 'Sarah K.',
        avatar: 'S',
        rating: 4,
        text: 'Great content and very helpful. Would love to see more advanced topics covered in future courses.',
        date: '2026-04-10',
    },
    {
        id: 3,
        author: 'David L.',
        avatar: 'D',
        rating: 5,
        text: 'One of the best courses I have taken. The teacher is very knowledgeable and patient.',
        date: '2026-03-28',
    },
];

export default function ReviewsSection() {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(0);
    const [newText, setNewText] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem(REVIEWS_KEY);
        if (stored) {
            setReviews(JSON.parse(stored));
        } else {
            setReviews(sampleReviews);
            localStorage.setItem(REVIEWS_KEY, JSON.stringify(sampleReviews));
        }
    }, []);

    const handleSubmit = () => {
        if (newRating === 0 || !newText.trim()) return;

        const review = {
            id: Date.now(),
            author: user?.displayName || 'Anonymous',
            avatar: user?.displayName?.[0] || 'A',
            rating: newRating,
            text: newText.trim(),
            date: new Date().toISOString().split('T')[0],
        };

        const updated = [review, ...reviews];
        setReviews(updated);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
        setNewRating(0);
        setNewText('');
    };

    const average = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const breakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
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
                    {t('Отзывы и рейтинг', 'Reviews & Rating')}
                </div>
                <div className="profile-section-subtitle">
                    {t('Мнения студентов о преподавателе', 'Student opinions about the teacher')}
                </div>

                <div className="reviews-summary">
                    <div className="reviews-average">
                        <div className="reviews-score">{average}</div>
                        <div className="reviews-count">{reviews.length} {t('отзывов', 'reviews')}</div>
                        <div className="reviews-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg
                                    key={star}
                                    className={`star ${star <= Math.round(parseFloat(average)) ? '' : 'empty'}`}
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
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

                {user && user.role === 'student' && (
                    <div className="review-form">
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
                            disabled={newRating === 0 || !newText.trim()}
                        >
                            {t('Отправить отзыв', 'Submit Review')}
                        </button>
                    </div>
                )}

                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <div className="reviews-empty">
                            <div className="icon">💬</div>
                            <p>{t('Пока нет отзывов. Будьте первым!', 'No reviews yet. Be the first!')}</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="review-item">
                                <div className="review-header">
                                    <div className="review-author">
                                        <div className="review-avatar">{review.avatar}</div>
                                        <div className="review-author-info">
                                            <span className="review-author-name">{review.author}</span>
                                            <span className="review-date">{review.date}</span>
                                        </div>
                                    </div>
                                    <div className="review-rating">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <svg
                                                key={star}
                                                className={`star ${star <= review.rating ? '' : 'empty'}`}
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="review-text">{review.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
