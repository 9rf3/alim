import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Timer() {
    const { t } = useLanguage();
    const [seconds, setSeconds] = useState(() => parseInt(localStorage.getItem('timerSeconds') || '0'));
    const [running, setRunning] = useState(localStorage.getItem('timerRunning') === 'true');
    const [visible, setVisible] = useState(() => localStorage.getItem('timerVisible') !== 'false');
    const [showIcon, setShowIcon] = useState(() => localStorage.getItem('timerVisible') === 'false');
    const [birdClicked, setBirdClicked] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('timerSeconds', seconds.toString());
    }, [seconds]);

    useEffect(() => {
        localStorage.setItem('timerRunning', running.toString());
    }, [running]);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running]);

    const formatTime = (totalSeconds) => ({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
    });

    const { hours, minutes, seconds: secs } = formatTime(seconds);

    const toggleVisibility = () => {
        setVisible(!visible);
        setShowIcon(visible);
    };

    const handleBirdClick = () => {
        setBirdClicked(true);
        setTimeout(() => setBirdClicked(false), 600);
        toggleVisibility();
    };

    const startTimer = () => setRunning(true);
    const pauseTimer = () => setRunning(false);
    const resetTimer = () => {
        setRunning(false);
        setSeconds(0);
    };

    return (
        <div className="timer-container" id="timerContainer">
            <div 
                className={`bird ${birdClicked ? 'clicked' : ''}`} 
                id="bird"
                onClick={handleBirdClick}
            >
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="birdShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1e3a5f" floodOpacity="0.3"/>
                        </filter>
                        <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#60A5FA"/>
                            <stop offset="100%" stopColor="#1E40AF"/>
                        </radialGradient>
                    </defs>
                    
                    <ellipse cx="40" cy="72" rx="20" ry="4" fill="#000" opacity="0.15"/>
                    <path d="M40 58 L28 72 L40 65 L52 72 Z" fill="#1E40AF" filter="url(#birdShadow)"/>
                    <ellipse cx="40" cy="52" rx="22" ry="16" fill="#3B82F6" filter="url(#birdShadow)"/>
                    <ellipse cx="40" cy="50" rx="16" ry="11" fill="#60A5FA"/>
                    <ellipse cx="22" cy="48" rx="10" ry="6" fill="#2563EB"/>
                    <ellipse cx="58" cy="48" rx="10" ry="6" fill="#2563EB"/>
                    <circle cx="40" cy="32" r="20" fill="#3B82F6" filter="url(#birdShadow)"/>
                    <circle cx="40" cy="30" r="16" fill="#60A5FA"/>
                    
                    <circle cx="32" cy="28" r="7" fill="#FFF"/>
                    <circle cx="48" cy="28" r="7" fill="#FFF"/>
                    
                    <circle cx="32" cy="28" r="5" fill="url(#eyeGradient)"/>
                    <circle cx="48" cy="28" r="5" fill="url(#eyeGradient)"/>
                    
                    <circle className="bird-pupil" cx="32" cy="28" r="3" fill="#0f172a" id="birdPupilLeft"/>
                    <circle className="bird-pupil" cx="48" cy="28" r="3" fill="#0f172a" id="birdPupilRight"/>
                    
                    <circle cx="34" cy="26" r="2" fill="#FFF" opacity="0.9"/>
                    <circle cx="50" cy="26" r="2" fill="#FFF" opacity="0.9"/>
                    <circle cx="30" cy="30" r="1" fill="#FFF" opacity="0.5"/>
                    <circle cx="46" cy="30" r="1" fill="#FFF" opacity="0.5"/>
                    
                    <path d="M34 38 L40 48 L46 38 Z" fill="#F59E0B" filter="url(#birdShadow)"/>
                    <path d="M34 38 L40 44 L46 38 Z" fill="#FBBF24"/>
                    
                    <line x1="34" y1="65" x2="32" y2="75" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="46" y1="65" x2="48" y2="75" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M28 75 L36 75 L34 72 Z" fill="#F59E0B"/>
                    <path d="M44 75 L52 75 L50 72 Z" fill="#F59E0B"/>
                </svg>
                <div className="bird-glow"></div>
            </div>

            <button 
                className={`timer-icon-btn ${showIcon ? 'visible' : ''}`} 
                id="timerIconBtn"
                onClick={toggleVisibility}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            </button>

            <div className={`timer-card ${!visible ? 'hidden' : ''}`} id="timerCard">
                <button className="timer-close" id="timerClose" onClick={toggleVisibility}>×</button>
                <div className="timer-display">
                    <div className="timer-unit">
                        <span className="timer-value" id="timerHours">{String(hours).padStart(2, '0')}</span>
                        <span className="timer-label">{t('timer.hours')}</span>
                    </div>
                    <span className="timer-separator">:</span>
                    <div className="timer-unit">
                        <span className="timer-value" id="timerMinutes">{String(minutes).padStart(2, '0')}</span>
                        <span className="timer-label">{t('timer.minutes')}</span>
                    </div>
                    <span className="timer-separator">:</span>
                    <div className="timer-unit">
                        <span className="timer-value" id="timerSeconds">{String(secs).padStart(2, '0')}</span>
                        <span className="timer-label">{t('timer.seconds')}</span>
                    </div>
                </div>
                <div className="timer-controls">
                    {!running && (
                        <button className="timer-btn primary" id="timerStart" onClick={startTimer}>
                            {t('timer.start')}
                        </button>
                    )}
                    {running && (
                        <button className="timer-btn" id="timerPause" onClick={pauseTimer} style={{ display: 'inline-block' }}>
                            {t('timer.pause')}
                        </button>
                    )}
                    <button className="timer-btn secondary" id="timerReset" onClick={resetTimer}>
                        {t('timer.reset')}
                    </button>
                </div>
            </div>
        </div>
    );
}