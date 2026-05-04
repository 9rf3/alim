import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('lang') || 'ru';
    });

    const changeLanguage = useCallback((lang) => {
        if (lang !== 'ru' && lang !== 'en') return;
        setLanguage(lang);
        localStorage.setItem('lang', lang);
        document.documentElement.setAttribute('lang', lang);
    }, []);

    const t = useCallback((key) => {
        return translations[language]?.[key] || translations['ru']?.[key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}