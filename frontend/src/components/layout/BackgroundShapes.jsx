import React, { useEffect, useRef } from 'react';

const styles = `
.background-shapes-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    background: #020617; /* Deep Navy base */
}

.gradient-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(140px);
    pointer-events: none;
    mix-blend-mode: lighten;
    will-change: transform;
}

.orb-1 {
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(194, 65, 12, 0.45) 0%, transparent 70%);
    top: -20%;
    right: -20%;
}

.orb-2 {
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(124, 45, 18, 0.4) 0%, transparent 70%);
    bottom: -20%;
    left: -20%;
}

.orb-3 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(234, 88, 12, 0.35) 0%, transparent 70%);
    top: 30%;
    left: 20%;
}

.orb-4 {
    width: 550px;
    height: 550px;
    background: radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, transparent 70%);
    top: 10%;
    right: 10%;
}

.orb-5 {
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
    bottom: 10%;
    right: 20%;
}

.grid-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
        linear-gradient(rgba(251, 146, 60, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(251, 146, 60, 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 1;
}

.noise-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.015;
    pointer-events: none;
    z-index: 2;
    filter: contrast(150%) brightness(50%);
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
`;

export default function BackgroundShapes() {
    const orbRefs = useRef([]);
    const timeRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationsRef = useRef([]);

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.id = 'background-shapes-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);

        animationsRef.current = Array.from({ length: 5 }, () => ({
            speedX: 0.3 + Math.random() * 0.4,
            speedY: 0.2 + Math.random() * 0.3,
            offsetX: Math.random() * Math.PI * 2,
            offsetY: Math.random() * Math.PI * 2,
            rangeX: 50 + Math.random() * 60,
            rangeY: 40 + Math.random() * 50
        }));

        const handleMouseMove = (e) => {
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 40;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 40;
        };

        document.addEventListener('mousemove', handleMouseMove);

        let animationId;
        const animate = () => {
            timeRef.current += 0.008;

            orbRefs.current.forEach((orb, i) => {
                if (orb) {
                    const anim = animationsRef.current[i];
                    const moveX = Math.sin(timeRef.current * anim.speedX + anim.offsetX) * anim.rangeX + mouseRef.current.x * (0.3 + i * 0.1);
                    const moveY = Math.cos(timeRef.current * anim.speedY + anim.offsetY) * anim.rangeY + mouseRef.current.y * (0.3 + i * 0.1);
                    orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            const existingStyle = document.getElementById('background-shapes-styles');
            if (existingStyle) {
                document.head.removeChild(existingStyle);
            }
        };
    }, []);

    return (
        <div className="background-shapes-container">
            <div className="gradient-orb orb-1" ref={el => orbRefs.current[0] = el}></div>
            <div className="gradient-orb orb-2" ref={el => orbRefs.current[1] = el}></div>
            <div className="gradient-orb orb-3" ref={el => orbRefs.current[2] = el}></div>
            <div className="gradient-orb orb-4" ref={el => orbRefs.current[3] = el}></div>
            <div className="gradient-orb orb-5" ref={el => orbRefs.current[4] = el}></div>
            <div className="grid-overlay"></div>
            <div className="noise-overlay"></div>
        </div>
    );
}
