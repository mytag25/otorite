import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart3, Car, Shield, Gauge, Award, Zap, Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { vehiclesAPI, staticAPI } from '../../services/api';
import VehicleCard from '../vehicles/VehicleCard';
import BackgroundShapes from '../layout/BackgroundShapes';
import ParticleField from '../layout/ParticleField';
import useTitle from '../../hooks/useTitle';

// Hook for animated counter
const useAnimatedCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) {
      animateCount();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  const animateCount = () => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  };

  return { count, ref };
};

// Hook for typing effect
const useTypingEffect = (text, speed = 100, delay = 500) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
          setIsComplete(true);
        }
      }, speed);
      return () => clearInterval(typeInterval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
};

const HomePage = () => {
  const { t, getLocalizedText } = useLanguage();
  const navigate = useNavigate();
  useTitle('Ana Sayfa');

  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Typing effect for hero
  const heroText1 = useTypingEffect('OTORİTE İLE', 80, 300);
  const heroText2 = useTypingEffect('KARAR VER', 100, 1500);

  // Animated counters
  const vehicleCount = useAnimatedCounter(500, 2000);
  const accuracyCount = useAnimatedCounter(99, 1500);
  const readerCount = useAnimatedCounter(100, 2500);

  const scoringDimensions = [
    { id: 'reliability', name: { tr: 'Güvenilirlik', en: 'Reliability' } },
    { id: 'buildQuality', name: { tr: 'Yapı Kalitesi', en: 'Build Quality' } },
    { id: 'performance', name: { tr: 'Performans', en: 'Performance' } },
    { id: 'drivingExperience', name: { tr: 'Sürüş Deneyimi', en: 'Driving Experience' } },
    { id: 'technology', name: { tr: 'Teknoloji', en: 'Technology' } },
    { id: 'safety', name: { tr: 'Güvenlik', en: 'Safety' } },
    { id: 'costOfOwnership', name: { tr: 'Sahip Olma Maliyeti', en: 'Cost of Ownership' } },
    { id: 'design', name: { tr: 'Tasarım', en: 'Design' } },
    { id: 'valueForMoney', name: { tr: 'Fiyat/Performans', en: 'Value for Money' } },
    { id: 'overall', name: { tr: 'Genel Puan', en: 'Overall Score' } }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesRes, brandsData, segmentsData] = await Promise.all([
          vehiclesAPI.list({ limit: 3 }),
          staticAPI.getBrands(),
          staticAPI.getSegments()
        ]);
        setFeaturedVehicles(vehiclesRes.vehicles);
        setBrands(brandsData);
        setSegments(segmentsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    { icon: Shield, title: '10 Boyutlu Matris', desc: 'Sektör standardı puanlama algoritması' },
    { icon: BarChart3, title: 'Derin Analiz', desc: 'Veri odaklı tarafsız karşılaştırma' },
    { icon: Award, title: 'Otorite Onaylı', desc: 'Profesyonel inceleme ekibi' },
    { icon: Zap, title: 'Global Kapsama', desc: '10 dilde yerelleştirilmiş içerik' },
  ];

  // Ripple effect handler
  const createRipple = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'ripple';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden relative">
      <ParticleField />
      <BackgroundShapes />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">

          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/40 backdrop-blur-md rounded-full border border-amber-500/30 mb-8 animate-in-up delay-100 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-border-glow">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-sm text-slate-200 font-medium tracking-wide">Yeni Nesil Araç Değerlendirme</span>
          </div>

          {/* Massive Hero Title with Typing Effect */}
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black mb-8 leading-tight tracking-tighter">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              {heroText1.displayText}
              {!heroText1.isComplete && <span className="typing-cursor"></span>}
            </span>
            <span className="block text-shimmer">
              {heroText2.displayText}
              {heroText1.isComplete && !heroText2.isComplete && <span className="typing-cursor"></span>}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-in-up delay-300 font-light">
            10 boyutlu yapay zeka destekli puanlama matrisi ile araç seçiminde şansa yer bırakmayın.
            <span className="text-amber-500 font-semibold animate-gradient-text"> Veri konuşur, efsaneler susar.</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in-up delay-500">
            <Button
              onClick={(e) => { createRipple(e); navigate('/vehicles'); }}
              size="lg"
              className="group relative bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-8 text-xl font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(245,158,11,0.4)] glow-button"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12 origin-bottom-left" />
              <span className="relative flex items-center gap-3">
                <Search className="w-6 h-6" />
                İncelemeye Başla
              </span>
            </Button>

            <Button
              onClick={() => navigate('/compare')}
              variant="outline"
              size="lg"
              className="group border-slate-700 bg-slate-900/50 text-slate-300 hover:text-white hover:border-amber-500/50 px-8 py-8 text-xl font-bold rounded-2xl backdrop-blur-md transition-all hover:scale-105"
            >
              <BarChart3 className="w-6 h-6 mr-3 group-hover:text-amber-500 transition-colors" />
              Kıyasla & Analiz Et
            </Button>
          </div>

          {/* Float Stats with Animated Counters */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in-up delay-700 max-w-5xl mx-auto">
            <div ref={vehicleCount.ref} className="animate-premium-gradient rounded-2xl p-6 text-center group transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-amber-500 transition-colors">
                <span className="animate-count-up">{vehicleCount.count}</span>+
              </div>
              <div className="text-slate-500 font-medium tracking-wider text-xs uppercase">Araç Verisi</div>
            </div>
            <div ref={accuracyCount.ref} className="animate-premium-gradient rounded-2xl p-6 text-center group transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-amber-500 transition-colors">
                %<span className="animate-count-up">{accuracyCount.count}</span>
              </div>
              <div className="text-slate-500 font-medium tracking-wider text-xs uppercase">Doğruluk</div>
            </div>
            <div ref={readerCount.ref} className="animate-premium-gradient rounded-2xl p-6 text-center group transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-amber-500 transition-colors">
                <span className="animate-count-up">{readerCount.count}</span>K+
              </div>
              <div className="text-slate-500 font-medium tracking-wider text-xs uppercase">Aylık Okuyucu</div>
            </div>
            <div className="animate-premium-gradient rounded-2xl p-6 text-center group transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-amber-500 transition-colors">10/10</div>
              <div className="text-slate-500 font-medium tracking-wider text-xs uppercase">Analiz Derinliği</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-panel glass-panel-hover p-8 rounded-3xl transition-all duration-500 group card-3d-tilt animate-card-reveal"
                style={{ animationDelay: `${i * 150}ms` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 20;
                  const rotateY = (centerX - x) / 20;
                  e.currentTarget.style.setProperty('--rotateX', `${rotateX}deg`);
                  e.currentTarget.style.setProperty('--rotateY', `${rotateY}deg`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('--rotateX', '0deg');
                  e.currentTarget.style.setProperty('--rotateY', '0deg');
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/5 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/10 group-hover:border-amber-500/30 group-hover:from-amber-500/30 transition-all">
                  <feature.icon className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring Dimensions (Grid) */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/50 skew-y-3 scale-110 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">10 Boyutlu Analiz</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Kusursuz bir değerlendirme için her detayı inç inç inceleyen algoritma.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
            {scoringDimensions.map((dim, i) => (
              <div
                key={dim.id}
                className="group relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 overflow-hidden animate-card-reveal"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <Gauge className="w-8 h-8 text-slate-600 group-hover:text-amber-500 mb-4 transition-colors icon-bounce-hover" />
                  <h3 className="text-slate-300 group-hover:text-white font-semibold text-sm transition-colors">{getLocalizedText(dim.name)}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles - Glass Cards */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500 font-bold tracking-widest text-xs uppercase">Editörün Seçimi</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white">Vitrindeki Efsaneler</h2>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/vehicles')}
              className="border-slate-700 text-slate-300 hover:text-amber-500 hover:border-amber-500 bg-transparent px-6 rounded-full icon-bounce-hover"
            >
              Tümünü Gör
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-panel h-[450px] rounded-3xl skeleton-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles.map((vehicle, index) => (
                <div key={vehicle.id} style={{ animationDelay: `${index * 150}ms` }} className="animate-card-reveal">
                  <VehicleCard vehicle={vehicle} brands={brands} segments={segments} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brands Ticker - Infinite Marquee */}
      <section className="py-20 border-t border-slate-900/50 bg-slate-950/30 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Global Markalar Veritabanı</p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <span key={`${brand.id}-${i}`} className="mx-8 text-2xl font-bold text-slate-400 hover:text-amber-500 cursor-default transition-colors">
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
