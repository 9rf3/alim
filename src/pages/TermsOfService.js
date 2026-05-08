import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const termsContent = {
    en: {
        title: 'Terms of Service',
        lastUpdated: 'Last updated: May 7, 2026',
        sections: [
            {
                heading: '1. Acceptance of Terms',
                content: 'By accessing and using Alim-lab ("Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.'
            },
            {
                heading: '2. Description of Service',
                content: 'Alim-lab is an online educational platform that provides virtual laboratory experiments, courses, and educational resources. The Platform offers both free and paid subscription tiers with varying levels of access to features and content.'
            },
            {
                heading: '3. User Accounts',
                content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration. You must notify us immediately of any unauthorized use of your account.'
            },
            {
                heading: '4. Eligibility',
                content: 'You must be at least 13 years old to use the Platform. Users under 18 must have parental or guardian consent. By using the Platform, you represent that you meet these eligibility requirements.'
            },
            {
                heading: '5. Subscription and Billing',
                content: 'Paid subscriptions are billed on a recurring monthly or annual basis. Annual subscriptions receive a 20% discount. You may cancel your subscription at any time, and you will retain access until the end of your current billing period. Refunds are provided on a case-by-case basis within 14 days of purchase.'
            },
            {
                heading: '6. Acceptable Use',
                content: 'You agree not to: (a) use the Platform for any unlawful purpose; (b) attempt to gain unauthorized access to any portion of the Platform; (c) share your account credentials with others; (d) upload or distribute harmful content; (e) interfere with the proper functioning of the Platform.'
            },
            {
                heading: '7. Intellectual Property',
                content: 'All content on the Platform, including but not limited to courses, experiments, simulations, and educational materials, is the intellectual property of Alim-lab or its content creators. You may access and use this content for personal educational purposes only.'
            },
            {
                heading: '8. User-Generated Content',
                content: 'By uploading or creating content on the Platform, you grant Alim-lab a non-exclusive, royalty-free license to use, display, and distribute that content within the Platform. You retain ownership of your content.'
            },
            {
                heading: '9. Privacy',
                content: 'Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.'
            },
            {
                heading: '10. Termination',
                content: 'We reserve the right to suspend or terminate your account at any time for violations of these Terms. Upon termination, your right to use the Platform will cease immediately.'
            },
            {
                heading: '11. Disclaimers',
                content: 'The Platform is provided "as is" without warranties of any kind. We do not guarantee that the Platform will be uninterrupted, secure, or error-free. Educational content is provided for informational purposes and does not constitute professional advice.'
            },
            {
                heading: '12. Limitation of Liability',
                content: 'To the maximum extent permitted by law, Alim-lab shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.'
            },
            {
                heading: '13. Changes to Terms',
                content: 'We may modify these Terms at any time. We will notify users of material changes via email or through the Platform. Your continued use of the Platform after such modifications constitutes acceptance of the updated Terms.'
            },
            {
                heading: '14. Contact',
                content: 'If you have questions about these Terms, please contact us at: support@alim-lab.com'
            }
        ]
    },
    ru: {
        title: 'Условия использования',
        lastUpdated: 'Последнее обновление: 7 мая 2026',
        sections: [
            {
                heading: '1. Принятие условий',
                content: 'Используя платформу Alim-lab, вы принимаете и соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с этими условиями, пожалуйста, не используйте платформу.'
            },
            {
                heading: '2. Описание сервиса',
                content: 'Alim-lab — это онлайн-образовательная платформа, предоставляющая виртуальные лабораторные эксперименты, курсы и образовательные ресурсы. Платформа предлагает как бесплатные, так и платные уровни подписки с различным уровнем доступа к функциям и контенту.'
            },
            {
                heading: '3. Учётные записи',
                content: 'Вы несёте ответственность за сохранность учётных данных вашей учётной записи. Вы соглашаетесь предоставлять точную и полную информацию при регистрации. Вы обязаны немедленно уведомить нас о любом несанкционированном использовании вашей учётной записи.'
            },
            {
                heading: '4. Право на использование',
                content: 'Вам должно быть не менее 13 лет для использования платформы. Пользователи до 18 лет должны иметь согласие родителей или опекунов. Используя платформу, вы подтверждаете, что соответствуете этим требованиям.'
            },
            {
                heading: '5. Подписка и оплата',
                content: 'Платные подписки оплачиваются ежемесячно или ежегодно. Годовые подписки получают скидку 20%. Вы можете отменить подписку в любое время, при этом доступ сохранится до конца текущего расчётного периода. Возврат средств осуществляется в индивидуальном порядке в течение 14 дней с момента покупки.'
            },
            {
                heading: '6. Допустимое использование',
                content: 'Вы соглашаетесь не: (a) использовать платформу в незаконных целях; (b) пытаться получить несанкционированный доступ к любой части платформы; (c) передавать свои учётные данные другим лицам; (d) загружать или распространять вредоносный контент; (e) мешать нормальной работе платформы.'
            },
            {
                heading: '7. Интеллектуальная собственность',
                content: 'Весь контент на платформе, включая, но не ограничиваясь, курсы, эксперименты, симуляции и образовательные материалы, является интеллектуальной собственностью Alim-lab или создателей контента. Вы можете использовать этот контент только для личных образовательных целей.'
            },
            {
                heading: '8. Контент, созданный пользователями',
                content: 'Загружая или создавая контент на платформе, вы предоставляете Alim-lab неисключительную безвозмездную лицензию на использование, отображение и распространение этого контента в рамках платформы. Вы сохраняете право владения своим контентом.'
            },
            {
                heading: '9. Конфиденциальность',
                content: 'Ваша конфиденциальность важна для нас. Сбор и использование персональной информации регулируется нашей Политикой конфиденциальности, которая является неотъемлемой частью настоящих Условий.'
            },
            {
                heading: '10. Прекращение действия',
                content: 'Мы оставляем за собой право приостановить или прекратить действие вашей учётной записи в любое время за нарушение настоящих Условий. После прекращения действия ваше право использовать платформу немедленно прекращается.'
            },
            {
                heading: '11. Отказ от ответственности',
                content: 'Платформа предоставляется «как есть» без каких-либо гарантий. Мы не гарантируем, что платформа будет работать бесперебойно, безопасно или без ошибок. Образовательный контент предоставляется в информационных целях и не является профессиональной консультацией.'
            },
            {
                heading: '12. Ограничение ответственности',
                content: 'В максимальной степени, разрешённой законом, Alim-lab не несёт ответственности за любые косвенные, случайные, особые, последующие или штрафные убытки, возникающие в результате использования вами платформы.'
            },
            {
                heading: '13. Изменение условий',
                content: 'Мы можем изменять настоящие Условия в любое время. Мы уведомим пользователей о существенных изменениях по электронной почте или через платформу. Ваше продолжение использования платформы после таких изменений означает принятие обновлённых Условий.'
            },
            {
                heading: '14. Контакты',
                content: 'Если у вас есть вопросы по поводу настоящих Условий, свяжитесь с нами по адресу: support@alim-lab.com'
            }
        ]
    }
};

export default function TermsOfService() {
    const { language } = useLanguage();
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen]);

    const content = termsContent[language] || termsContent.en;

    return (
        <div className="App">
            <div className="floating-bg">
                <svg className="floating-shape shape-1" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
                    <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                </svg>
                <svg className="floating-shape shape-3" viewBox="0 0 64 64" fill="none">
                    <rect x="12" y="12" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.12" transform="rotate(15 32 32)"/>
                </svg>
            </div>

            <Navbar />

            <div className="terms-page">
                <div className="terms-container">
                    <div className="terms-header">
                        <h1>{content.title}</h1>
                        <p className="terms-updated">{content.lastUpdated}</p>
                    </div>

                    <div className="terms-content">
                        {content.sections.map((section, index) => (
                            <div key={index} className="terms-section">
                                <h2>{section.heading}</h2>
                                <p>{section.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="terms-footer">
                        <Link to="/" className="terms-back-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            {language === 'ru' ? 'Вернуться на главную' : 'Back to Home'}
                        </Link>
                    </div>
                </div>
            </div>

            <div className={`search-modal ${searchOpen ? 'active' : ''}`} id="searchModal">
                <div className="search-modal-overlay" onClick={() => setSearchOpen(false)}></div>
                <div className="search-modal-content">
                    <div className="search-modal-header">
                        <input
                            type="text"
                            className="search-modal-input"
                            placeholder={language === 'ru' ? 'Поиск по лаборатории...' : 'Search the lab...'}
                            id="searchModalInput"
                            autoFocus={searchOpen}
                        />
                        <button className="search-modal-close" onClick={() => setSearchOpen(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
