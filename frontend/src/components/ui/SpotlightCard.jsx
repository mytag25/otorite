import React, { useRef, useState } from "react";

/**
 * A container that creates a "spotlight" gradient effect tracking the mouse cursor.
 * Enhanced with border glow pulse animation on hover.
 * 
 * Props:
 * - children: The content of the card
 * - className: Additional classes for the container
 * - spotColor: Color of the spotlight (default: amber-500/20)
 * - borderColor: Color of the glowing border (default: white/10)
 */
const SpotlightCard = ({
    children,
    className = "",
    spotColor = "rgba(245, 158, 11, 0.2)",
    borderColor = "rgba(245, 158, 11, 0.15)",
    ...props
}) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        if (props.onMouseMove) props.onMouseMove(e);
    };

    const handleFocus = (e) => {
        setOpacity(1);
        if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e) => {
        setOpacity(0);
        if (props.onBlur) props.onBlur(e);
    };

    const handleMouseEnter = (e) => {
        setOpacity(1);
        setIsHovered(true);
        if (props.onMouseEnter) props.onMouseEnter(e);
    };

    const handleMouseLeave = (e) => {
        setOpacity(0);
        setIsHovered(false);
        if (props.onMouseLeave) props.onMouseLeave(e);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/50 transition-all duration-300 ${isHovered ? 'border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]' : ''} ${className}`}
            {...props}
        >
            {/* Main spotlight gradient - larger and more visible */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-500"
                style={{
                    opacity: opacity * 0.8,
                    background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, ${spotColor}, transparent 40%)`,
                }}
            />

            {/* Secondary glow layer for depth */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-500"
                style={{
                    opacity: opacity * 0.5,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(251, 146, 60, 0.1), transparent 50%)`,
                }}
            />

            {/* Border spotlight effect */}
            <div
                className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-500"
                style={{
                    opacity: opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 40%)`,
                    maskImage: "linear-gradient(black, black)",
                    WebkitMaskImage: "linear-gradient(black, black)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />

            {/* Animated border glow on hover */}
            {isHovered && (
                <div
                    className="pointer-events-none absolute inset-0 rounded-3xl animate-border-glow"
                    style={{
                        background: 'transparent',
                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.15), inset 0 0 15px rgba(245, 158, 11, 0.05)'
                    }}
                />
            )}

            <div className="relative h-full">{children}</div>
        </div>
    );
};

export default SpotlightCard;
