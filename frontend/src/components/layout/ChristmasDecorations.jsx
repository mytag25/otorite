import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Gift, Bell } from 'lucide-react';

const ChristmasDecorations = () => {
    const { isChristmasEnabled } = useTheme();
    // Don't show immediately to prevent layout shift initially
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isChristmasEnabled || !mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Top Right Corner - Hanging Ornaments */}
            <div className="absolute top-0 right-10 flex flex-col items-center animate-[bounce_3s_infinite]">
                <div className="w-0.5 h-32 bg-amber-500/30" />
                <div className="relative group p-2">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all" />
                    <Gift className="w-10 h-10 text-red-500 fill-red-500/20 drop-shadow-lg christmas-gift" strokeWidth={1.5} />
                </div>
            </div>

            <div className="absolute top-0 right-28 flex flex-col items-center animate-[bounce_4s_infinite]" style={{ animationDelay: '1s' }}>
                <div className="w-0.5 h-24 bg-amber-500/30" />
                <div className="relative group p-2">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/40 transition-all" />
                    <Bell className="w-8 h-8 text-amber-500 fill-amber-500/20 drop-shadow-lg christmas-bell" strokeWidth={1.5} />
                </div>
            </div>

            {/* Floating Sparkles - Random Position */}
            <div className="absolute top-1/4 left-10 opacity-60 christmas-star">
                <Sparkles className="w-6 h-6 text-amber-200 fill-amber-200" />
            </div>

            <div className="absolute bottom-1/4 right-20 opacity-40 christmas-star" style={{ animationDelay: '2s' }}>
                <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-200" />
            </div>

            {/* Bottom Left - Tree Graphic (SVG) */}
            <div className="absolute bottom-4 left-4 opacity-10 md:opacity-20 transition-all duration-1000 hover:opacity-40 hover:scale-110 pointer-events-auto cursor-pointer"
                title="Happy Holidays from OTORİTE!">
                <svg width="120" height="150" viewBox="0 0 100 120" className="christmas-tree-icon drop-shadow-2xl">
                    {/* Tree Base */}
                    <path d="M40 100 L60 100 L60 110 L40 110 Z" fill="#5D4037" />
                    {/* Tree Layers */}
                    <path d="M10 100 L50 40 L90 100 Z" fill="#1B5E20" />
                    <path d="M20 70 L50 20 L80 70 Z" fill="#2E7D32" />
                    <path d="M30 40 L50 0 L70 40 Z" fill="#388E3C" />
                    {/* Ornaments */}
                    <circle cx="30" cy="90" r="3" fill="#C62828" className="animate-pulse" />
                    <circle cx="70" cy="90" r="3" fill="#FDD835" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <circle cx="50" cy="70" r="3" fill="#1976D2" className="animate-pulse" style={{ animationDelay: '1s' }} />
                    <circle cx="40" cy="50" r="3" fill="#E91E63" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                    <circle cx="60" cy="50" r="3" fill="#FF9800" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                    {/* Star Top */}
                    <path d="M50 0 L52 7 L59 7 L53 11 L55 18 L50 14 L45 18 L47 11 L41 7 L48 7 Z" fill="#FFD700" className="christmas-star" />
                </svg>
            </div>
        </div>
    );
};

export default ChristmasDecorations;
