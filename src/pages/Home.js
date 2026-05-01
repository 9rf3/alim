import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Timer from '../components/Timer';
import Features from '../components/Features';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import '../styles/main.css';

export default function Home() {
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
            
            <div className="search-modal" id="searchModal">
                <div className="search-modal-overlay" id="searchOverlay"></div>
                <div className="search-modal-content">
                    <input 
                        type="text" 
                        className="search-modal-input" 
                        placeholder="Поиск по лаборатории..." 
                        id="searchModalInput"
                    />
                    <div className="search-results" id="searchResults"></div>
                </div>
            </div>
        </div>
    );
}
