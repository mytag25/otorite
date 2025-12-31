import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ChevronRight, BarChart3, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import SpotlightCard from '../ui/SpotlightCard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';

const VehicleCard = ({ vehicle, brands = [], segments = [] }) => {
  const { getLocalizedText } = useLanguage();
  const { user, toggleFavorite, isFavorite } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const brand = brands.find(b => b.id === vehicle.brand);
  const segment = segments.find(s => s.id === vehicle.segment);
  const overallScore = vehicle.scores?.overall?.score || 0;
  const inCompare = isInCompare(vehicle.id);
  const favorite = isFavorite(vehicle.id);

  // Intersection observer for score bar animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Get all images
  const allImages = [];
  if (vehicle.images && vehicle.images.length > 0) {
    allImages.push(...vehicle.images);
  } else if (vehicle.image) {
    allImages.push(vehicle.image);
  }

  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore >= 7.0) return 'text-emerald-400';
    if (numScore >= 4.0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    const numScore = Number(score);
    if (numScore >= 7.0) return 'bg-emerald-500';
    if (numScore >= 4.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(vehicle.id);
    } else {
      addToCompare(vehicle);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (user) {
      toggleFavorite(vehicle.id);
    } else {
      navigate('/login');
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // 3D Tilt effect handler
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/vehicles/${vehicle.slug || vehicle.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]"
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
    >
      {/* Image with Slider */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800 image-zoom-hover">
        <img
          src={allImages[currentImageIndex] || 'https://via.placeholder.com/400x250'}
          alt={`${brand?.name || vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
        />

        {/* Slider Controls - Only show on hover if multiple images */}
        {allImages.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-amber-500/80 transition-all z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-amber-500/80 transition-all z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        {allImages.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {currentImageIndex + 1}/{allImages.length}
          </div>
        )}

        {/* Dots Indicator */}
        {allImages.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                  ? 'bg-amber-500 w-4'
                  : 'bg-white/50 w-1.5 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={`w-9 h-9 rounded-full backdrop-blur-md transition-all ${favorite
              ? 'bg-red-500/80 text-white hover:bg-red-600/80 animate-scale-bounce'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900/80 hover:text-white'
              }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Score Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 animate-border-glow">
            <Star className={`w-4 h-4 ${getScoreColor(overallScore)} fill-current`} />
            <span className={`font-bold ${getScoreColor(overallScore)}`}>{overallScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Segment Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-slate-900/80 backdrop-blur-md text-slate-300 border-0">
            {segment ? getLocalizedText(segment.name) : vehicle.segment}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand & Model */}
        <div className="mb-4">
          <p className="text-amber-500/80 text-xs font-bold tracking-wider uppercase mb-1">{brand?.name || vehicle.brand}</p>
          <h3 className="text-white text-xl font-bold leading-tight group-hover:text-amber-500 transition-colors">{vehicle.model}</h3>
          <p className="text-slate-500 text-sm mt-1">{vehicle.year}</p>
        </div>

        {/* Quick Scores with Animated Bars */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {['reliability', 'performance', 'design'].map((key) => {
            const score = vehicle.scores?.[key]?.score || 0;
            return (
              <div key={key} className="text-center p-2 bg-slate-800/30 rounded-lg border border-white/5">
                <div className={`text-lg font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5 mb-1.5">
                  {key === 'reliability' ? 'Güv.' : key === 'performance' ? 'Perf.' : 'Tas.'}
                </div>
                {/* Animated Score Bar */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBgColor(score)} transition-all duration-1000 ease-out`}
                    style={{
                      width: isVisible ? `${score * 10}%` : '0%',
                      transitionDelay: '0.3s'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Specs Preview */}
        <div className="flex flex-wrap gap-2 mb-5">
          {vehicle.specs?.power && (
            <span className="text-xs px-2.5 py-1 bg-slate-800/50 text-slate-400 rounded-md border border-white/5 font-medium hover:border-amber-500/30 transition-colors">
              {vehicle.specs.power}
            </span>
          )}
          {vehicle.specs?.acceleration && (
            <span className="text-xs px-2.5 py-1 bg-slate-800/50 text-slate-400 rounded-md border border-white/5 font-medium hover:border-amber-500/30 transition-colors">
              0-100: {vehicle.specs.acceleration}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCompareClick}
            className={`flex-1 rounded-xl transition-all ${inCompare
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse-neon'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            {inCompare ? 'Listede' : 'Karşılaştır'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-4 bg-white/5 text-slate-400 hover:text-amber-500 hover:bg-white/10 border border-transparent rounded-xl group"
          >
            Detay
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};


export default VehicleCard;
