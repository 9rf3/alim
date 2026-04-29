import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/demo.css';
import '../data/translations';

const elements = {
    hydrogen: { symbol: 'H', name: 'Водород', nameEn: 'Hydrogen', color: '#EF4444', number: 1 },
    oxygen: { symbol: 'O', name: 'Кислород', nameEn: 'Oxygen', color: '#3B82F6', number: 8 },
    carbon: { symbol: 'C', name: 'Углерод', nameEn: 'Carbon', color: '#10B981', number: 6 },
    nitrogen: { symbol: 'N', name: 'Азот', nameEn: 'Nitrogen', color: '#8B5CF6', number: 7 }
};

const reactions = {
    'H-O': { formula: 'H₂O', key: 'water', name: 'Вода', nameEn: 'Water' },
    'C-O-O': { formula: 'CO₂', key: 'co2', name: 'Углекислый газ', nameEn: 'Carbon Dioxide' },
    'C-H-H-H-H': { formula: 'CH₄', key: 'methane', name: 'Метан', nameEn: 'Methane' },
    'N-H-H-H': { formula: 'NH₃', key: 'ammonia', name: 'Аммиак', nameEn: 'Ammonia' }
};

export default function Demo() {
    const { theme } = useTheme();
    const { language, t } = useLanguage();
    const canvasRef = useRef(null);
    const [selectedElements, setSelectedElements] = useState([]);
    const [isExperimentRunning, setIsExperimentRunning] = useState(false);
    const [currentResult, setCurrentResult] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = container.clientWidth * dpr;
            canvas.height = container.clientHeight * dpr;
            canvas.style.width = container.clientWidth + 'px';
            canvas.style.height = container.clientHeight + 'px';
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;
        let bubbles = [];

        const drawFlask = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            const cx = w / 2;
            const cy = h / 2 + 20;

            ctx.clearRect(0, 0, w, h);

            const isDark = theme === 'dark';
            const bodyWidth = 160;
            const bodyHeight = 180;
            const neckWidth = 45;
            const neckHeight = 90;
            const bottomY = cy + bodyHeight / 2;
            const bodyTopY = cy - bodyHeight / 4;
            const neckBottomY = cy - bodyHeight / 2 - 10;
            const neckTopY = cy - bodyHeight / 2 - neckHeight + 20;

            const glowRadius = 180;
            const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
            glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
            glowGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.05)');
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            const curveR = 25;
            ctx.moveTo(cx - bodyWidth / 2 + curveR, bottomY);
            ctx.quadraticCurveTo(cx - bodyWidth / 2, bottomY, cx - bodyWidth / 2, bottomY - curveR);
            ctx.lineTo(cx - bodyWidth / 2, bodyTopY);
            ctx.lineTo(cx - neckWidth / 2, neckBottomY);
            ctx.lineTo(cx - neckWidth / 2, neckTopY);
            ctx.lineTo(cx - 27, neckTopY);
            ctx.lineTo(cx - 27, neckTopY - 8);
            ctx.lineTo(cx + 27, neckTopY - 8);
            ctx.lineTo(cx + 27, neckTopY);
            ctx.lineTo(cx + neckWidth / 2, neckTopY);
            ctx.lineTo(cx + neckWidth / 2, neckBottomY);
            ctx.lineTo(cx + bodyWidth / 2, bodyTopY);
            ctx.lineTo(cx + bodyWidth / 2, bottomY - curveR);
            ctx.quadraticCurveTo(cx + bodyWidth / 2, bottomY, cx + bodyWidth / 2 - curveR, bottomY);
            ctx.closePath();

            const innerShadow = ctx.createLinearGradient(cx - bodyWidth / 2, cy, cx + bodyWidth / 2, cy);
            innerShadow.addColorStop(0, isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)');
            innerShadow.addColorStop(0.5, isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)');
            innerShadow.addColorStop(1, isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)');
            ctx.fillStyle = innerShadow;
            ctx.fill();
            ctx.restore();

            const liquidLevel = selectedElements.length > 0 ? 0.5 + selectedElements.length * 0.15 : 0.4;
            const liquidMaxH = bodyHeight * 0.7;
            const liquidH = liquidMaxH * liquidLevel;
            const liquidY = bodyTopY + bodyHeight * 0.65 - liquidH;

            if (selectedElements.length > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(cx - bodyWidth / 2 + 20, bottomY - 10);
                ctx.quadraticCurveTo(cx - bodyWidth / 2 + 10, bottomY - 10, cx - bodyWidth / 2 + 10, liquidY);
                ctx.lineTo(cx + bodyWidth / 2 - 10, liquidY);
                ctx.lineTo(cx + bodyWidth / 2 - 10, bottomY - 10);
                ctx.quadraticCurveTo(cx + bodyWidth / 2 - 10, bottomY - 10, cx + bodyWidth / 2 - 20, bottomY - 10);
                ctx.closePath();

                const colors = selectedElements.map(el => elements[el]?.color || '#3B82F6');
                const liqGrad = ctx.createLinearGradient(cx, liquidY, cx, bottomY);
                liqGrad.addColorStop(0, colors[0] || '#3B82F6');
                liqGrad.addColorStop(1, colors[colors.length - 1] || '#8B5CF6');
                ctx.fillStyle = liqGrad;
                ctx.fill();
                ctx.restore();

                if (Math.random() < 0.03 && liquidLevel > 0.1) {
                    bubbles.push({
                        x: cx + (Math.random() - 0.5) * bodyWidth * 0.6,
                        y: bottomY - 15,
                        size: 2 + Math.random() * 3,
                        speed: 0.6 + Math.random() * 1.2,
                        wobble: Math.random() * Math.PI * 2
                    });
                }

                bubbles = bubbles.filter(b => {
                    b.y -= b.speed;
                    b.x += Math.sin(time * 4 + b.wobble) * 0.4;
                    b.size *= 0.997;
                    
                    if (b.y < liquidY || b.size < 0.8) return false;
                    
                    const bubbleGrad = ctx.createRadialGradient(b.x - b.size * 0.3, b.y - b.size * 0.3, 0, b.x, b.y, b.size);
                    bubbleGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
                    bubbleGrad.addColorStop(0.5, isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)');
                    bubbleGrad.addColorStop(1, isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)');
                    
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                    ctx.fillStyle = bubbleGrad;
                    ctx.fill();
                    
                    return true;
                });
            }

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx - bodyWidth / 2 + curveR, bottomY);
            ctx.quadraticCurveTo(cx - bodyWidth / 2, bottomY, cx - bodyWidth / 2, bottomY - curveR);
            ctx.lineTo(cx - bodyWidth / 2, bodyTopY);
            ctx.lineTo(cx - neckWidth / 2, neckBottomY);
            ctx.lineTo(cx - neckWidth / 2, neckTopY);
            ctx.lineTo(cx - 27, neckTopY);
            ctx.lineTo(cx - 27, neckTopY - 8);
            ctx.lineTo(cx + 27, neckTopY - 8);
            ctx.lineTo(cx + 27, neckTopY);
            ctx.lineTo(cx + neckWidth / 2, neckTopY);
            ctx.lineTo(cx + neckWidth / 2, neckBottomY);
            ctx.lineTo(cx + bodyWidth / 2, bodyTopY);
            ctx.lineTo(cx + bodyWidth / 2, bottomY - curveR);
            ctx.quadraticCurveTo(cx + bodyWidth / 2, bottomY, cx + bodyWidth / 2 - curveR, bottomY);
            ctx.closePath();

            ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - bodyWidth / 3, bodyTopY + 20);
            ctx.lineTo(cx - bodyWidth / 3 + 15, liquidY - 10);
            ctx.stroke();
            ctx.restore();
        };

        const animate = () => {
            time += 0.01;
            drawFlask();
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [theme, selectedElements]);

    const addElement = (elementKey) => {
        if (selectedElements.length >= 4) return;
        setSelectedElements([...selectedElements, elementKey]);
    };

    const checkReaction = () => {
        if (selectedElements.length < 2) return;
        
        setIsExperimentRunning(true);
        
        const sortedKey = [...selectedElements].sort().join('-');
        const reaction = reactions[sortedKey];
        
        setTimeout(() => {
            if (reaction) {
                setCurrentResult({
                    name: language === 'ru' ? reaction.name : reaction.nameEn,
                    formula: reaction.formula
                });
            } else {
                setCurrentResult({
                    name: language === 'ru' ? 'Нет реакции' : 'No Reaction',
                    formula: ''
                });
            }
            setIsExperimentRunning(false);
        }, 1500);
    };

    const resetExperiment = () => {
        setSelectedElements([]);
        setCurrentResult(null);
    };

    return (
        <div className="App">
            <Navbar />
            
            <div className="lab-container">
                <div className="elements-panel">
                    <div>
                        <h3 className="panel-title">
                            {language === 'ru' ? 'Выбор элементов' : 'Select Elements'}
                        </h3>
                        <p className="panel-subtitle">
                            {language === 'ru' ? 'Кликните чтобы добавить в реакцию' : 'Click to add to reaction'}
                        </p>
                    </div>
                    
                    <div className="elements-grid">
                        {Object.entries(elements).map(([key, el]) => (
                            <div 
                                key={key}
                                className={`element-card ${selectedElements.includes(key) ? 'selected' : ''}`}
                                onClick={() => addElement(key)}
                            >
                                <span className="element-number">{el.number}</span>
                                <span className="element-symbol">{el.symbol}</span>
                                <span className="element-name">
                                    {language === 'ru' ? el.name : el.nameEn}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="selection-display">
                        <div className="selection-label">
                            {language === 'ru' ? 'Выбрано:' : 'Selected:'}
                        </div>
                        <div className="selection-formula">
                            {selectedElements.map(el => elements[el]?.symbol).join(' + ') || '—'}
                        </div>
                    </div>
                </div>

                <div className="flask-area">
                    <div className="flask-header">
                        <h2 className="flask-title">
                            {language === 'ru' ? 'Реакционная смесь' : 'Reaction Mixture'}
                        </h2>
                        <button 
                            className="experiment-btn" 
                            disabled={selectedElements.length < 2 || isExperimentRunning}
                            onClick={checkReaction}
                        >
                            {language === 'ru' ? 'Запустить реакцию' : 'Start Reaction'}
                        </button>
                    </div>
                    <div className="flask-canvas-container">
                        <canvas ref={canvasRef} id="flaskCanvas"></canvas>
                    </div>
                </div>

                <div className="result-panel">
                    <div className="result-content">
                        <div className="result-label">
                            {language === 'ru' ? 'Результат' : 'Result'}
                        </div>
                        {currentResult ? (
                            <>
                                <div className="result-title">{currentResult.name}</div>
                                <div className="result-formula">{currentResult.formula}</div>
                            </>
                        ) : (
                            <div className="result-title">
                                <span className="result-empty">
                                    {language === 'ru' ? 'Начните эксперимент' : 'Start an experiment'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="control-btns">
                        <button className="btn-secondary" onClick={resetExperiment}>
                            {language === 'ru' ? 'Очистить' : 'Clear'}
                        </button>
                        <button className="btn-secondary" onClick={resetExperiment}>
                            {language === 'ru' ? 'Новый эксперимент' : 'New Experiment'}
                        </button>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}