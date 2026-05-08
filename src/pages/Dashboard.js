import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import '../styles/main.css';
import '../styles/dashboard.css';

export default function Dashboard() {
    const { language } = useLanguage();
    const { userProfile, firebaseUser, logout } = useAuth();
    const navigate = useNavigate();

    const t = (ruText, enText) => language === 'ru' ? ruText : enText;

    if (!userProfile) return null;

    const avatarSrc = userProfile.photoURL || firebaseUser?.photoURL;
    const displayName = userProfile.fullName || firebaseUser?.displayName || 'User';
    const role = userProfile.role;

    return (
        <div className="dashboard-page">
            <Navbar />
            <Timer />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="user-greeting">
                        <div className="user-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" />
                            ) : (
                                <span>{displayName[0] || 'U'}</span>
                            )}
                        </div>
                        <div>
                            <h1>{t('Добро пожаловать,', 'Welcome,')} {displayName}!</h1>
                            <p className="user-role">
                                {role === 'student'
                                    ? t('Ученик', 'Student')
                                    : t('Учитель', 'Teacher')
                                }
                            </p>
                        </div>
                    </div>
                    <div className="dashboard-header-actions">
                        <button className="dashboard-btn secondary" onClick={() => navigate('/profile')}>
                            {t('Мой профиль', 'My Profile')}
                        </button>
                        <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
                            {t('Выйти', 'Log out')}
                        </button>
                    </div>
                </div>

                {role === 'student' && (
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

                        <div className="dashboard-card clickable" onClick={() => navigate('/profile')}>
                            <h2>{t('Мои цели', 'My Goals')}</h2>
                            <p className="empty-state">
                                {t('Перейдите в профиль, чтобы управлять целями', 'Go to profile to manage your goals')}
                            </p>
                        </div>

                        <div className="dashboard-card clickable" onClick={() => navigate('/profile')}>
                            <h2>{t('Активность', 'Activity')}</h2>
                            <p className="empty-state">
                                {t('Посмотрите свою активность в профиле', 'View your activity in profile')}
                            </p>
                        </div>
                    </div>
                )}

                {role === 'teacher' && (
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

                        <div className="dashboard-card clickable" onClick={() => navigate('/profile')}>
                            <h2>{t('Мои цели', 'My Goals')}</h2>
                            <p className="empty-state">
                                {t('Перейдите в профиль, чтобы управлять целями', 'Go to profile to manage your goals')}
                            </p>
                        </div>

                        <div className="dashboard-card clickable" onClick={() => navigate('/profile')}>
                            <h2>{t('Отзывы студентов', 'Student Reviews')}</h2>
                            <p className="empty-state">
                                {t('Посмотрите отзывы в вашем профиле', 'View reviews in your profile')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
