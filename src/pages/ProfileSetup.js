import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';
import '../styles/profile-setup.css';

const subjects = [
    { id: 'math', ru: 'Математика', en: 'Mathematics' },
    { id: 'physics', ru: 'Физика', en: 'Physics' },
    { id: 'chemistry', ru: 'Химия', en: 'Chemistry' },
    { id: 'biology', ru: 'Биология', en: 'Biology' },
    { id: 'english', ru: 'Английский', en: 'English' },
    { id: 'history', ru: 'История', en: 'History' },
    { id: 'programming', ru: 'Программирование', en: 'Programming' },
    { id: 'art', ru: 'Искусство', en: 'Art' },
];

const skillLevels = [
    { id: 'beginner', ru: 'Начинающий', en: 'Beginner' },
    { id: 'intermediate', ru: 'Средний', en: 'Intermediate' },
    { id: 'advanced', ru: 'Продвинутый', en: 'Advanced' },
    { id: 'expert', ru: 'Эксперт', en: 'Expert' },
];

export default function ProfileSetup() {
    const { language } = useLanguage();
    const { firebaseUser, userProfile, completeOnboarding, loading } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [role, setRole] = useState(userProfile?.role || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: userProfile?.fullName || firebaseUser?.displayName || '',
        age: userProfile?.age || '',
        subjectsToStudy: userProfile?.subjectsToStudy || [],
        learningGoalMonth: userProfile?.learningGoalMonth || '',
        learningGoalYear: userProfile?.learningGoalYear || '',
        skillLevel: userProfile?.skillLevel || '',
        interests: userProfile?.interests || [],
        subjectsToTeach: userProfile?.subjectsToTeach || [],
        teachingCategories: userProfile?.teachingCategories || [],
        coursePrice: userProfile?.coursePrice || '',
        experience: userProfile?.experience || '',
        bio: userProfile?.bio || '',
        teachingGoalsMonth: userProfile?.teachingGoalsMonth || '',
        teachingGoalsYear: userProfile?.teachingGoalsYear || '',
        availability: userProfile?.availability || '',
    });

    useEffect(() => {
        if (!loading && !firebaseUser) {
            navigate('/signin');
        }
    }, [firebaseUser, loading, navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSubject = (subjectId, type) => {
        const field = type === 'study' ? 'subjectsToStudy' : 'subjectsToTeach';
        setFormData(prev => {
            const arr = [...prev[field]];
            const idx = arr.indexOf(subjectId);
            if (idx > -1) {
                arr.splice(idx, 1);
            } else {
                arr.push(subjectId);
            }
            return { ...prev, [field]: arr };
        });
    };

    const handleSubmit = async () => {
        setError('');
        setSaving(true);

        try {
            const profileData = {
                role,
                fullName: formData.fullName,
                age: formData.age ? parseInt(formData.age) : null,
                subjects: role === 'student' ? formData.subjectsToStudy : formData.subjectsToTeach,
            };

            if (role === 'student') {
                profileData.subjectsToStudy = formData.subjectsToStudy;
                profileData.learningGoalMonth = formData.learningGoalMonth;
                profileData.learningGoalYear = formData.learningGoalYear;
                profileData.skillLevel = formData.skillLevel;
                profileData.interests = formData.interests;
            }

            if (role === 'teacher') {
                profileData.subjectsToTeach = formData.subjectsToTeach;
                profileData.experience = formData.experience;
                profileData.bio = formData.bio;
                profileData.coursePrice = formData.coursePrice;
                profileData.teachingGoalsMonth = formData.teachingGoalsMonth;
                profileData.teachingGoalsYear = formData.teachingGoalsYear;
                profileData.availability = formData.availability;
            }

            await completeOnboarding(profileData);
            navigate(role === 'teacher' ? '/teacher' : '/cabinet');
        } catch (err) {
            console.error('Profile save error:', err);
            setError(language === 'ru' ? 'Ошибка сохранения профиля. Попробуйте снова.' : 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const t = (ruText, enText) => language === 'ru' ? ruText : enText;

    if (loading) {
        return (
            <div className="profile-setup-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-setup-page">
            <div className="bg-particles" id="particles"></div>
            <div className="glow-orb glow-orb-1"></div>
            <div className="glow-orb glow-orb-2"></div>

            <div className="setup-card">
                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="setup-step">
                        <h1 className="setup-title">{t('Выберите роль', 'Choose your role')}</h1>
                        <p className="setup-subtitle">
                            {t('Это поможет нам настроить платформу под ваши нужды', 'This helps us customize the platform for your needs')}
                        </p>

                        <div className="role-cards">
                            <div
                                className={`role-card ${role === 'student' ? 'selected' : ''}`}
                                onClick={() => setRole('student')}
                            >
                                <div className="role-icon student-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                    </svg>
                                </div>
                                <h3>{t('Ученик', 'Student')}</h3>
                                <p>{t('Я хочу изучать предметы и проходить курсы', 'I want to study subjects and take courses')}</p>
                            </div>

                            <div
                                className={`role-card ${role === 'teacher' ? 'selected' : ''}`}
                                onClick={() => setRole('teacher')}
                            >
                                <div className="role-icon teacher-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <h3>{t('Учитель', 'Teacher')}</h3>
                                <p>{t('Я хочу преподавать и продавать курсы', 'I want to teach and sell courses')}</p>
                            </div>
                        </div>

                        <button
                            className="setup-btn primary-btn"
                            disabled={!role}
                            onClick={() => setStep(2)}
                        >
                            {t('Продолжить', 'Continue')}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="setup-step">
                        <h1 className="setup-title">{t('Основная информация', 'Basic Information')}</h1>

                        <div className="form-group">
                            <label>{t('Полное имя', 'Full Name')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder={t('Введите ваше имя', 'Enter your name')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('Возраст', 'Age')}</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.age}
                                onChange={(e) => handleInputChange('age', e.target.value)}
                                placeholder={t('Введите ваш возраст', 'Enter your age')}
                                min="13"
                                max="120"
                            />
                        </div>

                        {role === 'student' && (
                            <>
                                <div className="form-group">
                                    <label>{t('Что вы хотите изучать?', 'What do you want to study?')}</label>
                                    <div className="subject-grid">
                                        {subjects.map(subj => (
                                            <div
                                                key={subj.id}
                                                className={`subject-chip ${formData.subjectsToStudy.includes(subj.id) ? 'selected' : ''}`}
                                                onClick={() => toggleSubject(subj.id, 'study')}
                                            >
                                                {language === 'ru' ? subj.ru : subj.en}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{t('Ваш уровень', 'Your skill level')}</label>
                                    <div className="level-cards">
                                        {skillLevels.map(level => (
                                            <div
                                                key={level.id}
                                                className={`level-card ${formData.skillLevel === level.id ? 'selected' : ''}`}
                                                onClick={() => handleInputChange('skillLevel', level.id)}
                                            >
                                                {language === 'ru' ? level.ru : level.en}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {role === 'teacher' && (
                            <>
                                <div className="form-group">
                                    <label>{t('Что вы преподаете?', 'What do you teach?')}</label>
                                    <div className="subject-grid">
                                        {subjects.map(subj => (
                                            <div
                                                key={subj.id}
                                                className={`subject-chip ${formData.subjectsToTeach.includes(subj.id) ? 'selected' : ''}`}
                                                onClick={() => toggleSubject(subj.id, 'teach')}
                                            >
                                                {language === 'ru' ? subj.ru : subj.en}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{t('Опыт преподавания', 'Teaching experience')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange('experience', e.target.value)}
                                        placeholder={t('Например: 5 лет', 'e.g.: 5 years')}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('Краткая биография', 'Short bio')}</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        placeholder={t('Расскажите о себе и своем опыте...', 'Tell us about yourself and your experience...')}
                                        rows="4"
                                    />
                                </div>
                            </>
                        )}

                        <div className="button-row">
                            <button className="setup-btn secondary-btn" onClick={() => setStep(1)}>
                                {t('Назад', 'Back')}
                            </button>
                            <button className="setup-btn primary-btn" onClick={() => setStep(3)}>
                                {t('Продолжить', 'Continue')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="setup-step">
                        <h1 className="setup-title">{t('Цели и планы', 'Goals & Plans')}</h1>

                        {role === 'student' && (
                            <>
                                <div className="form-group">
                                    <label>{t('Цели на месяц', 'Goals for this month')}</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.learningGoalMonth}
                                        onChange={(e) => handleInputChange('learningGoalMonth', e.target.value)}
                                        placeholder={t('Что вы хотите достичь в этом месяце?', 'What do you want to achieve this month?')}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('Цели на год', 'Goals for this year')}</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.learningGoalYear}
                                        onChange={(e) => handleInputChange('learningGoalYear', e.target.value)}
                                        placeholder={t('Каких результатов вы хотите достичь за год?', 'What results do you want to achieve this year?')}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('Интересы', 'Interests')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.interests}
                                        onChange={(e) => handleInputChange('interests', e.target.value)}
                                        placeholder={t('Ваши интересы через запятую', 'Your interests, comma separated')}
                                    />
                                </div>
                            </>
                        )}

                        {role === 'teacher' && (
                            <>
                                <div className="form-group">
                                    <label>{t('Стоимость курсов', 'Course pricing')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.coursePrice}
                                        onChange={(e) => handleInputChange('coursePrice', e.target.value)}
                                        placeholder={t('Например: от 2000₽ за курс', 'e.g.: from $20 per course')}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('Цели на месяц', 'Goals for this month')}</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.teachingGoalsMonth}
                                        onChange={(e) => handleInputChange('teachingGoalsMonth', e.target.value)}
                                        placeholder={t('Что вы планируете достичь в этом месяце?', 'What do you plan to achieve this month?')}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('Цели на год', 'Goals for this year')}</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.teachingGoalsYear}
                                        onChange={(e) => handleInputChange('teachingGoalsYear', e.target.value)}
                                        placeholder={t('Каких результатов вы хотите достичь за год?', 'What results do you want to achieve this year?')}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('График доступности', 'Availability')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.availability}
                                        onChange={(e) => handleInputChange('availability', e.target.value)}
                                        placeholder={t('Например: Пн-Пт, 18:00-21:00', 'e.g.: Mon-Fri, 6PM-9PM')}
                                    />
                                </div>
                            </>
                        )}

                        <div className="button-row">
                            <button className="setup-btn secondary-btn" onClick={() => setStep(2)}>
                                {t('Назад', 'Back')}
                            </button>
                            <button
                                className="setup-btn primary-btn"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? t('Сохранение...', 'Saving...') : t('Завершить', 'Complete Setup')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
