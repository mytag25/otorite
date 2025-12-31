import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, Calendar, Palette, Wrench, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { garageAPI } from '../../services/api';

const GarageCard = ({ vehicle, onLikeChange, showOwner = true, isOwner = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const cardRef = useRef(null);

    const [isLiked, setIsLiked] = useState(vehicle.likes?.includes(user?.id));
    const [likeCount, setLikeCount] = useState(vehicle.likeCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [transform, setTransform] = useState('');
    const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

    // 3D Tilt Effect
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        setGlowPosition({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100
        });
    };

    const handleMouseLeave = () => {
        setTransform('');
        setGlowPosition({ x: 50, y: 50 });
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }

        if (isLiking) return;
        setIsLiking(true);

        try {
            const result = await garageAPI.toggleLike(vehicle.id);
            setIsLiked(result.liked);
            setLikeCount(result.likeCount);
            onLikeChange?.(vehicle.id, result);
        } catch (error) {
            console.error('Like error:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/garage/vehicle/${vehicle.id}`);
    };

    const handleUserClick = (e) => {
        e.stopPropagation();
        navigate(`/garage/user/${vehicle.userId}`);
    };

    return (
        <div
            ref={cardRef}
            className="garage-card group relative rounded-2xl overflow-hidden cursor-pointer"
            style={{
                transform: transform,
                transition: transform ? 'none' : 'transform 0.5s ease-out',
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleCardClick}
        >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl" />

            {/* Dynamic Glow Effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)`,
                }}
            />

            {/* Border Glow */}
            <div className="absolute inset-0 rounded-2xl border border-slate-700/50 group-hover:border-amber-500/30 transition-colors duration-500" />

            {/* Content Container */}
            <div className="relative z-10">
                {/* Image Section */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    {vehicle.image ? (
                        <img
                            src={vehicle.image}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <div className="text-6xl opacity-20">🚗</div>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                    {/* Float Animation for Car */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="car-float-shadow absolute bottom-4 w-3/4 h-4 bg-black/20 rounded-full blur-md" />
                    </div>

                    {/* Year Badge */}
                    <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/50">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-white text-sm font-medium">{vehicle.year}</span>
                        </div>
                    </div>

                    {/* Privacy Badge */}
                    {isOwner && (
                        <div className="absolute top-3 right-3">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-md rounded-full border ${vehicle.isPublic
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-900/80 border-slate-700/50 text-slate-400'
                                }`}>
                                {vehicle.isPublic ? (
                                    <Eye className="w-3.5 h-3.5" />
                                ) : (
                                    <EyeOff className="w-3.5 h-3.5" />
                                )}
                                <span className="text-xs font-medium">
                                    {vehicle.isPublic ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Like Button */}
                    <div className="absolute bottom-3 right-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`group/like rounded-full px-3 py-1.5 h-auto backdrop-blur-md border transition-all duration-300 ${isLiked
                                ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                                : 'bg-slate-900/80 border-slate-700/50 text-slate-300 hover:border-red-500/30 hover:text-red-400'
                                }`}
                        >
                            <Heart className={`w-4 h-4 mr-1.5 transition-transform duration-300 group-hover/like:scale-110 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{likeCount}</span>
                        </Button>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-5">
                    {/* Brand & Model */}
                    <div className="mb-3">
                        <p className="text-amber-500/80 text-[17px] font-medium mb-1 capitalize">{typeof vehicle.brand === 'string' ? vehicle.brand : ''}</p>
                        <h3 className="text-white text-xl font-bold tracking-tight group-hover:text-amber-500 transition-colors duration-300">
                            {typeof vehicle.model === 'string' ? vehicle.model : ''}
                        </h3>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {vehicle.color && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-lg border border-slate-700/30">
                                <Palette className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-300 text-xs">{vehicle.color}</span>
                            </div>
                        )}
                        {vehicle.modifications?.length > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-amber-400 text-xs">{vehicle.modifications.length} mod</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                        {/* Owner */}
                        {showOwner && (
                            <button
                                onClick={handleUserClick}
                                className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors group/user"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium group-hover/user:text-amber-500">
                                    {vehicle.userName || 'Kullanıcı'}
                                </span>
                            </button>
                        )}

                        {/* Comment Count */}
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{vehicle.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Shine Effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: `linear-gradient(
            135deg,
            transparent 20%,
            rgba(255, 255, 255, 0.03) 40%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.03) 60%,
            transparent 80%
          )`,
                    transform: `translateX(${(glowPosition.x - 50) * 2}%)`,
                }}
            />
        </div>
    );
};

export default GarageCard;
