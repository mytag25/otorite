import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid, List, Filter, Sparkles, Car, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../context/LanguageContext';
import { vehiclesAPI, staticAPI } from '../../services/api';
import VehicleCard from '../vehicles/VehicleCard';
import BackgroundShapes from '../layout/BackgroundShapes';
import ParticleField from '../layout/ParticleField';
import useTitle from '../../hooks/useTitle';

const VehiclesPage = () => {
  const { t, getLocalizedText } = useLanguage();
  useTitle(t('nav.vehicles'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);

  // Data
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [years, setYears] = useState([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [selectedSegment, setSelectedSegment] = useState(searchParams.get('segment') || 'all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [minScore, setMinScore] = useState(0);

  // Load static data
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [brandsData, segmentsData, yearsData] = await Promise.all([
          staticAPI.getBrands(),
          staticAPI.getSegments(),
          staticAPI.getYears()
        ]);
        setBrands(brandsData);
        setSegments(segmentsData);
        setYears(yearsData);
      } catch (error) {
        console.error('Failed to load static data:', error);
      }
    };
    loadStaticData();
  }, []);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedBrand !== 'all') params.brand = selectedBrand;
        if (selectedSegment !== 'all') params.segment = selectedSegment;
        if (selectedYear !== 'all') params.year = parseInt(selectedYear);
        if (minScore > 0) params.minScore = minScore;
        if (searchQuery) params.search = searchQuery;

        const response = await vehiclesAPI.list(params);
        setVehicles(response.vehicles);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadVehicles, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedBrand, selectedSegment, selectedYear, minScore, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSelectedSegment('all');
    setSelectedYear('all');
    setMinScore(0);
    setSearchParams({});
  };

  const hasActiveFilters = selectedBrand !== 'all' || selectedSegment !== 'all' || selectedYear !== 'all' || minScore > 0;

  const getSegmentName = (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    return segment ? getLocalizedText(segment.name) : segmentId;
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || brandId;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden pt-20">
      <ParticleField />
      <BackgroundShapes />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Header with Icon */}
        <div className="mb-10 animate-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <Car className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                <span className="animate-gradient-text">{t('nav.vehicles')}</span>
              </h1>
              <p className="text-slate-400 font-light flex items-center gap-2 mt-1">
                <span className="w-8 h-[1px] bg-amber-500 inline-block" />
                Kapsamlı araç değerlendirmeleri ve puanlamalar
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-400">Toplam <span className="text-white font-bold">{total}</span> araç</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-400"><span className="text-white font-bold">{brands.length}</span> marka</span>
            </div>
          </div>
        </div>

        {/* Glassmorphism Filter Bar - Enhanced */}
        <div className="glass-panel rounded-3xl p-6 mb-10 animate-in-up delay-100 shadow-2xl shadow-black/20 hover:shadow-amber-500/5 transition-shadow duration-500">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input - Enhanced with glow */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 focus:shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-xl transition-all text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 hover:bg-amber-500/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400 hover:text-amber-500" />
                </button>
              )}
            </div>

            {/* Quick Filters - Enhanced styling */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] h-14 bg-slate-900/50 border-slate-700/50 text-white rounded-xl focus:ring-amber-500/20 hover:border-amber-500/30 transition-colors">
                  <SelectValue placeholder={t('search.brand')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-200 max-h-[300px] animate-fade-scale-in">
                  <SelectItem value="all" className="focus:bg-slate-800 focus:text-white cursor-pointer">{t('search.all')}</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-[180px] h-14 bg-slate-900/50 border-slate-700/50 text-white rounded-xl focus:ring-amber-500/20 hover:border-amber-500/30 transition-colors">
                  <SelectValue placeholder={t('search.segment')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-200 max-h-[300px] animate-fade-scale-in">
                  <SelectItem value="all" className="focus:bg-slate-800 focus:text-white cursor-pointer">{t('search.all')}</SelectItem>
                  {segments.map(segment => (
                    <SelectItem key={segment.id} value={segment.id} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                      {getLocalizedText(segment.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-14 px-6 border-slate-700/50 rounded-xl transition-all ${showFilters || hasActiveFilters
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t('search.filter')}
                {hasActiveFilters && (
                  <span className="ml-2 w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">
                    {[selectedBrand !== 'all', selectedSegment !== 'all', selectedYear !== 'all', minScore > 0].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters with Slide Down Animation - Enhanced */}
          <div className={`grid transition-all duration-500 ease-out ${showFilters ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-slate-800/50' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">{t('search.year')}</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white rounded-xl h-12 hover:border-amber-500/30 transition-colors">
                      <SelectValue placeholder={t('search.year')} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-200 animate-fade-scale-in">
                      <SelectItem value="all" className="focus:bg-slate-800 cursor-pointer">{t('search.all')}</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()} className="focus:bg-slate-800 cursor-pointer">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Min. Puan</label>
                  <Select value={minScore.toString()} onValueChange={(v) => setMinScore(parseInt(v))}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white rounded-xl h-12 hover:border-amber-500/30 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-200 animate-fade-scale-in">
                      {[0, 6, 7, 8, 9].map(score => (
                        <SelectItem key={score} value={score.toString()} className="focus:bg-slate-800 cursor-pointer">
                          {score === 0 ? t('search.all') : `${score}+ Puan`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button in Advanced Section */}
                <div className="space-y-2 sm:col-span-2 md:col-span-2 flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl h-12 px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tüm Filtreleri Temizle
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Tokens - Enhanced with animation */}
          {hasActiveFilters && (
            <div className="mt-6 flex flex-wrap items-center gap-2 animate-in-up">
              <span className="text-xs text-slate-500 font-bold uppercase mr-2">Aktif Filtreler:</span>
              {selectedBrand !== 'all' && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all hover:scale-105 cursor-pointer group">
                  {getBrandName(selectedBrand)}
                  <X className="w-3 h-3 ml-2 group-hover:text-white transition-colors" onClick={() => setSelectedBrand('all')} />
                </Badge>
              )}
              {selectedSegment !== 'all' && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all hover:scale-105 cursor-pointer group">
                  {getSegmentName(selectedSegment)}
                  <X className="w-3 h-3 ml-2 group-hover:text-white transition-colors" onClick={() => setSelectedSegment('all')} />
                </Badge>
              )}
              {selectedYear !== 'all' && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all hover:scale-105 cursor-pointer group">
                  {selectedYear}
                  <X className="w-3 h-3 ml-2 group-hover:text-white transition-colors" onClick={() => setSelectedYear('all')} />
                </Badge>
              )}
              {minScore > 0 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all hover:scale-105 cursor-pointer group">
                  {minScore}+ puan
                  <X className="w-3 h-3 ml-2 group-hover:text-white transition-colors" onClick={() => setMinScore(0)} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Header - Enhanced */}
        <div className="flex items-center justify-between mb-8 animate-in-up delay-200">
          <div className="flex items-center gap-4">
            <p className="text-slate-400 font-medium">
              <span className="text-white text-2xl font-black mr-2">{total}</span>
              <span className="text-sm">araç listeleniyor</span>
            </p>
            {loading && (
              <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            )}
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 flex gap-1 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State - Enhanced skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-panel h-[450px] rounded-3xl overflow-hidden">
                <div className="h-48 bg-slate-800/50 skeleton-shimmer" />
                <div className="p-5 space-y-4">
                  <div className="h-4 w-24 bg-slate-800/50 rounded skeleton-shimmer" />
                  <div className="h-6 w-40 bg-slate-800/50 rounded skeleton-shimmer" />
                  <div className="flex gap-2">
                    <div className="h-16 flex-1 bg-slate-800/50 rounded-lg skeleton-shimmer" />
                    <div className="h-16 flex-1 bg-slate-800/50 rounded-lg skeleton-shimmer" />
                    <div className="h-16 flex-1 bg-slate-800/50 rounded-lg skeleton-shimmer" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <div className="h-10 flex-1 bg-slate-800/50 rounded-xl skeleton-shimmer" />
                    <div className="h-10 w-20 bg-slate-800/50 rounded-xl skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div className={`grid gap-8 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
            }`}>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="animate-card-reveal" style={{ animationDelay: `${index * 80}ms` }}>
                <VehicleCard vehicle={vehicle} brands={brands} segments={segments} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - Enhanced */
          <div className="text-center py-32 glass-panel rounded-3xl border-dashed border-2 border-slate-800 animate-fade-scale-in">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-slate-700 animate-float-y">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Sonuç Bulunamadı</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Arama kriterlerinize uygun araç veritabanımızda henüz yok.</p>
            <Button onClick={clearFilters} size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-105">
              <X className="w-4 h-4 mr-2" />
              Tüm Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;
