export default function About() {
    const aboutList = [
        { text: 'Реалистичная физика и химия' },
        { text: 'Автоматическая проверка результатов' },
    ];

    return (
        <section className="about" id="about">
            <div className="section-container">
                <div className="about-grid">
                    <div className="about-content">
                        <span className="section-badge">О платформе</span>
                        <h2 className="section-title">
                            <span>Революция в</span>
                            <span className="gradient-text"> образовании</span>
                        </h2>
                        <p className="about-text">Alim-lab — это инновационная платформа, которая делает научные исследования доступными каждому. Мы объединяем передовые технологии и лучшие практики образования.</p>
                        <ul className="about-list">
                            {aboutList.map((item, index) => (
                                <li key={index}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="about-visual">
                        <div className="glass-card">
                            <div className="lab-preview">
                                <div className="preview-element flask-float">
                                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="about-svg">
                                        <defs>
                                            <linearGradient id="flaskGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.6"/>
                                                <stop offset="100%" stopColor="#5E5CE6" stopOpacity="0.4"/>
                                            </linearGradient>
                                        </defs>
                                        <path d="M28 12L26 36C26 37.6569 27.3431 39 29 39H35C36.6569 39 38 37.6569 38 36L36 12" strokeLinecap="round" stroke="currentColor" opacity="0.5"/>
                                        <path d="M24 18H40" strokeLinecap="round" stroke="currentColor" opacity="0.5"/>
                                        <path d="M26 12H38" strokeLinecap="round" stroke="currentColor" opacity="0.5"/>
                                        <ellipse cx="32" cy="46" rx="12" ry="14" fill="url(#flaskGrad)" opacity="0.4"/>
                                        <path d="M20 46C20 46 24 42 32 42C40 42 44 46 44 46" stroke="currentColor" opacity="0.3" strokeLinecap="round"/>
                                        <circle cx="30" cy="38" r="1.5" fill="#fff" opacity="0.5">
                                            <animate attributeName="cy" values="38;34;38" dur="2s" repeatCount="indefinite"/>
                                        </circle>
                                        <circle cx="34" cy="40" r="1" fill="#fff" opacity="0.4">
                                            <animate attributeName="cy" values="40;36;40" dur="2.5s" repeatCount="indefinite"/>
                                        </circle>
                                    </svg>
                                </div>
                                <div className="preview-element tube-float">
                                    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="about-svg">
                                        <defs>
                                            <linearGradient id="tubeGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#BF5AF2" stopOpacity="0.5"/>
                                                <stop offset="100%" stopColor="#5E5CE6" stopOpacity="0.3"/>
                                            </linearGradient>
                                        </defs>
                                        <rect x="18" y="8" width="12" height="32" rx="6" fill="url(#tubeGrad)" opacity="0.4" stroke="currentColor"/>
                                        <line x1="16" y1="8" x2="32" y2="8" strokeLinecap="round" stroke="currentColor" opacity="0.4"/>
                                        <circle cx="24" cy="22" r="3" fill="#0A84FF" opacity="0.3"/>
                                        <circle cx="24" cy="30" r="2" fill="#BF5AF2" opacity="0.3"/>
                                    </svg>
                                </div>
                                <div className="preview-element atom-float">
                                    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" className="about-svg">
                                        <circle cx="28" cy="28" r="4" fill="#0A84FF" opacity="0.5"/>
                                        <ellipse cx="28" cy="28" rx="20" ry="7" stroke="#0A84FF" opacity="0.3" transform="rotate(-30 28 28)"/>
                                        <ellipse cx="28" cy="28" rx="20" ry="7" stroke="#5E5CE6" opacity="0.3" transform="rotate(30 28 28)"/>
                                        <ellipse cx="28" cy="28" rx="20" ry="7" stroke="#BF5AF2" opacity="0.3"/>
                                        <circle cx="38" cy="16" r="2" fill="#0A84FF" opacity="0.4">
                                            <animate attributeName="cx" values="38;18;38" dur="4s" repeatCount="indefinite"/>
                                            <animate attributeName="cy" values="16;40;16" dur="4s" repeatCount="indefinite"/>
                                        </circle>
                                        <circle cx="18" cy="40" r="1.5" fill="#BF5AF2" opacity="0.4">
                                            <animate attributeName="cx" values="18;38;18" dur="4s" repeatCount="indefinite"/>
                                            <animate attributeName="cy" values="40;16;40" dur="4s" repeatCount="indefinite"/>
                                        </circle>
                                    </svg>
                                </div>
                            </div>
                            <div className="glass-card-glow"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
