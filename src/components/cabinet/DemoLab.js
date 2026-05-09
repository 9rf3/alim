import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { periodicTable } from '../../data/periodicTable';
import { reactions } from '../../data/reactions';
import '../../styles/demo.css';

const CATEGORIES = [
  { key: 'alkali', label: 'Щелочные металлы' },
  { key: 'alkaline', label: 'Щёлочноземельные металлы' },
  { key: 'transition', label: 'Переходные металлы' },
  { key: 'post-transition', label: 'Постпереходные металлы' },
  { key: 'metalloid', label: 'Металлоиды' },
  { key: 'nonmetal', label: 'Неметаллы' },
  { key: 'halogen', label: 'Галогены' },
  { key: 'noble', label: 'Благородные газы' },
  { key: 'lanthanide', label: 'Лантаноиды' },
  { key: 'actinide', label: 'Актиноиды' },
];

function buildReactionKey(elements) {
  const counts = {};
  elements.forEach(el => {
    counts[el.symbol] = (counts[el.symbol] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sym, cnt]) => `${sym}:${cnt}`)
    .join('-');
}

function getElementCounts(elements) {
  const counts = {};
  elements.forEach(el => {
    counts[el.symbol] = (counts[el.symbol] || 0) + 1;
  });
  return counts;
}

export default function DemoLab() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const canvasRef = useRef(null);
  const searchRef = useRef(null);
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasPremium = userProfile?.subscription === 'standard' || userProfile?.subscription === 'pro' || userProfile?.role === 'admin';

  const elementsByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => { map[c.key] = []; });
    periodicTable.forEach(el => {
      if (map[el.category]) map[el.category].push(el);
    });
    return map;
  }, []);

  const selectedCounts = useMemo(() => getElementCounts(selectedElements), [selectedElements]);

  const uniqueSelected = useMemo(() => {
    const seen = new Set();
    return selectedElements.filter(el => {
      const dup = seen.has(el.symbol);
      seen.add(el.symbol);
      return !dup;
    });
  }, [selectedElements]);

  const filteredElements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return periodicTable.filter(el =>
      el.symbol.toLowerCase().includes(q) ||
      el.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const shownCategories = useMemo(() => {
    if (filteredElements) return null;
    return CATEGORIES;
  }, [filteredElements]);

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
      size: 8 + Math.random() * 4,
      speed: 0.02 + Math.random() * 0.02,
      progress: 0,
      orbit: Math.random() * Math.PI * 2,
      orbitSpeed: 0.01 + Math.random() * 0.02,
      orbitRadius: 80 + Math.random() * 40,
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
    const neckBottomY = cy - bodyHeight / 2 - 10, neckTopY = cy - bodyHeight / 2 - neckHeight + 20;
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
    const targetParticles = uniqueSelected.map(el => ({
      symbol: el.symbol,
      color: el.color,
    }));
    targetParticles.forEach((tp, i) => {
      if (!particlesRef.current[i] || particlesRef.current[i].symbol !== tp.symbol) {
        const p = createParticle(tp.symbol, tp.color);
        if (p) particlesRef.current[i] = p;
      }
    });
    particlesRef.current = particlesRef.current.slice(0, targetParticles.length);
  }, [uniqueSelected, createParticle]);

  const incrementElement = useCallback((el) => {
    if (isExperimentRunning) return;
    if (el.isPremium && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedElements(prev => [...prev, el]);
  }, [isExperimentRunning, hasPremium]);

  const decrementElement = useCallback((el) => {
    if (isExperimentRunning) return;
    setSelectedElements(prev => {
      const idx = [...prev].reverse().findIndex(e => e.symbol === el.symbol);
      if (idx === -1) return prev;
      const actualIdx = prev.length - 1 - idx;
      return prev.filter((_, i) => i !== actualIdx);
    });
  }, [isExperimentRunning]);

  const removeElement = useCallback((el) => {
    if (isExperimentRunning) return;
    setSelectedElements(prev => prev.filter(e => e.symbol !== el.symbol));
  }, [isExperimentRunning]);

  const clearSelection = useCallback(() => {
    if (isExperimentRunning) return;
    setSelectedElements([]);
  }, [isExperimentRunning]);

  const runExperiment = useCallback(() => {
    if (selectedElements.length < 2 || isExperimentRunning) return;
    setIsExperimentRunning(true);
    particlesRef.current.forEach(p => { p.progress = 1; p.targetX = 0; p.targetY = 0; });
    const key = buildReactionKey(selectedElements);
    const result = reactions[key];
    targetLiquidLevelRef.current = 0.7;
    setTimeout(() => {
      if (result) {
        const c = result.color || { r: 16, g: 185, b: 129 };
        targetLiquidColorRef.current = c;
        setCurrentResult(result);
        setHasResult(true);
      } else {
        targetLiquidColorRef.current = { r: 120, g: 53, b: 15 };
        setCurrentResult({
          formula: '?',
          name: 'Реакция не найдена',
          description: 'Попробуйте другую комбинацию элементов или обратитесь к учителю',
          type: 'unknown',
          color: { r: 120, g: 53, b: 15 },
        });
        setHasResult(true);
      }
    }, 800);
    setTimeout(() => { particlesRef.current = []; setIsExperimentRunning(false); }, 1500);
  }, [selectedElements, isExperimentRunning]);

  const resetSelection = useCallback(() => {
    setSelectedElements([]);
    setCurrentResult(null);
    setHasResult(false);
    setIsExperimentRunning(false);
    particlesRef.current = [];
    bubblesRef.current = [];
    targetLiquidLevelRef.current = 0.4;
    targetLiquidColorRef.current = { r: 59, g: 130, b: 246 };
    liquidLevelRef.current = 0.4;
    liquidColorRef.current = { r: 59, g: 130, b: 246 };
  }, []);

  const newExperiment = useCallback(() => {
    setCurrentResult(null);
    setHasResult(false);
    setIsExperimentRunning(false);
    particlesRef.current = [];
    bubblesRef.current = [];
    targetLiquidLevelRef.current = 0.4;
  }, []);

  const typeLabels = {
    synthesis: 'Синтез',
    decomposition: 'Разложение',
    combustion: 'Горение',
    'acid-base': 'Кислотно-основная',
    precipitation: 'Осаждение',
    organic: 'Органическая',
    unknown: 'Неизвестно',
  };

  const searchMatch = (el) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return el.symbol.toLowerCase().includes(q) || el.name.toLowerCase().includes(q);
  };

  return (
    <div className="lab-container">
      <div className="elements-panel">
        <div className="panel-header">
          <h3 className="panel-title">Периодическая таблица</h3>
          <p className="panel-subtitle">
            {hasPremium
              ? 'Все 118 элементов. Нажмите, чтобы добавить в реакцию.'
              : 'H, C, N, O — бесплатно. Подписка открывает все 118.'}
          </p>
        </div>
        <div className="element-search">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={searchRef}
            className="search-input-field"
            type="text"
            placeholder="Поиск элемента…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <div className="periodic-table-scroll">
          {shownCategories && shownCategories.map(cat => (
            <div key={cat.key} className="element-category">
              <div className="category-header">
                <span className="category-label">{cat.label}</span>
                <span className="category-count">{elementsByCategory[cat.key].length}</span>
              </div>
              <div className="elements-grid">
                {elementsByCategory[cat.key].map(el => {
                  const isLocked = el.isPremium && !hasPremium;
                  const count = selectedCounts[el.symbol] || 0;
                  const hidden = searchQuery.trim() && !searchMatch(el);
                  return (
                    <div
                      key={el.symbol}
                      className={`element-card ${count > 0 ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${hidden ? 'hidden' : ''}`}
                      onClick={() => incrementElement(el)}
                      style={{ '--element-color': el.color }}
                    >
                      <span className="element-number">{el.number}</span>
                      <span className="element-symbol" style={{ color: el.color }}>{el.symbol}</span>
                      <span className="element-name">{el.name}</span>
                      {count > 0 && <span className="element-count-badge">{count}</span>}
                      {isLocked && (
                        <div className="element-lock-overlay">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredElements && (
            <div className="element-category">
              <div className="category-header">
                <span className="category-label">Результаты поиска</span>
                <span className="category-count">{filteredElements.length}</span>
              </div>
              <div className="elements-grid">
                {filteredElements.map(el => {
                  const isLocked = el.isPremium && !hasPremium;
                  const count = selectedCounts[el.symbol] || 0;
                  return (
                    <div
                      key={el.symbol}
                      className={`element-card ${count > 0 ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => incrementElement(el)}
                      style={{ '--element-color': el.color }}
                    >
                      <span className="element-number">{el.number}</span>
                      <span className="element-symbol" style={{ color: el.color }}>{el.symbol}</span>
                      <span className="element-name">{el.name}</span>
                      {count > 0 && <span className="element-count-badge">{count}</span>}
                      {isLocked && (
                        <div className="element-lock-overlay">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {filteredElements && filteredElements.length === 0 && (
            <div className="search-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p>Элемент «{searchQuery}» не найден</p>
            </div>
          )}
          {!filteredElements && !shownCategories && null}
        </div>
      </div>

      <div className="flask-area">
        <div className="flask-header">
          <div className="flask-header-left">
            <h2 className="flask-title">Химическая колба</h2>
            {selectedElements.length > 0 && (
              <span className="flask-atom-count">{selectedElements.length} атом{selectedElements.length === 1 ? '' : 'ов'}</span>
            )}
          </div>
          <div className="flask-header-right">
            <button
              className="experiment-btn"
              disabled={selectedElements.length < 2 || isExperimentRunning}
              onClick={runExperiment}
            >
              {isExperimentRunning ? 'Проводится...' : 'Провести реакцию'}
            </button>
          </div>
        </div>
        <div className="flask-canvas-container">
          <canvas ref={canvasRef} id="flaskCanvas"></canvas>
        </div>
        {selectedElements.length > 0 && (
          <div className="active-experiment-panel">
          <div className="experiment-panel-header">
            <span className="experiment-panel-title">Активные реагенты</span>
            <button className="experiment-panel-clear" onClick={clearSelection}>Очистить всё</button>
          </div>
          <div className="experiment-atom-list">
            {uniqueSelected.map(el => {
              const count = selectedCounts[el.symbol];
              return (
                <div key={el.symbol} className="experiment-atom-card" style={{ borderLeftColor: el.color }}>
                  <div className="atom-card-left">
                    <span className="atom-card-symbol" style={{ color: el.color }}>{el.symbol}</span>
                    <div className="atom-card-info">
                      <span className="atom-card-name">{el.name}</span>
                      <span className="atom-card-formula">
                        {el.symbol}{count > 1 && <sub>{count}</sub>}
                      </span>
                    </div>
                  </div>
                  <div className="atom-card-controls">
                    <button
                      className="qty-btn"
                      onClick={() => decrementElement(el)}
                      disabled={isExperimentRunning}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span className="qty-value">{count}</span>
                    <button
                      className="qty-btn"
                      onClick={() => incrementElement(el)}
                      disabled={isExperimentRunning}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <button
                      className="atom-remove-btn"
                      onClick={() => removeElement(el)}
                      disabled={isExperimentRunning}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      <div className={`result-panel ${hasResult ? 'has-result' : ''}`}>
        <div className="result-content">
          <div className="result-label">Результат реакции</div>
          {currentResult ? (
            <>
              <div className="result-title">{currentResult.name}</div>
              {currentResult.formula && currentResult.formula !== '?' && (
                <div className="result-formula">{currentResult.formula}</div>
              )}
              {currentResult.type && currentResult.type !== 'unknown' && (
                <div className="result-type">
                  <span className="result-type-badge">{typeLabels[currentResult.type] || currentResult.type}</span>
                </div>
              )}
              <div className="result-description">{currentResult.description}</div>
              {currentResult.energy !== undefined && currentResult.energy !== 0 && (
                <div className="result-energy">
                  {currentResult.energy > 0 ? 'Экзотермическая' : 'Эндотермическая'}
                  {' '}({Math.abs(currentResult.energy)} кДж/моль)
                </div>
              )}
            </>
          ) : (
            <div className="result-title">
              <span className="result-empty">Добавьте 2+ элемента и проведите реакцию</span>
            </div>
          )}
        </div>
        <div className="control-btns">
          <button className="btn-secondary" onClick={resetSelection}>Сбросить всё</button>
          <button className="btn-secondary" onClick={newExperiment}>Новый опыт</button>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="upgrade-modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="upgrade-modal-title">Премиум-элемент</h3>
            <p className="upgrade-modal-text">
              Для доступа ко всем 118 элементам периодической таблицы необходима подписка Standard или Pro.
            </p>
            <div className="upgrade-modal-features">
              <div className="upgrade-feature">✓ Все 118 элементов</div>
              <div className="upgrade-feature">✓ 190+ химических реакций</div>
              <div className="upgrade-feature">✓ Сохранение экспериментов</div>
              <div className="upgrade-feature">✓ Доступ к проектам</div>
            </div>
            <button className="experiment-btn upgrade-btn" onClick={() => setShowUpgradeModal(false)}>
              Оформить подписку
            </button>
            <button className="btn-secondary upgrade-cancel" onClick={() => setShowUpgradeModal(false)}>
              Остаться на бесплатном
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
