import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Snowfall = () => {
    const { isChristmasEnabled } = useTheme();
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isChristmasEnabled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId;

        // Set canvas dimensions
        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Snowflake particles
        const particles = [];
        const particleCount = 100; // Increased count

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * height; // Start spread out
            }

            reset() {
                this.x = Math.random() * width;
                this.y = -10;
                this.speed = 1 + Math.random() * 2;
                this.size = 2 + Math.random() * 3;
                this.sway = Math.random() * 0.5 - 0.25;
                this.opacity = 0.5 + Math.random() * 0.5;
            }

            update() {
                this.y += this.speed;
                this.x += this.sway + Math.sin(this.y * 0.01) * 0.5;

                if (this.y > height) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                // Glow effect
                ctx.shadowBlur = 5;
                ctx.shadowColor = "white";
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isChristmasEnabled]);

    if (!isChristmasEnabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ opacity: 0.8 }}
        />
    );
};

export default Snowfall;
