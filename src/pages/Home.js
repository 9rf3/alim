import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Timer from '../components/Timer';
import Features from '../components/Features';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/main.css';

export default function Home() {
    const { language } = useLanguage();
    const [searchOpen, setSearchOpen] = useState(false);
    
    useEffect(() => {
        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape key to close search
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
            }
            // Ctrl+K or Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen]);
    
    const openSearch = () => setSearchOpen(true);
    const closeSearch = () => setSearchOpen(false);
    
    // Add search button listener after mount
    useEffect(() => {
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', openSearch);
            return () => searchBtn.removeEventListener('click', openSearch);
        }
    }, []);
    
    return (
        <div className="App">
            <div className="floating-bg">
                <svg className="floating-shape shape-1" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
                    <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                    <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.2"/>
                </svg>
                <svg className="floating-shape shape-2" viewBox="0 0 64 64" fill="none">
                    <path d="M32 8L52 20V44L32 56L12 44V20L32 8Z" stroke="currentColor" strokeWidth="1.5" opacity="0.12"/>
                    <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                </svg>
                <svg className="floating-shape shape-3" viewBox="0 0 64 64" fill="none">
                    <rect x="12" y="12" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.12" transform="rotate(15 32 32)"/>
                    <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.15"/>
                </svg>
                <svg className="floating-shape shape-4" viewBox="0 0 64 64" fill="none">
                    <path d="M32 6L38 26H58L42 38L48 58L32 46L16 58L22 38L6 26H26L32 6Z" stroke="currentColor" strokeWidth="1.5" opacity="0.12"/>
                </svg>
                <svg className="floating-shape shape-5" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4L4 16V32L24 44L44 32V16L24 4Z" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.75" opacity="0.08"/>
                </svg>
                <svg className="floating-shape shape-6" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                    <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24" stroke="currentColor" strokeWidth="1.5" opacity="0.12" strokeLinecap="round"/>
                </svg>
            </div>

            <Navbar />
            
            <Hero />
            
            <Timer />
            
            <Features />
            
            <About />
            
            <Contact />
            
            <Footer />
            
            <div className={`search-modal ${searchOpen ? 'active' : ''}`} id="searchModal">
                <div className="search-modal-overlay" onClick={closeSearch}></div>
                <div className="search-modal-content">
                    <div className="search-modal-header">
                        <input 
                            type="text" 
                            className="search-modal-input" 
                            placeholder={language === 'ru' ? 'Поиск по лаборатории...' : 'Search the lab...'} 
                            id="searchModalInput"
                            autoFocus={searchOpen}
                        />
                        <button className="search-modal-close" onClick={closeSearch}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div className="search-results" id="searchResults"></div>
                </div>
            </div>
        </div>
    );
}