import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, BarChart3, Star, ChevronLeft, ChevronRight,
  Maximize2, X, Check, Zap, Shield, Cpu, Palette, Gauge, Clock,
  Fuel, Route, ExternalLink, Share2, Users, Wrench, Settings, Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { vehiclesAPI, staticAPI } from '../../services/api';
import BackgroundShapes from '../layout/BackgroundShapes';
import ParticleField from '../layout/ParticleField';
import ReviewSection from './ReviewSection';
import useTitle from '../../hooks/useTitle';
import VehicleSchema from '../seo/VehicleSchema';

// Top Gear style tabs
const reviewTabs = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'driving', label: 'DRIVING' },
  { id: 'interior', label: 'INTERIOR' },
  { id: 'buying', label: 'BUYING' },
  { id: 'reliability', label: 'RELIABILITY' },
  { id: 'specs', label: 'SPECS & PRICES' }
];

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLocalizedText, language } = useLanguage();
  const { user, toggleFavorite, isFavorite } = useAuth();
  const { addToCompare, isInCompare } = useCompare();
  const [vehicle, setVehicle] = useState(null);

  // Marka ismini baş harfi büyük olacak şekilde formatla (BMW gibi özel durumlar için hepsi büyük)
  const formatBrand = (brand) => {
    if (!brand) return '';
    if (brand.toLowerCase() === 'bmw') return 'BMW';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  useTitle(vehicle ? `${formatBrand(vehicle.brand)} ${vehicle.model}` : 'Yükleniyor...');
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [rivals, setRivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [isScoreVisible, setIsScoreVisible] = useState(true);
  const scoreRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [vehicleData, brandsData, segmentsData] = await Promise.all([
          vehiclesAPI.getById(id),
          staticAPI.getBrands(),
          staticAPI.getSegments()
        ]);
        setVehicle(vehicleData);
        setBrands(brandsData);
        setSegments(segmentsData);

        if (vehicleData.segment) {
          const rivalsData = await vehiclesAPI.list({ segment: vehicleData.segment, limit: 6 });
          setRivals(rivalsData.vehicles.filter(v => v.id !== id).slice(0, 4));
        }
      } catch (err) {
        setError('Araç bulunamadı');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [id]);

  // Score bar animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsScoreVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (scoreRef.current) observer.observe(scoreRef.current);
    return () => observer.disconnect();
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative">
        <ParticleField />
        <div className="text-center z-10">
          <div className="w-20 h-20 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-slate-400 font-medium">Araç Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative">
        <ParticleField />
        <div className="text-center z-10 animate-fade-scale-in">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Araç bulunamadı</h2>
          <Button onClick={() => navigate('/vehicles')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">
            Araçlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const brand = brands.find(b => b.id === vehicle.brand);
  const segment = segments.find(s => s.id === vehicle.segment);
  const brandName = brand?.name || vehicle.brand;
  const segmentName = segment ? getLocalizedText(segment.name) : vehicle.segment;

  const allImages = [];
  if (vehicle.images && vehicle.images.length > 0) {
    allImages.push(...vehicle.images);
  } else if (vehicle.image) {
    allImages.push(vehicle.image);
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

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

  const favorite = isFavorite(vehicle.id);
  const inCompare = isInCompare(vehicle.id);
  const overallScore = vehicle.scores?.overall?.score || 0;
  const strengths = getLocalizedText(vehicle.strengths) || [];
  const weaknesses = getLocalizedText(vehicle.weaknesses) || [];

  return (
    <div className="min-h-screen bg-slate-950 relative">
      <VehicleSchema vehicle={vehicle} />
      <ParticleField />
      <BackgroundShapes />

      {/* HERO HEADER */}
      <div className="relative pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Geri Dön</span>
          </button>

          {/* Top Row: CAR REVIEW label */}
          <div className="flex items-center gap-2 mb-1 animate-in-up">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-lg flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">Araç Değerlendirme</span>
          </div>

          {/* Car Title + Score Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 animate-in-up delay-100">
            {/* Left: Car Name */}
            <div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter">
                <span className="animate-gradient-text">{brandName}</span> {vehicle.model}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <Badge className="bg-slate-800/80 text-slate-300 border-slate-700 px-4 py-1.5 text-sm">
                  {segmentName}
                </Badge>
                <Badge className="bg-slate-800/80 text-slate-300 border-slate-700 px-4 py-1.5 text-sm">
                  {vehicle.year}
                </Badge>
              </div>
            </div>

            {/* Right: Score - Premium Design */}
            <div className="relative flex-shrink-0 animate-in-up delay-200">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
              <div className="relative glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                  OTORİTE Puanı
                </div>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-6xl md:text-7xl font-black text-white">{Math.round(overallScore)}</span>
                  <span className="text-2xl md:text-3xl font-bold text-amber-400">/10</span>
                </div>
                <div className="text-center mt-3">
                  <span className={`text-sm font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore >= 9 ? 'Mükemmel' : overallScore >= 8 ? 'Çok İyi' : overallScore >= 7 ? 'İyi' : 'Orta'}
                  </span>
                </div>
                <div className="flex justify-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(overallScore / 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Author & Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-in-up delay-300">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">OTORİTE Ekibi</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>Güncelleme: {new Date(vehicle.updatedAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => user ? toggleFavorite(vehicle.id) : navigate('/login')}
                className={`rounded-full w-11 h-11 transition-all ${favorite ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-11 h-11 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => addToCompare(vehicle)}
                className={`rounded-xl px-6 h-11 font-bold transition-all ${inCompare
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {inCompare ? 'Listede' : 'Karşılaştır'}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs - Enhanced */}
          <div className="flex overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 animate-in-up delay-400">
            <div className="flex bg-slate-900/50 backdrop-blur rounded-2xl p-1 border border-slate-800">
              {reviewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 font-bold text-sm tracking-wider whitespace-nowrap transition-all rounded-xl ${activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE GALLERY - Enhanced */}
      <div className="bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 group image-zoom-hover">
            <img
              src={allImages[currentImageIndex] || 'https://via.placeholder.com/1920x1080'}
              alt={`${brandName} ${vehicle.model}`}
              className="w-full h-full object-cover transition-transform duration-700"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/50 hover:bg-amber-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/50 hover:bg-amber-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-4 text-white font-bold text-lg bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
              {currentImageIndex + 1} / {allImages.length}
            </div>

            <button
              onClick={() => setFullscreenImage(true)}
              className="absolute bottom-4 right-4 w-12 h-12 bg-black/50 hover:bg-amber-500/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-white transition-all"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {allImages.length > 1 && (
            <div className="mt-4 flex justify-center gap-3 overflow-x-auto py-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden transition-all ${index === currentImageIndex ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950' : 'opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8 relative z-20">
            {/* OVERVIEW Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in-up">
                {/* Quick Score Summary */}
                <div ref={scoreRef} className="glass-panel rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-amber-500" />
                    Hızlı Puanlar
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[
                      { key: 'reliability', label: 'Güvenilirlik', icon: Shield },
                      { key: 'performance', label: 'Performans', icon: Zap },
                      { key: 'technology', label: 'Teknoloji', icon: Cpu },
                      { key: 'design', label: 'Tasarım', icon: Palette },
                      { key: 'valueForMoney', label: 'Değer', icon: Star }
                    ].map((item, idx) => {
                      const score = vehicle.scores?.[item.key]?.score || 0;
                      return (
                        <div key={item.key} className="text-center group" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="w-12 h-12 mx-auto mb-3 bg-slate-800/50 rounded-xl flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                            <item.icon className="w-6 h-6 text-amber-500" />
                          </div>
                          <div className={`text-3xl font-black ${getScoreColor(score)}`}>{score.toFixed(1)}</div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">{item.label}</div>
                          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBgColor(score)}`}
                              style={{ width: isScoreVisible ? `${score * 10}%` : '0%', transitionDelay: `${idx * 100}ms` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verdict */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 shadow-2xl animate-in-up delay-100">
                  <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    SONUÇ
                  </h2>
                  <blockquote className="text-xl md:text-2xl font-bold italic border-l-4 border-amber-500 pl-6 mb-8 text-white">
                    "{vehicle.editorial?.verdict
                      ? getLocalizedText(vehicle.editorial.verdict)
                      : overallScore >= 8
                        ? `${brandName} ${vehicle.model} için iyi bir alternatif bulmak zor.`
                        : overallScore >= 7
                          ? `${brandName} ${vehicle.model} segmentinde güçlü bir oyuncu.`
                          : `${brandName} ${vehicle.model} bazı alanlarda geliştirilmeli.`}"
                  </blockquote>
                  <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                    {vehicle.editorial?.summary
                      ? getLocalizedText(vehicle.editorial.summary)
                      : `${vehicle.year} model ${brandName} ${vehicle.model}, ${segmentName} segmentinde ${overallScore >= 8 ? ' öne çıkan bir seçenek' : ' dikkat çeken bir alternatif'}. ${vehicle.specs?.power ? `${vehicle.specs.power} güç üreten motor seçeneği ile` : ''} ${vehicle.specs?.acceleration ? `0-100 km/h'ye ${vehicle.specs.acceleration}'de ulaşıyor.` : ''} ${vehicle.scores?.drivingExperience?.score >= 8 ? 'Sürüş dinamikleri açısından segmentinin en iyileri arasında.' : ''}`
                    }
                  </p>

                  {/* Pros & Cons */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20">
                      <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2 text-lg">
                        <Check className="w-5 h-5" /> ARTILAR
                      </h3>
                      <ul className="space-y-3">
                        {strengths.slice(0, 4).map((s, i) => (
                          <li key={i} className="text-emerald-200 flex items-start gap-2">
                            <Check className="w-4 h-4 mt-1 flex-shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
                      <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2 text-lg">
                        <X className="w-5 h-5" /> EKSİLER
                      </h3>
                      <ul className="space-y-3">
                        {weaknesses.slice(0, 4).map((w, i) => (
                          <li key={i} className="text-red-200 flex items-start gap-2">
                            <X className="w-4 h-4 mt-1 flex-shrink-0" />{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* All Scores - Enhanced */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 shadow-2xl animate-in-up delay-200">
                  <h2 className="text-2xl font-black uppercase mb-8 text-white">TÜM PUANLAR</h2>
                  <div className="space-y-5">
                    {[
                      { key: 'reliability', label: 'Güvenilirlik' },
                      { key: 'buildQuality', label: 'Yapı Kalitesi' },
                      { key: 'performance', label: 'Performans' },
                      { key: 'drivingExperience', label: 'Sürüş Deneyimi' },
                      { key: 'technology', label: 'Teknoloji' },
                      { key: 'safety', label: 'Güvenlik' },
                      { key: 'costOfOwnership', label: 'Sahip Olma Maliyeti' },
                      { key: 'design', label: 'Tasarım' },
                      { key: 'valueForMoney', label: 'Fiyat/Performans' }
                    ].map((item, idx) => {
                      const score = vehicle.scores?.[item.key]?.score || 0;
                      const justification = vehicle.scores?.[item.key]?.justification;
                      return (
                        <div key={item.key} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-300">{item.label}</span>
                            <span className={`font-black text-xl ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
                          </div>
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBgColor(score)}`}
                              style={{ width: isScoreVisible ? `${score * 10}%` : '0%', transitionDelay: `${idx * 50}ms` }}
                            />
                          </div>
                          {justification && (
                            <p className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">{getLocalizedText(justification)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rivals Section */}
                {rivals.length > 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 shadow-2xl animate-in-up delay-300">
                    <h2 className="text-2xl font-black uppercase mb-6 text-white">RAKİPLERİ KİMLER?</h2>
                    <p className="text-slate-400 mb-8">
                      {segmentName} segmentinde {brandName} {vehicle.model}'in karşısına çıkan rakipler.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {rivals.map((rival, idx) => {
                        const rivalBrand = brands.find(b => b.id === rival.brand);
                        const rivalScore = rival.scores?.overall?.score || 0;
                        return (
                          <Link
                            key={rival.id}
                            to={`/vehicles/${rival.slug || rival.id}`}
                            className="group bg-slate-800/50 rounded-2xl overflow-hidden hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-1"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <div className="aspect-video overflow-hidden">
                              <img
                                src={rival.images?.[0] || rival.image}
                                alt={`${rivalBrand?.name} ${rival.model}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-4">
                              <div className="font-bold text-sm text-slate-200 group-hover:text-amber-400 transition-colors">
                                {rivalBrand?.name || rival.brand} {rival.model}
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <Star className={`w-4 h-4 ${getScoreColor(rivalScore)} fill-current`} />
                                <span className={`font-bold ${getScoreColor(rivalScore)}`}>{rivalScore.toFixed(1)}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Best For */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-8 shadow-2xl shadow-amber-500/20 animate-in-up delay-400">
                  <h3 className="font-black text-xl uppercase mb-3">KİME UYGUN?</h3>
                  <p className="text-amber-50 text-lg">{getLocalizedText(vehicle.bestFor) || `${segmentName} segmentinde kalite arayanlar için ideal.`}</p>
                </div>
              </div>
            )}

            {/* DRIVING Tab */}
            {activeTab === 'driving' && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl animate-in-up">
                <h2 className="text-2xl font-black uppercase text-white">SÜRÜŞ DENEYİMİ</h2>
                {['performance', 'drivingExperience'].map((key, idx) => {
                  const score = vehicle.scores?.[key]?.score || 0;
                  const justification = vehicle.scores?.[key]?.justification;
                  const labels = { performance: 'Performans', drivingExperience: 'Sürüş Hissi' };
                  return (
                    <div key={key} className="bg-slate-800/50 rounded-2xl p-6" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-slate-300 text-lg">{labels[key]}</span>
                        <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div className={`h-full rounded-full ${getScoreBgColor(score)}`} style={{ width: `${score * 10}%` }} />
                      </div>
                      {justification && <p className="text-slate-400">{getLocalizedText(justification)}</p>}
                    </div>
                  );
                })}
                <div className="bg-slate-800/50 rounded-2xl p-6">
                  <h3 className="font-bold mb-6 text-lg text-white">Teknik Veriler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {vehicle.specs?.power && <div className="text-center"><span className="text-slate-500 text-sm block mb-1">Güç</span><div className="font-black text-xl text-slate-200">{vehicle.specs.power}</div></div>}
                    {vehicle.specs?.torque && <div className="text-center"><span className="text-slate-500 text-sm block mb-1">Tork</span><div className="font-black text-xl text-slate-200">{vehicle.specs.torque}</div></div>}
                    {vehicle.specs?.acceleration && <div className="text-center"><span className="text-slate-500 text-sm block mb-1">0-100</span><div className="font-black text-xl text-slate-200">{vehicle.specs.acceleration}</div></div>}
                    {vehicle.specs?.topSpeed && <div className="text-center"><span className="text-slate-500 text-sm block mb-1">Max Hız</span><div className="font-black text-xl text-slate-200">{vehicle.specs.topSpeed}</div></div>}
                  </div>
                </div>
              </div>
            )}

            {/* INTERIOR Tab */}
            {activeTab === 'interior' && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl animate-in-up">
                <h2 className="text-2xl font-black uppercase text-white">İÇ MEKAN</h2>
                {['buildQuality', 'technology', 'design'].map((key, idx) => {
                  const score = vehicle.scores?.[key]?.score || 0;
                  const justification = vehicle.scores?.[key]?.justification;
                  const labels = { buildQuality: 'Yapı Kalitesi', technology: 'Teknoloji', design: 'Tasarım' };
                  return (
                    <div key={key} className="bg-slate-800/50 rounded-2xl p-6" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-slate-300 text-lg">{labels[key]}</span>
                        <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div className={`h-full rounded-full ${getScoreBgColor(score)}`} style={{ width: `${score * 10}%` }} />
                      </div>
                      {justification && <p className="text-slate-400">{getLocalizedText(justification)}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* BUYING Tab */}
            {activeTab === 'buying' && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl animate-in-up">
                <h2 className="text-2xl font-black uppercase text-white">SATIN ALMA REHBERİ</h2>
                {['costOfOwnership', 'valueForMoney', 'reliability', 'safety'].map((key, idx) => {
                  const score = vehicle.scores?.[key]?.score || 0;
                  const justification = vehicle.scores?.[key]?.justification;
                  const labels = { costOfOwnership: 'Sahip Olma Maliyeti', valueForMoney: 'Fiyat/Performans', reliability: 'Güvenilirlik', safety: 'Güvenlik' };
                  return (
                    <div key={key} className="bg-slate-800/50 rounded-2xl p-6" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-slate-300 text-lg">{labels[key]}</span>
                        <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div className={`h-full rounded-full ${getScoreBgColor(score)}`} style={{ width: `${score * 10}%` }} />
                      </div>
                      {justification && <p className="text-slate-400">{getLocalizedText(justification)}</p>}
                    </div>
                  );
                })}
                <div className="bg-amber-900/20 rounded-2xl p-6 border border-amber-500/20">
                  <h3 className="font-bold text-amber-400 mb-3 text-lg">KİME UYGUN?</h3>
                  <p className="text-amber-200">{getLocalizedText(vehicle.bestFor) || 'Bilgi mevcut değil'}</p>
                </div>
              </div>
            )}

            {/* RELIABILITY Tab */}
            {activeTab === 'reliability' && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl animate-in-up">
                <div>
                  <h2 className="text-2xl font-black uppercase mb-2 text-white">GÜVENİLİRLİK & KRONİK SORUNLAR</h2>
                  <p className="text-slate-400 text-sm">Uzun vadeli kullanım raporları ve teknik inceleme sonuçları.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { key: 'engine', label: 'MOTOR', icon: Wrench, color: 'amber' },
                    { key: 'transmission', label: 'ŞANZIMAN', icon: Settings, color: 'blue' },
                    { key: 'electronics', label: 'ELEKTRONİK', icon: Zap, color: 'cyan' },
                    { key: 'materials', label: 'MALZEME & KALİTE', icon: Shield, color: 'emerald' }
                  ].map((item, idx) => (
                    <div key={item.key} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 bg-${item.color}-500/10 rounded-xl flex items-center justify-center text-${item.color}-500`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-tight text-white">{item.label}</h3>
                      </div>
                      <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                        {vehicle.reliability_details?.[item.key]?.tr || vehicle.reliability_details?.[item.key]?.en
                          ? getLocalizedText(vehicle.reliability_details[item.key])
                          : 'Bu model için bildirilmiş belirgin bir kronik sorun bulunmamaktadır.'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-8 overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="font-black text-amber-400 text-sm uppercase mb-2">EDİTÖRLERİN GÜVEN NOTU</h4>
                      <p className="text-slate-300">
                        {vehicle.reliability_details?.editor_note?.tr || vehicle.reliability_details?.editor_note?.en
                          ? getLocalizedText(vehicle.reliability_details.editor_note)
                          : (vehicle.scores?.reliability?.score >= 8
                            ? 'Bu araç, segmentindeki en güvenilir seçeneklerden biri olarak değerlendirilmektedir.'
                            : vehicle.scores?.reliability?.score >= 6
                              ? 'Genel olarak güvenilir bir tercih olsa da düzenli bakım ve bazı hassas noktalara dikkat edilmesi önerilir.'
                              : 'Uzun vadeli kullanımda yüksek maliyetli sorunlar çıkarma potansiyeli yüksektir.')}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black">{vehicle.scores?.reliability?.score?.toFixed(1) || '0.0'}</span>
                      <span className="text-amber-400 font-bold text-xl">/10</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SPECS Tab */}
            {activeTab === 'specs' && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-100 rounded-3xl p-8 md:p-10 shadow-2xl animate-in-up">
                <h2 className="text-2xl font-black uppercase mb-8 text-white">TEKNİK ÖZELLİKLER</h2>
                <div className="bg-slate-800/40 rounded-2xl overflow-hidden border border-slate-800">
                  <table className="w-full">
                    <tbody>
                      {[
                        { label: 'Motor', value: vehicle.specs?.engine, icon: Fuel },
                        { label: 'Güç', value: vehicle.specs?.power, icon: Zap },
                        { label: 'Tork', value: vehicle.specs?.torque, icon: Gauge },
                        { label: '0-100 km/h', value: vehicle.specs?.acceleration, icon: Clock },
                        { label: 'Maksimum Hız', value: vehicle.specs?.topSpeed, icon: Route },
                      ].filter(spec => spec.value).map((spec, index) => (
                        <tr key={spec.label} className={`${index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/30'} hover:bg-slate-700/50 transition-colors`}>
                          <td className="px-6 py-5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                              <spec.icon className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-slate-400 font-medium">{spec.label}</span>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-xl text-slate-200">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 relative z-10">
            {/* Overall Score Card */}
            <div className="glass-panel rounded-3xl p-8 text-center sticky top-24 animate-in-up z-50">
              <div className="text-7xl font-black text-white mb-2">{overallScore.toFixed(1)}</div>
              <div className="text-amber-400 font-bold text-lg">/ 10 OTORİTE Puanı</div>
              <div className="mt-4 text-slate-400">
                {overallScore >= 9 ? 'Mükemmel' : overallScore >= 8 ? 'Çok İyi' : overallScore >= 7 ? 'İyi' : 'Orta'}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <Button
                  onClick={() => navigate('/compare')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl h-12"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Karşılaştırma Yap
                </Button>
              </div>
            </div>

            {/* Rivals Sidebar */}
            {rivals.length > 0 && (
              <div className="glass-panel rounded-3xl p-6 animate-in-up delay-100">
                <h3 className="font-bold text-white mb-4">Rakipler</h3>
                <div className="space-y-4">
                  {rivals.map((rival) => {
                    const rivalBrand = brands.find(b => b.id === rival.brand);
                    const rivalScore = rival.scores?.overall?.score || 0;
                    return (
                      <Link
                        key={rival.id}
                        to={`/vehicles/${rival.slug || rival.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <img
                          src={rival.images?.[0] || rival.image}
                          alt={rival.model}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate group-hover:text-amber-400 transition-colors">
                            {rivalBrand?.name} {rival.model}
                          </div>
                          <div className={`text-sm font-bold ${getScoreColor(rivalScore)}`}>
                            {rivalScore.toFixed(1)}/10
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* USER REVIEWS SECTION */}
      <ReviewSection
        vehicleId={vehicle.id}
        vehicleBrand={brandName}
        vehicleModel={vehicle.model}
      />

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-scale-in">
          <button
            onClick={() => setFullscreenImage(false)}
            className="absolute top-4 right-4 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-amber-500/80 rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-amber-500/80 rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-8 h-8" />
          </button>
          <img src={allImages[currentImageIndex]} alt={`${brandName} ${vehicle.model}`} className="max-w-full max-h-full object-contain" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-bold text-lg bg-black/50 backdrop-blur px-6 py-3 rounded-xl">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailPage;
