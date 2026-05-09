import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../data/translations';
import '../../styles/demo.css';

const elements = {
    hydrogen: { symbol: 'H', name: 'Водород', nameEn: 'Hydrogen', color: '#EF4444', number: 1 },
    oxygen: { symbol: 'O', name: 'Кислород', nameEn: 'Oxygen', color: '#3B82F6', number: 8 },
    carbon: { symbol: 'C', name: 'Углерод', nameEn: 'Carbon', color: '#10B981', number: 6 },
    nitrogen: { symbol: 'N', name: 'Азот', nameEn: 'Nitrogen', color: '#8B5CF6', number: 7 }
};

const reactions = {
    'H-O': { formula: 'H₂O', key: 'water', ratios: { H: 2, O: 1 } },
    'H-O-O': { formula: 'H₂O₂', key: 'peroxide', ratios: { H: 2, O: 2 } },
    'C-O': { formula: 'CO', key: 'co', ratios: { C: 1, O: 1 } },
    'C-O-O': { formula: 'CO₂', key: 'co2', ratios: { C: 1, O: 2 } },
    'C-H-H-H-H': { formula: 'CH₄', key: 'methane', ratios: { C: 1, H: 4 } },
    'N-H-H-H': { formula: 'NH₃', key: 'ammonia', ratios: { N: 1, H: 3 } }
};

export default function DemoLab() {
    const { theme } = useTheme();
    const { language, t } = useLanguage();
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const bubblesRef = useRef([]);
    const liquidLevelRef = useRef(0.4);
    const targetLiquidLevelRef = useRef(0.4);
    const liquidColorRef = useRef({ r: 59, g: 130, b: 246 });
    const targetLiquidColorRef = useRef({ r: 59, g: 130, b: 246 });
    const glowIntensityRef = useRef(1);
    const animationIdRef = useRef(null);

    const [selectedElements, setSelectedElements] = useState([]);
    const [isExperimentRunning, setIsExperimentRunning] = useState(false);
    const [currentResult, setCurrentResult] = useState(null);
    const [hasResult, setHasResult] = useState(false);

    const getResultTranslation = useCallback((key) => {
        return translations[language]?.[key] || translations['ru']?.[key] || key;
    }, [language]);

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
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const createParticle = useCallback((symbol, color) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const container = canvas.parentElement;
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 100;

        return {
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            targetX: centerX + (Math.random() - 0.5) * 60,
            targetY: centerY + 20 + Math.random() * 40,
            symbol, color,
            size: 6 + Math.random() * 4,
            speed: 0.02 + Math.random() * 0.02,
            progress: 0,
            orbit: Math.random() * Math.PI * 2,
            orbitSpeed: 0.01 + Math.random() * 0.02,
            orbitRadius: 80 + Math.random() * 40
        };
    }, []);

    const drawFlask = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2;
        const cy = h / 2 + 20;
        const time = Date.now() * 0.001;

        ctx.clearRect(0, 0, w, h);
        const isDark = theme === 'dark';
        const bodyWidth = 160, bodyHeight = 180, neckWidth = 45, neckHeight = 90, rimWidth = 55, rimHeight = 8;
        const bottomY = cy + bodyHeight / 2, bodyTopY = cy - bodyHeight / 4;
        const neckBottomY = cy - bodyHeight / 2 - 10, neckTopY = cy - bodyHeight / 2 - neckHeight + 20, rimY = neckTopY;

        const lc = liquidColorRef.current, tlc = targetLiquidColorRef.current;
        lc.r += (tlc.r - lc.r) * 0.03; lc.g += (tlc.g - lc.g) * 0.03; lc.b += (tlc.b - lc.b) * 0.03;

        const liquidMaxH = bodyHeight * 0.85, liquidH = liquidMaxH * liquidLevelRef.current;
        const liquidY = bodyTopY + (bodyHeight * 0.75) - liquidH;

        const glowRadius = 180, glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        const glowA = isDark ? 0.4 : 0.15, gi = glowIntensityRef.current;
        glowGrad.addColorStop(0, `rgba(${lc.r}, ${lc.g}, ${lc.b}, ${glowA * gi})`);
        glowGrad.addColorStop(0.6, `rgba(${lc.r}, ${lc.g}, ${lc.b}, ${glowA * 0.3 * gi})`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2); ctx.fill();

        const curveR = 25;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - bodyWidth / 2 + curveR, bottomY);
        ctx.quadraticCurveTo(cx - bodyWidth / 2, bottomY, cx - bodyWidth / 2, bottomY - curveR);
        ctx.lineTo(cx - bodyWidth / 2, bodyTopY); ctx.lineTo(cx - neckWidth / 2, neckBottomY);
        ctx.lineTo(cx - neckWidth / 2, neckTopY); ctx.lineTo(cx - rimWidth / 2, neckTopY);
        ctx.lineTo(cx - rimWidth / 2, neckTopY - rimHeight); ctx.lineTo(cx + rimWidth / 2, neckTopY - rimHeight);
        ctx.lineTo(cx + rimWidth / 2, neckTopY); ctx.lineTo(cx + neckWidth / 2, neckTopY);
        ctx.lineTo(cx + neckWidth / 2, neckBottomY); ctx.lineTo(cx + bodyWidth / 2, bodyTopY);
        ctx.lineTo(cx + bodyWidth / 2, bottomY - curveR);
        ctx.quadraticCurveTo(cx + bodyWidth / 2, bottomY, cx + bodyWidth / 2 - curveR, bottomY);
        ctx.closePath();

        const innerShadow = ctx.createLinearGradient(cx - bodyWidth / 2, cy, cx + bodyWidth / 2, cy);
        innerShadow.addColorStop(0, isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)');
        innerShadow.addColorStop(0.5, isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)');
        innerShadow.addColorStop(1, isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)');
        ctx.fillStyle = innerShadow; ctx.fill(); ctx.restore();

        if (liquidLevelRef.current > 0.05) {
            ctx.save();
            ctx.beginPath();
            const lCurveR = 20;
            ctx.moveTo(cx - bodyWidth / 2 + lCurveR + 5, bottomY - 5);
            ctx.quadraticCurveTo(cx - bodyWidth / 2 + 5, bottomY - 5, cx - bodyWidth / 2 + 5, bottomY - lCurveR - 5);
            ctx.lineTo(cx - bodyWidth / 2 + 5, liquidY + 10);
            for (let x = -bodyWidth / 2 + 5; x <= bodyWidth / 2 - 5; x += 4) {
                ctx.lineTo(cx + x * 0.8, liquidY + Math.sin((x * 0.12) + (time * 2.5)) * 2.5);
            }
            ctx.lineTo(cx + bodyWidth / 2 - 5, liquidY + 10);
            ctx.lineTo(cx + bodyWidth / 2 - 5, bottomY - lCurveR - 5);
            ctx.quadraticCurveTo(cx + bodyWidth / 2 - 5, bottomY - 5, cx + bodyWidth / 2 - lCurveR - 5, bottomY - 5);
            ctx.closePath();
            const liqGrad = ctx.createLinearGradient(cx, liquidY, cx, bottomY);
            liqGrad.addColorStop(0, `rgba(${lc.r}, ${lc.g}, ${lc.b}, 0.9)`);
            liqGrad.addColorStop(0.5, `rgba(${Math.min(255, lc.r + 10)}, ${Math.min(255, lc.g + 10)}, ${Math.min(255, lc.b + 10)}, 0.7)`);
            liqGrad.addColorStop(1, `rgba(${Math.min(255, lc.r + 30)}, ${Math.min(255, lc.g + 30)}, ${Math.min(255, lc.b + 30)}, 0.5)`);
            ctx.fillStyle = liqGrad; ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 255, ${isDark ? 0.5 : 0.7})`;
            ctx.beginPath(); ctx.ellipse(cx, liquidY, bodyWidth / 2 - 8, 5, 0, 0, Math.PI); ctx.fill();
            ctx.restore();

            if (Math.random() < 0.04 && liquidLevelRef.current > 0.1) {
                bubblesRef.current.push({ x: cx + (Math.random() - 0.5) * bodyWidth * 0.6, y: bottomY - 15, size: 2 + Math.random() * 3, speed: 0.6 + Math.random() * 1.2, wobble: Math.random() * Math.PI * 2 });
            }
            bubblesRef.current = bubblesRef.current.filter(b => {
                b.y -= b.speed; b.x += Math.sin(time * 4 + b.wobble) * 0.4; b.size *= 0.997;
                if (b.y < liquidY || b.size < 0.8) return false;
                const bg = ctx.createRadialGradient(b.x - b.size * 0.3, b.y - b.size * 0.3, 0, b.x, b.y, b.size);
                bg.addColorStop(0, 'rgba(255,255,255,0.9)');
                bg.addColorStop(0.5, `rgba(255,255,255,${isDark ? 0.5 : 0.7})`);
                bg.addColorStop(1, `rgba(255,255,255,${isDark ? 0.2 : 0.3})`);
                ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
                return true;
            });
        }

        particlesRef.current.forEach(p => {
            if (p.progress < 1) { p.progress += p.speed; p.x += (p.targetX - p.x) * 0.06; p.y += (p.targetY - p.y) * 0.06; }
            else { p.orbit += p.orbitSpeed; p.x = cx + Math.cos(p.orbit) * (bodyWidth / 2 + 35); p.y = cy + Math.sin(p.orbit) * 25; }
            const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
            pGlow.addColorStop(0, p.color + 'FF'); pGlow.addColorStop(0.4, p.color + '60'); pGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = pGlow; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
            ctx.fillStyle = p.color; ctx.font = `bold ${Math.floor(p.size * 0.9)}px Inter, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.symbol, p.x, p.y);
        });

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - bodyWidth / 2 + curveR, bottomY);
        ctx.quadraticCurveTo(cx - bodyWidth / 2, bottomY, cx - bodyWidth / 2, bottomY - curveR);
        ctx.lineTo(cx - bodyWidth / 2, bodyTopY); ctx.lineTo(cx - neckWidth / 2, neckBottomY);
        ctx.lineTo(cx - neckWidth / 2, neckTopY); ctx.lineTo(cx - rimWidth / 2, neckTopY);
        ctx.lineTo(cx - rimWidth / 2, neckTopY - rimHeight); ctx.lineTo(cx + rimWidth / 2, neckTopY - rimHeight);
        ctx.lineTo(cx + rimWidth / 2, neckTopY); ctx.lineTo(cx + neckWidth / 2, neckTopY);
        ctx.lineTo(cx + neckWidth / 2, neckBottomY); ctx.lineTo(cx + bodyWidth / 2, bodyTopY);
        ctx.lineTo(cx + bodyWidth / 2, bottomY - curveR);
        ctx.quadraticCurveTo(cx + bodyWidth / 2, bottomY, cx + bodyWidth / 2 - curveR, bottomY);
        ctx.closePath();
        const sheenGrad = ctx.createLinearGradient(cx - bodyWidth / 2, cy, cx + bodyWidth / 2, cy);
        if (isDark) { sheenGrad.addColorStop(0, 'rgba(255,255,255,0.08)'); sheenGrad.addColorStop(0.1, 'rgba(255,255,255,0.03)'); sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0)'); sheenGrad.addColorStop(0.9, 'rgba(255,255,255,0.03)'); sheenGrad.addColorStop(1, 'rgba(255,255,255,0.1)'); }
        else { sheenGrad.addColorStop(0, 'rgba(255,255,255,0.4)'); sheenGrad.addColorStop(0.15, 'rgba(255,255,255,0.15)'); sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.05)'); sheenGrad.addColorStop(0.85, 'rgba(255,255,255,0.15)'); sheenGrad.addColorStop(1, 'rgba(255,255,255,0.35)'); }
        ctx.fillStyle = sheenGrad; ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; ctx.lineWidth = 6; ctx.stroke();
        ctx.restore();

        liquidLevelRef.current += (targetLiquidLevelRef.current - liquidLevelRef.current) * 0.03;
        glowIntensityRef.current = 1 + Math.sin(time * 3) * 0.12;
    }, [theme]);

    useEffect(() => {
        const animate = () => { drawFlask(); animationIdRef.current = requestAnimationFrame(animate); };
        animate();
        return () => { if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current); };
    }, [drawFlask]);

    useEffect(() => {
        const targetParticles = selectedElements.map(e => {
            const el = elements[e];
            return { symbol: el.symbol, color: el.color };
        });
        targetParticles.forEach((tp, i) => {
            if (!particlesRef.current[i] || particlesRef.current[i].symbol !== tp.symbol) {
                const p = createParticle(tp.symbol, tp.color);
                if (p) particlesRef.current[i] = p;
            }
        });
        particlesRef.current = particlesRef.current.slice(0, targetParticles.length);
    }, [selectedElements, createParticle]);

    const toggleElement = useCallback((elementKey) => {
        if (isExperimentRunning) return;
        setSelectedElements(prev => {
            const index = prev.indexOf(elementKey);
            if (index > -1) return prev.filter(e => e !== elementKey);
            if (prev.length < 4) return [...prev, elementKey];
            return prev;
        });
    }, [isExperimentRunning]);

    const runExperiment = useCallback(() => {
        if (selectedElements.length < 2 || isExperimentRunning) return;
        setIsExperimentRunning(true);
        particlesRef.current.forEach(p => { p.progress = 1; p.targetX = 0; p.targetY = 0; });
        const sorted = [...selectedElements].sort();
        const key = sorted.map(e => elements[e].symbol).join('-');
        const reverseKey = [...sorted].reverse().map(e => elements[e].symbol).join('-');
        const result = reactions[key] || reactions[reverseKey];
        targetLiquidLevelRef.current = 0.7;
        setTimeout(() => {
            if (result) {
                const col = { water: { r: 59, g: 130, b: 246 }, co2: { r: 156, g: 163, b: 175 }, methane: { r: 245, g: 158, b: 11 }, ammonia: { r: 139, g: 92, b: 246 } };
                targetLiquidColorRef.current = col[result.key] || { r: 16, g: 185, b: 129 };
                setCurrentResult(result); setHasResult(true);
            } else {
                targetLiquidColorRef.current = { r: 120, g: 53, b: 15 };
                setCurrentResult({ formula: '?', key: 'noReaction' }); setHasResult(true);
            }
        }, 800);
        setTimeout(() => { particlesRef.current = []; setIsExperimentRunning(false); }, 1500);
    }, [selectedElements, isExperimentRunning]);

    const resetSelection = useCallback(() => {
        setSelectedElements([]); setCurrentResult(null); setHasResult(false);
        setIsExperimentRunning(false); particlesRef.current = []; bubblesRef.current = [];
        targetLiquidLevelRef.current = 0.4; targetLiquidColorRef.current = { r: 59, g: 130, b: 246 };
        liquidLevelRef.current = 0.4; liquidColorRef.current = { r: 59, g: 130, b: 246 };
    }, []);

    const newExperiment = useCallback(() => {
        setSelectedElements([]); setCurrentResult(null); setHasResult(false);
        setIsExperimentRunning(false); particlesRef.current = []; bubblesRef.current = [];
        targetLiquidLevelRef.current = 0.4;
    }, []);

    return (
        <div className="lab-container" style={{ padding: '24px 0', gap: '16px' }}>
            <div className="elements-panel">
                <div>
                    <h3 className="panel-title">{t('elements.title')}</h3>
                    <p className="panel-subtitle">{t('elements.subtitle')}</p>
                </div>
                <div className="elements-grid">
                    {Object.entries(elements).map(([key, el]) => (
                        <div key={key} className={`element-card ${selectedElements.includes(key) ? 'selected' : ''}`} onClick={() => toggleElement(key)}>
                            <span className="element-number">{el.number}</span>
                            <span className="element-symbol">{el.symbol}</span>
                            <span className="element-name">{language === 'ru' ? el.name : el.nameEn}</span>
                        </div>
                    ))}
                </div>
                <div className="selection-display">
                    <div className="selection-label">{t('selection.label')}</div>
                    <div className="selection-formula">{selectedElements.map(e => elements[e]?.symbol).join(' + ') || '—'}</div>
                </div>
            </div>

            <div className="flask-area">
                <div className="flask-header">
                    <h2 className="flask-title">{t('flask.title')}</h2>
                    <button className="experiment-btn" disabled={selectedElements.length < 2 || isExperimentRunning} onClick={runExperiment}>
                        {t('experiment.btn')}
                    </button>
                </div>
                <div className="flask-canvas-container">
                    <canvas ref={canvasRef} id="flaskCanvas"></canvas>
                </div>
            </div>

            <div className={`result-panel ${hasResult ? 'has-result' : ''}`}>
                <div className="result-content">
                    <div className="result-label">{t('result.label')}</div>
                    {currentResult ? (
                        <>
                            <div className="result-title">{getResultTranslation(`result.${currentResult.key}`)}</div>
                            <div className="result-formula">{currentResult.formula !== '?' ? currentResult.formula : ''}</div>
                            <div className="result-description">{getResultTranslation(`result.${currentResult.key}.desc`)}</div>
                        </>
                    ) : (
                        <div className="result-title"><span className="result-empty">{t('result.empty')}</span></div>
                    )}
                </div>
                <div className="control-btns">
                    <button className="btn-secondary" onClick={resetSelection}>{t('btn.reset')}</button>
                    <button className="btn-secondary" onClick={newExperiment}>{t('btn.new')}</button>
                </div>
            </div>
        </div>
    );
}