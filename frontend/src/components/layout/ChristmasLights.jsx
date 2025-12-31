import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ChristmasLights = () => {
    const { isChristmasEnabled } = useTheme();

    if (!isChristmasEnabled) return null;

    return (
        <div className="absolute top-full left-0 w-full flex justify-center pointer-events-none z-50 overflow-hidden"
            style={{ height: '30px' }}>
            <div className="flex gap-4 md:gap-8 px-4" style={{ marginTop: '-15px' }}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="relative flex flex-col items-center">
                        {/* Cord */}
                        <div className="absolute -top-4 w-12 h-6 border-b-2 border-slate-700 rounded-full"
                            style={{ left: '-24px', transform: 'rotate(-5deg)' }} />

                        {/* Bulb Socket */}
                        <div className="w-3 h-3 bg-slate-800 rounded-t-sm" />

                        {/* Bulb */}
                        <div
                            className={`w-4 h-6 rounded-full transition-all duration-300
                ${i % 4 === 0 ? 'bg-red-500 animate-[light-glow-red_1.5s_infinite]' :
                                    i % 4 === 1 ? 'bg-emerald-500 animate-[light-glow-green_1.2s_infinite]' :
                                        i % 4 === 2 ? 'bg-amber-400 animate-[light-glow-gold_1.8s_infinite]' :
                                            'bg-blue-500 animate-[light-glow-blue_2s_infinite]'}
              `}
                            style={{
                                animationDelay: `${i * 0.1}s`,
                                boxShadow: `0 5px 15px ${i % 4 === 0 ? 'rgba(239, 68, 68, 0.5)' :
                                    i % 4 === 1 ? 'rgba(16, 185, 129, 0.5)' :
                                        i % 4 === 2 ? 'rgba(251, 191, 36, 0.5)' :
                                            'rgba(59, 130, 246, 0.5)'}`
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChristmasLights;
