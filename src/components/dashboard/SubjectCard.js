import { useLanguage } from '../../contexts/LanguageContext';
import { getSubjectById } from '../../data/subjects';
import '../../styles/dashboard/cards.css';

export default function SubjectCard({ subjectId, progress = 0, onClick }) {
    const { language } = useLanguage();
    const subject = getSubjectById(subjectId);

    if (!subject) return null;

    const name = language === 'ru' ? subject.ru : subject.en;

    return (
        <div className="dash-subject-card" onClick={onClick} style={{ '--subject-color': subject.color }}>
            <div className="dash-subject-glow"></div>
            <div className="dash-subject-icon" style={{ background: `${subject.color}20` }}>
                <span>{subject.icon}</span>
            </div>
            <div className="dash-subject-info">
                <span className="dash-subject-name">{name}</span>
                <div className="dash-subject-progress">
                    <div className="dash-subject-bar">
                        <div className="dash-subject-fill" style={{ width: `${progress}%`, background: subject.color }}></div>
                    </div>
                    <span className="dash-subject-pct">{progress}%</span>
                </div>
            </div>
        </div>
    );
}
