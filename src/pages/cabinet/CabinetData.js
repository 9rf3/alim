import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetData() {
    const { language } = useLanguage();
    const { userProfile } = useAuth();
    const t = (ru, en) => language === 'ru' ? ru : en;

    const stats = [
        { label: t('Всего уроков', 'Total Lessons'), value: '0' },
        { label: t('Часы обучения', 'Study Hours'), value: '0' },
        { label: t('Завершённые курсы', 'Completed Courses'), value: '0' },
        { label: t('Средний балл', 'Average Score'), value: '—' },
        { label: t('Дней подряд', 'Day Streak'), value: '0' },
        { label: t('Сертификаты', 'Certificates'), value: '0' },
    ];

    const subjects = [
        { name: t('Химия', 'Chemistry'), progress: 0, color: '#3B82F6' },
        { name: t('Физика', 'Physics'), progress: 0, color: '#8B5CF6' },
        { name: t('Математика', 'Mathematics'), progress: 0, color: '#10B981' },
    ];

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Мои данные', 'My Data')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Полная аналитика вашего обучения', 'Complete analytics of your learning')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="cabinet-grid cabinet-grid-3" style={{ marginBottom: '32px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="cabinet-stat-card">
                        <div className="cabinet-stat-label">{stat.label}</div>
                        <div className="cabinet-stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="cabinet-grid cabinet-grid-2" style={{ marginBottom: '32px' }}>
                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {t('Прогресс по предметам', 'Subject Progress')}
                    </h3>
                    {subjects.map((subject, idx) => (
                        <div key={idx} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{subject.name}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: subject.color }}>{subject.progress}%</span>
                            </div>
                            <div className="cabinet-progress-bar">
                                <div className="cabinet-progress-fill" style={{ width: `${subject.progress}%`, background: subject.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cabinet-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {t('Активность', 'Activity')}
                    </h3>
                    <div style={{
                        height: '200px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '14px',
                    }}>
                        {t('График активности появится здесь', 'Activity chart will appear here')}
                    </div>
                </div>
            </div>

            <div className="cabinet-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('Информация о профиле', 'Profile Information')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Имя', 'Name')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{userProfile?.fullName || '—'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Email', 'Email')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{userProfile?.email || '—'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Роль', 'Role')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                            {userProfile?.role === 'student' ? t('Ученик', 'Student') : t('Учитель', 'Teacher')}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('Подписка', 'Subscription')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{t('Бесплатный', 'Free')}</div>
                    </div>
                </div>
            </div>
        </CabinetLayout>
    );
}
