import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';
import '../styles/dashboard.css';

export default function Dashboard() {
    const { language } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/signin');
        } else if (!user.profileComplete) {
            navigate('/profile-setup');
        }
    }, [user, navigate]);

    const t = (ruText, enText) => language === 'ru' ? ruText : enText;

    if (!user) return null;

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="user-greeting">
                        <div className="user-avatar">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" />
                            ) : (
                                <span>{user.displayName?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div>
                            <h1>{t('Добро пожаловать,', 'Welcome,')} {user.displayName}!</h1>
                            <p className="user-role">
                                {user.role === 'student' 
                                    ? t('Ученик', 'Student')
                                    : t('Учитель', 'Teacher')
                                }
                            </p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
                        {t('Выйти', 'Log out')}
                    </button>
                </div>

                {/* Content based on role */}
                {user.role === 'student' && (
                    <div className="dashboard-content">
                        <div className="dashboard-card">
                            <h2>{t('Мои курсы', 'My Courses')}</h2>
                            <p className="empty-state">
                                {t('У вас пока нет курсов. Начните изучение уже сегодня!', 'You have no courses yet. Start learning today!')}
                            </p>
                            <button className="dashboard-btn primary">
                                {t('Найти курсы', 'Find Courses')}
                            </button>
                        </div>

                        <div className="dashboard-card">
                            <h2>{t('Рекомендации', 'Recommendations')}</h2>
                            <p className="empty-state">
                                {t('Курсы будут появляться здесь на основе ваших интересов', 'Courses will appear here based on your interests')}
                            </p>
                        </div>
                    </div>
                )}

                {user.role === 'teacher' && (
                    <div className="dashboard-content">
                        <div className="dashboard-card">
                            <h2>{t('Мои курсы', 'My Courses')}</h2>
                            <p className="empty-state">
                                {t('Вы еще не создали курсы. Создайте свой первый курс!', 'You haven\'t created any courses yet. Create your first course!')}
                            </p>
                            <button className="dashboard-btn primary">
                                {t('Создать курс', 'Create Course')}
                            </button>
                        </div>

                        <div className="dashboard-card">
                            <h2>{t('Статистика', 'Statistics')}</h2>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-number">0</span>
                                    <span className="stat-label">{t('Студентов', 'Students')}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">0</span>
                                    <span className="stat-label">{t('Курсов', 'Courses')}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">0</span>
                                    <span className="stat-label">{t('Отзывов', 'Reviews')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
