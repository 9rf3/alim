import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CabinetLayout from '../../components/cabinet/CabinetLayout';

export default function CabinetSimulations() {
    const { language } = useLanguage();
    const t = (ru, en) => language === 'ru' ? ru : en;
    const [activeSubject, setActiveSubject] = useState('chemistry');

    const subjects = [
        { id: 'chemistry', label: t('Химия', 'Chemistry'), icon: '⚗️' },
        { id: 'physics', label: t('Физика', 'Physics'), icon: '⚡' },
        { id: 'math', label: t('Математика', 'Mathematics'), icon: '📐' },
    ];

    const simulations = {
        chemistry: [
            { title: t('Химические реакции', 'Chemical Reactions'), description: t('Визуализация взаимодействия молекул', 'Visualization of molecule interactions') },
            { title: t('Периодическая таблица', 'Periodic Table'), description: t('Интерактивное исследование элементов', 'Interactive element exploration') },
            { title: t('Кислоты и основания', 'Acids and Bases'), description: t('Эксперименты с pH', 'pH experiments') },
        ],
        physics: [
            { title: t('Системы сил', 'Force Systems'), description: t('Визуализация векторов сил', 'Force vector visualization') },
            { title: t('Электрические цепи', 'Electric Circuits'), description: t('Моделирование цепей', 'Circuit modeling') },
            { title: t('Оптика и волны', 'Optics and Waves'), description: t('Световые эксперименты', 'Light experiments') },
        ],
        math: [
            { title: t('Графики функций', 'Function Graphs'), description: t('Интерактивные графики', 'Interactive graphs') },
            { title: t('Геометрия', 'Geometry'), description: t('3D геометрические фигуры', '3D geometric shapes') },
            { title: t('Формулы и уравнения', 'Formulas and Equations'), description: t('Симуляция решений', 'Solution simulation') },
        ],
    };

    return (
        <CabinetLayout>
            <div className="cabinet-header">
                <div className="cabinet-header-top">
                    <div>
                        <h1>{t('Симуляции', 'Simulations')}</h1>
                        <p className="cabinet-header-subtitle">
                            {t('Интерактивные визуализации для лучшего понимания', 'Interactive visualizations for better understanding')}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {subjects.map((subject) => (
                    <button
                        key={subject.id}
                        onClick={() => setActiveSubject(subject.id)}
                        style={{
                            padding: '10px 20px',
                            background: activeSubject === subject.id ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '10px',
                            color: activeSubject === subject.id ? '#fff' : 'var(--text-secondary)',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span>{subject.icon}</span>
                        {subject.label}
                    </button>
                ))}
            </div>

            <div className="cabinet-grid cabinet-grid-3">
                {simulations[activeSubject].map((sim, idx) => (
                    <div key={idx} className="cabinet-card">
                        <div style={{
                            height: '140px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                        }}>
                            {activeSubject === 'chemistry' && '⚗️'}
                            {activeSubject === 'physics' && '⚡'}
                            {activeSubject === 'math' && '📐'}
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {sim.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            {sim.description}
                        </p>
                        <div style={{
                            display: 'inline-flex',
                            padding: '6px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '6px',
                            color: 'var(--accent-primary)',
                            fontSize: '12px',
                            fontWeight: '600',
                        }}>
                            {t('Скоро', 'Coming Soon')}
                        </div>
                    </div>
                ))}
            </div>
        </CabinetLayout>
    );
}
