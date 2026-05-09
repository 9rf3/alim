import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getAllUsers, getAllCourses } from '../services/firestore';

export default function Hero() {
    const { t } = useLanguage();
    const { firebaseUser } = useAuth();
    const canvasRef = useRef(null);
    const [stats, setStats] = useState({ students: 0, courses: 0, satisfaction: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadStats = async () => {
            try {
                const [users, courses] = await Promise.all([
                    getAllUsers(),
                    getAllCourses(),
                ]);
                if (!mounted) return;
                const activeStudents = users.filter(u => u.role === 'student' && u.status !== 'deleted').length;
                const activeTeachers = users.filter(u => u.role === 'teacher' && u.status !== 'deleted').length;
                setStats({
                    students: activeStudents,
                    teachers: activeTeachers,
                    courses: courses.length,
                    satisfaction: 98,
                });
            } catch (e) {
                console.error('[Hero] Stats error:', e);
            } finally {
                if (mounted) setStatsLoading(false);
            }
        };
        loadStats();
        return () => { mounted = false; };
    }, []);

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

        const colors = {
            primary: '#0A84FF',
            secondary: '#5E5CE6',
            accent: '#BF5AF2',
        };

        const particles = [];
        const particleCount = 35;

        for (let i = 0; i < particleCount; i++) {
            const radius = 120 + Math.random() * 140;
            const angle = (Math.PI * 2 * i) / particleCount;
            particles.push({
                x: canvas.width / 2 + Math.cos(angle) * radius,
                y: canvas.height / 2 + Math.sin(angle) * radius,
                angle: angle,
                radius: radius,
                size: 2 + Math.random() * 3,
                speed: 0.003 + Math.random() * 0.005,
                color: Math.random() > 0.3 ? colors.primary : colors.secondary,
            });
        }

        const animate = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            const cx = w / 2;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);

            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
            gradient.addColorStop(0, '#0A0F1F');
            gradient.addColorStop(0.5, '#070A14');
            gradient.addColorStop(1, '#02040A');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            const glow1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, 300);
            glow1.addColorStop(0, 'rgba(10, 132, 255, 0.06)');
            glow1.addColorStop(1, 'transparent');
            ctx.fillStyle = glow1;
            ctx.fillRect(0, 0, w, h);

            const glow2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, 250);
            glow2.addColorStop(0, 'rgba(94, 92, 230, 0.05)');
            glow2.addColorStop(1, 'transparent');
            ctx.fillStyle = glow2;
            ctx.fillRect(0, 0, w, h);

            time += 0.01;

            particles.forEach((p, i) => {
                p.angle += p.speed;
                p.x = cx + Math.cos(p.angle) * p.radius;
                p.y = cy + Math.sin(p.angle) * p.radius;

                const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                pGlow.addColorStop(0, p.color + '60');
                pGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = pGlow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            });

            drawFlask(ctx, cx, cy, time);

            animationId = requestAnimationFrame(animate);
        };

        const drawFlask = (ctx, cx, cy, time) => {
            const flaskWidth = 140;
            const flaskHeight = 180;
            const neckWidth = 55;
            const neckHeight = 90;

            const glowRadius = 160;
            const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
            glowGrad.addColorStop(0, 'rgba(10, 132, 255, 0.15)');
            glowGrad.addColorStop(0.6, 'rgba(10, 132, 255, 0.05)');
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            const curveR = 25;
            const bottomY = cy + flaskHeight / 2;
            const bodyTopY = cy - flaskHeight / 4;
            const neckBottomY = cy - flaskHeight / 2 - 10;
            const neckTopY = cy - flaskHeight / 2 - neckHeight + 20;

            ctx.moveTo(cx - flaskWidth / 2 + curveR, bottomY);
            ctx.quadraticCurveTo(cx - flaskWidth / 2, bottomY, cx - flaskWidth / 2, bottomY - curveR);
            ctx.lineTo(cx - flaskWidth / 2, bodyTopY);
            ctx.lineTo(cx - neckWidth / 2, neckBottomY);
            ctx.lineTo(cx - neckWidth / 2, neckTopY);
            ctx.lineTo(cx - 27, neckTopY);
            ctx.lineTo(cx - 27, neckTopY - 8);
            ctx.lineTo(cx + 27, neckTopY - 8);
            ctx.lineTo(cx + 27, neckTopY);
            ctx.lineTo(cx + neckWidth / 2, neckTopY);
            ctx.lineTo(cx + neckWidth / 2, neckBottomY);
            ctx.lineTo(cx + flaskWidth / 2, bodyTopY);
            ctx.lineTo(cx + flaskWidth / 2, bottomY - curveR);
            ctx.quadraticCurveTo(cx + flaskWidth / 2, bottomY, cx + flaskWidth / 2 - curveR, bottomY);
            ctx.closePath();

            const glassGrad = ctx.createLinearGradient(cx - flaskWidth / 2, cy, cx + flaskWidth / 2, cy);
            glassGrad.addColorStop(0, 'rgba(10, 132, 255, 0.03)');
            glassGrad.addColorStop(0.5, 'rgba(10, 132, 255, 0.08)');
            glassGrad.addColorStop(1, 'rgba(10, 132, 255, 0.03)');
            ctx.fillStyle = glassGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(94, 92, 230, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            const liquidLevel = 0.5 + Math.sin(time * 2) * 0.05;
            const liquidMaxH = flaskHeight * 0.7;
            const liquidH = liquidMaxH * liquidLevel;
            const liquidY = bodyTopY + flaskHeight * 0.65 - liquidH;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx - flaskWidth / 2 + 20, bottomY - 10);
            ctx.quadraticCurveTo(cx - flaskWidth / 2 + 10, bottomY - 10, cx - flaskWidth / 2 + 10, liquidY);
            ctx.lineTo(cx + flaskWidth / 2 - 10, liquidY);
            ctx.lineTo(cx + flaskWidth / 2 - 10, bottomY - 10);
            ctx.quadraticCurveTo(cx + flaskWidth / 2 - 10, bottomY - 10, cx + flaskWidth / 2 - 20, bottomY - 10);
            ctx.closePath();

            const liqGrad = ctx.createLinearGradient(cx, liquidY, cx, bottomY);
            liqGrad.addColorStop(0, 'rgba(10, 132, 255, 0.9)');
            liqGrad.addColorStop(1, 'rgba(94, 92, 230, 0.7)');
            ctx.fillStyle = liqGrad;
            ctx.fill();

            const bubbleCount = 5;
            for (let i = 0; i < bubbleCount; i++) {
                const bx = cx + Math.sin(time * 3 + i * 1.5) * (flaskWidth / 4);
                const by = liquidY + (liquidH * (0.2 + (i * 0.15) + (Math.sin(time * 2 + i) * 0.1)));
                const bSize = 1.5 + Math.sin(time * 4 + i) * 0.8;
                if (by < liquidY + liquidH && by > liquidY) {
                    ctx.beginPath();
                    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fill();
                }
            }

            ctx.restore();
        };

        animate();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <section className="hero" id="home">
            <div className="hero-glow"></div>
            
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-pulse"></span>
                        <span data-i18n="hero.badge">{t('hero.badge')}</span>
                    </div>
                    
                    <h1 className="hero-title">
                        <span className="title-line">{t('hero.title.line1')}</span>
                        <span className="title-line gradient-text">{t('hero.title.line2')}</span>
                    </h1>
                    
                    <div className="hero-value-message">
                        <p>{t('hero.value')}</p>
                    </div>
                    
                    <p className="hero-description" data-i18n="hero.description">
                        {t('hero.description')}
                    </p>
                    
                    <div className="hero-buttons">
                        <Link to="/signin" className="btn-primary">
                            <span>{t('hero.button.primary')}</span>
                            <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                        <Link to={firebaseUser ? '/cabinet/laboratory' : '/signin'} className="btn-secondary">
                            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="10 8 16 12 10 16" fill="currentColor"/>
                            </svg>
                            <span>{t('hero.button.secondary')}</span>
                        </Link>
                    </div>
                    
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">{statsLoading ? '...' : stats.students.toLocaleString()}</span>
                            <span className="stat-label">{t('hero.stats.students')}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number">{statsLoading ? '...' : `${stats.courses}+`}</span>
                            <span className="stat-label">{t('hero.stats.experiments')}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number">{statsLoading ? '...' : `${stats.satisfaction}%`}</span>
                            <span className="stat-label">{t('hero.stats.satisfaction')}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="particles-container">
                        <canvas ref={canvasRef} id="particles-canvas"></canvas>
                        <div className="particles-glow"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
