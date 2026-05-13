import { useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/dashboard/widgets.css';

export default function AIWidget() {
    const { language } = useLanguage();
    const t = useCallback((ru, en) => language === 'ru' ? ru : en, [language]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: t('Привет! Я твой AI-помощник. Задай любой вопрос по учёбе!', 'Hi! I\'m your AI assistant. Ask me anything about your studies!')
        }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { type: 'user', text: input }]);
        setMessages(prev => [...prev, {
            type: 'ai',
            text: t('Отличный вопрос! Я скоро научусь на него отвечать 😊', 'Great question! I\'ll learn to answer it soon 😊')
        }]);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="dash-widget dash-widget-ai">
            <div className="dash-widget-header">
                <div className="dash-widget-title-row">
                    <svg className="dash-widget-icon dash-ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 4a4 4 0 0 1-4-4c0-2.2 1.8-4 4-4z"/>
                        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                        <path d="M21 12h-2M5 12H3M12 5V3M12 19v2"/>
                        <circle cx="18" cy="6" r="1" fill="currentColor"/>
                        <circle cx="6" cy="6" r="1" fill="currentColor"/>
                    </svg>
                    <h3 className="dash-widget-title">AI {t('Помощник', 'Assistant')}</h3>
                </div>
                <span className="dash-ai-badge">{t('В разработке', 'In Development')}</span>
            </div>
            <div className="dash-ai-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`dash-ai-msg ${msg.type === 'ai' ? 'ai' : 'user'}`}>
                        {msg.type === 'ai' && (
                            <div className="dash-ai-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 4a4 4 0 0 1-4-4c0-2.2 1.8-4 4-4z"/>
                                    <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                                </svg>
                            </div>
                        )}
                        <div className="dash-ai-bubble">{msg.text}</div>
                    </div>
                ))}
            </div>
            <div className="dash-ai-input-row">
                <input
                    type="text"
                    className="dash-ai-input"
                    placeholder={t('Спроси что-нибудь...', 'Ask something...')}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="dash-ai-send" onClick={handleSend}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}
