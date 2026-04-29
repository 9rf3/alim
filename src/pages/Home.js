import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Timer from '../components/Timer';
import Features from '../components/Features';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import '../styles/main.css';

export default function Home() {
    const [scrolled, setScrolled] = useState(false);

    return (
        <div className="App">
            <div className="floating-bg">
                <div className="flask flask-1">⚗️</div>
                <div className="flask flask-2">🧪</div>
                <div className="flask flask-3">⚗️</div>
                <div className="flask flask-4">🧪</div>
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