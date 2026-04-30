import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import SubjectSelector from './SubjectSelector';
import { subjects } from '../../data/subjects';

export default function EditProfileModal({ onClose }) {
    const { language } = useLanguage();
    const { user, updateUser } = useAuth();

    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');

    const [formData, setFormData] = useState({
        fullName: user?.displayName || '',
        age: profile.age || '',
        bio: profile.bio || '',
        subjects: user?.role === 'teacher'
            ? (profile.subjectsToTeach || [])
            : (profile.subjectsToStudy || []),
        experience: profile.experience || '',
        coursePrice: profile.coursePrice || '',
        availability: profile.availability || '',
        learningGoalMonth: profile.learningGoalMonth || '',
        learningGoalYear: profile.learningGoalYear || '',
        teachingGoalsMonth: profile.teachingGoalsMonth || '',
        teachingGoalsYear: profile.teachingGoalsYear || '',
    });

    const handleSave = () => {
        const updatedProfile = {
            ...profile,
            ...formData,
            profileComplete: true,
            completedAt: new Date().toISOString(),
            subjectsToStudy: user?.role === 'student' ? formData.subjects : (profile.subjectsToStudy || []),
            subjectsToTeach: user?.role === 'teacher' ? formData.subjects : (profile.subjectsToTeach || []),
        };

        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        updateUser({ displayName: formData.fullName, profileComplete: true });
        onClose();
        window.location.reload();
    };

    const t = (ru, en) => language === 'ru' ? ru : en;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{t('Редактировать профиль', 'Edit Profile')}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('Имя', 'Full Name')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('Возраст', 'Age')}</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                min="13"
                                max="120"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('О себе', 'Bio')}</label>
                        <textarea
                            className="form-textarea"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder={t('Расскажите о себе...', 'Tell us about yourself...')}
                            rows="3"
                        />
                    </div>

                    <SubjectSelector
                        selected={formData.subjects}
                        onChange={(subs) => setFormData({ ...formData, subjects: subs })}
                        label={user?.role === 'teacher'
                            ? t('Предметы преподавания', 'Teaching Subjects')
                            : t('Предметы изучения', 'Study Subjects')
                        }
                    />

                    {user?.role === 'teacher' && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('Опыт (лет)', 'Experience (years)')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('Цена курса', 'Course Price')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.coursePrice}
                                        onChange={(e) => setFormData({ ...formData, coursePrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('Доступность', 'Availability')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.availability}
                                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                    placeholder={t('Например: Пн-Пт, 18:00-21:00', 'e.g.: Mon-Fri, 6PM-9PM')}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('Цели на месяц', 'Monthly Goals')}</label>
                            <textarea
                                className="form-textarea"
                                value={user?.role === 'student' ? formData.learningGoalMonth : formData.teachingGoalsMonth}
                                onChange={(e) => {
                                    if (user?.role === 'student') {
                                        setFormData({ ...formData, learningGoalMonth: e.target.value });
                                    } else {
                                        setFormData({ ...formData, teachingGoalsMonth: e.target.value });
                                    }
                                }}
                                rows="2"
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('Цели на год', 'Yearly Goals')}</label>
                            <textarea
                                className="form-textarea"
                                value={user?.role === 'student' ? formData.learningGoalYear : formData.teachingGoalsYear}
                                onChange={(e) => {
                                    if (user?.role === 'student') {
                                        setFormData({ ...formData, learningGoalYear: e.target.value });
                                    } else {
                                        setFormData({ ...formData, teachingGoalsYear: e.target.value });
                                    }
                                }}
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="profile-btn secondary" onClick={onClose}>
                            {t('Отмена', 'Cancel')}
                        </button>
                        <button className="profile-btn primary" onClick={handleSave}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                            {t('Сохранить', 'Save Changes')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
