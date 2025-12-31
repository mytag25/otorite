import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { X, Star, BarChart3, Trophy, Car, Minus, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../context/LanguageContext';
import { useCompare } from '../../context/CompareContext';
import { vehiclesAPI, staticAPI, aiAPI } from '../../services/api';
import BackgroundShapes from '../layout/BackgroundShapes';
import ParticleField from '../layout/ParticleField';
import useTitle from '../../hooks/useTitle';

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

const ComparePage = () => {
  const navigate = useNavigate();
  const { getLocalizedText } = useLanguage();
  useTitle('Araç Karşılaştırma');
  const { compareList, addToCompare, removeFromCompare, clearCompare, maxCompare } = useCompare();

  const [allVehicles, setAllVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesRes, brandsData, segmentsData] = await Promise.all([
          vehiclesAPI.list({ limit: 100 }),
          staticAPI.getBrands(),
          staticAPI.getSegments()
        ]);
        setAllVehicles(vehiclesRes.vehicles);
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

  // Intersection observer for animated bars
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (tableRef.current) observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, []);

  const availableVehicles = allVehicles.filter(
    v => !compareList.find(cv => cv.id === v.id)
  );

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

  const getWinner = (dimensionId) => {
    if (compareList.length < 2) return null;
    let maxScore = -1;
    let winnerId = null;
    compareList.forEach(vehicle => {
      const score = vehicle.scores?.[dimensionId]?.score || 0;
      if (score > maxScore) {
        maxScore = score;
        winnerId = vehicle.id;
      }
    });
    return winnerId;
  };

  const handleAddVehicle = (vehicleId) => {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      addToCompare(vehicle);
      setAnalysis(null); // Clear analysis when list changes
    }
  };

  const handleRemoveVehicle = (vehicleId) => {
    removeFromCompare(vehicleId);
    setAnalysis(null); // Clear analysis when list changes
  };

  const handleClearCompare = () => {
    clearCompare();
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (compareList.length < 2) return;
    setAnalysisLoading(true);
    try {
      const vehicleIds = compareList.map(v => v.id);
      const res = await aiAPI.compareAnalyst(vehicleIds);
      setAnalysis(res.analysis);
      // Scroll to analysis
      setTimeout(() => {
        document.getElementById('ai-analysis-box')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getBrandName = (brandId) => {
    return brands.find(b => b.id === brandId)?.name || brandId;
  };

  const getSegmentName = (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    return segment ? getLocalizedText(segment.name) : segmentId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative">
        <ParticleField />
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 pt-24 relative overflow-hidden">
      <ParticleField />
      <BackgroundShapes />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <BarChart3 className="w-6 h-6 text-amber-500" />
              </div>
              <span className="animate-gradient-text">Araç Karşılaştırma</span>
            </h1>
            <p className="text-slate-400 ml-15">En fazla {maxCompare} araç karşılaştırın</p>
          </div>
          {compareList.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCompare}
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-red-500/50 transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Temizle
            </Button>
          )}
        </div>

        {compareList.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 glass-panel rounded-3xl animate-fade-scale-in">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-float-y">
              <BarChart3 className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Karşılaştırma Listesi Boş</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Karşılaştırmak istediğiniz araçları aşağıdaki listeden seçin veya araç sayfalarından ekleyin.
            </p>

            <div className="max-w-xs mx-auto">
              <Select onValueChange={handleAddVehicle}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white hover:border-amber-500/50 transition-colors">
                  <SelectValue placeholder="Araç seçin..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 max-h-60 animate-fade-scale-in">
                  {allVehicles.map(vehicle => (
                    <SelectItem
                      key={vehicle.id}
                      value={vehicle.id}
                      className="text-white hover:bg-slate-700"
                    >
                      {getBrandName(vehicle.brand)} {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => navigate('/vehicles')}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all"
              >
                <Car className="w-4 h-4 mr-2" />
                Araçlara Göz At
              </Button>
            </div>
          </div>
        ) : (
          /* Comparison Table */
          <div ref={tableRef} className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/30 animate-in-up delay-100">
            {/* Vehicle Headers */}
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr) ${compareList.length < maxCompare ? '200px' : ''}` }}>
              {/* Empty cell for dimension labels */}
              <div className="p-4 border-b border-r border-slate-800 bg-slate-900/80" />

              {/* Vehicle Cards */}
              {compareList.map((vehicle, idx) => (
                <div
                  key={vehicle.id}
                  className="p-4 border-b border-r border-slate-800 relative group animate-card-reveal"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVehicle(vehicle.id)}
                    className="absolute top-2 right-2 w-7 h-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="image-zoom-hover rounded-lg overflow-hidden mb-3">
                    <img
                      src={vehicle.image}
                      alt={`${getBrandName(vehicle.brand)} ${vehicle.model}`}
                      className="w-full h-32 object-cover cursor-pointer transition-transform duration-500"
                      onClick={() => navigate(`/vehicles/${vehicle.slug || vehicle.id}`)}
                    />
                  </div>
                  <p className="text-slate-400 text-sm">{getBrandName(vehicle.brand)}</p>
                  <h3
                    className="text-white font-bold text-lg cursor-pointer hover:text-amber-500 transition-colors"
                    onClick={() => navigate(`/vehicles/${vehicle.slug || vehicle.id}`)}
                  >
                    {vehicle.model}
                  </h3>
                  <p className="text-slate-500 text-sm">{vehicle.year} • {getSegmentName(vehicle.segment)}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <Star className={`w-5 h-5 ${getScoreColor(vehicle.scores?.overall?.score)} fill-current`} />
                    <span className={`font-bold ${getScoreColor(vehicle.scores?.overall?.score)}`}>
                      {vehicle.scores?.overall?.score?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Add Vehicle Cell */}
              {compareList.length < maxCompare && (
                <div className="p-4 border-b border-slate-800 flex flex-col items-center justify-center">
                  <Select onValueChange={handleAddVehicle}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-full hover:border-amber-500/50 transition-colors">
                      <SelectValue placeholder="Araç ekle..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                      {availableVehicles.map(vehicle => (
                        <SelectItem
                          key={vehicle.id}
                          value={vehicle.id}
                          className="text-white hover:bg-slate-700"
                        >
                          {getBrandName(vehicle.brand)} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Score Rows */}
            {scoringDimensions.map((dim, dimIdx) => {
              const winnerId = getWinner(dim.id);
              return (
                <div
                  key={dim.id}
                  className="grid animate-in-up"
                  style={{
                    gridTemplateColumns: `200px repeat(${compareList.length}, 1fr) ${compareList.length < maxCompare ? '200px' : ''}`,
                    animationDelay: `${dimIdx * 50}ms`
                  }}
                >
                  {/* Dimension Label */}
                  <div className="p-4 border-b border-r border-slate-800 bg-slate-900/50">
                    <span className="text-white font-medium">{getLocalizedText(dim.name)}</span>
                  </div>

                  {/* Scores */}
                  {compareList.map(vehicle => {
                    const score = vehicle.scores?.[dim.id]?.score || 0;
                    const isWinner = winnerId === vehicle.id && compareList.length > 1;
                    return (
                      <div
                        key={vehicle.id}
                        className={`p-4 border-b border-r border-slate-800 text-center transition-colors ${isWinner ? 'bg-amber-500/10' : ''
                          }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                            {score.toFixed(1)}
                          </span>
                          {isWinner && (
                            <Trophy className="w-4 h-4 text-amber-500 animate-scale-bounce" />
                          )}
                        </div>
                        {/* Animated Score Bar */}
                        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBgColor(score)}`}
                            style={{
                              width: isVisible ? `${score * 10}%` : '0%',
                              transitionDelay: `${dimIdx * 100}ms`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Add Cell */}
                  {compareList.length < maxCompare && (
                    <div className="p-4 border-b border-slate-800 flex items-center justify-center">
                      <Minus className="w-4 h-4 text-slate-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {compareList.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm animate-in-up delay-300">
            <span className="text-slate-400">Puan skalası:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">9-10 Mükemmel</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400">8-9 Çok İyi</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-400">7-8 İyi</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-400">6-7 Orta</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-400">&lt;6 Düşük</span>
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        {compareList.length >= 2 && (
          <div className="mt-12 animate-in-up delay-400">
            {!analysis && !analysisLoading ? (
              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all flex items-center gap-3 group"
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Otorite AI Analizi Başlat
                </Button>
              </div>
            ) : (
              <div id="ai-analysis-box" className="glass-panel rounded-3xl p-8 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white leading-none">AI Kıyaslama Analisti</h2>
                      <p className="text-slate-400 text-sm mt-1">Sizin için en mantıklı seçimi belirliyor</p>
                    </div>
                  </div>
                  {analysis && !analysisLoading && (
                    <Button
                      variant="ghost"
                      onClick={handleAnalyze}
                      className="text-slate-400 hover:text-white"
                    >
                      Yeniden Analiz Et
                    </Button>
                  )}
                </div>

                {analysisLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Veriler İşleniyor...</h3>
                    <p className="text-slate-400 max-w-xs">AI mühendisimiz araçları derinlemesine inceliyor ve size özel bir rapor hazırlıyor.</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-amber max-w-none text-slate-200 leading-relaxed font-medium">
                    <ReactMarkdown>
                      {analysis}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
