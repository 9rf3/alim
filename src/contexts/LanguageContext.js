import { createContext, useContext } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const t = (key) => translations['ru']?.[key] || key;
    return (
        <LanguageContext.Provider value={{ language: 'ru', changeLanguage: () => {}, t }}>
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