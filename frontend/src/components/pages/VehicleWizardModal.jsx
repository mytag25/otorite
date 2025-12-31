import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronRight, ChevronLeft, Wand2, Loader2, Bookmark, BookOpen, Fuel, Users, Target, Sparkles, DollarSign, MapPin, MessageSquare, Check, ThumbsUp, AlertTriangle, Zap, Gauge, Plus, Heart, Star, Car } from 'lucide-react';
import { Button } from '../ui/button';
import { aiAPI, garageAPI, favoritesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VehicleWizardModal = ({ isOpen, onClose }) => {
    const { user, toggleFavorite } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [results, setResults] = useState(null);
    const [showSaved, setShowSaved] = useState(false);
    const [addedVehicles, setAddedVehicles] = useState([]); // Garage items
    const [favorites, setFavorites] = useState([]); // Favorite items

    // Load initial data
    useEffect(() => {
        const loadSavedData = async () => {
            if (!isOpen) return;
            setLoadingSaved(true);
            try {
                // Load favorites from API
                if (user) {
                    const favoritesData = await favoritesAPI.list();
                    setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
                }

                // Load added vehicles from LocalStorage
                const localSaved = localStorage.getItem('wizard_saved_vehicles');
                if (localSaved) {
                    setAddedVehicles(JSON.parse(localSaved));
                }
            } catch (error) {
                console.error('Failed to load saved vehicles:', error);
            } finally {
                setLoadingSaved(false);
            }
        };

        loadSavedData();
    }, [isOpen, user]);

    // Form Data
    const [formData, setFormData] = useState({
        budgetMin: 500000,
        budgetMax: 1500000,
        vehicleType: '',
        usage: [],
        fuelType: '',
        annualKm: 15000,
        fuelEconomyImportance: 5,
        familyStatus: '',
        priorities: [],
        additionalNotes: ''
    });

    const steps = [
        { title: 'Bütçe', icon: <DollarSign className="w-4 h-4" /> },
        { title: 'Tip', icon: <Car className="w-4 h-4" /> },
        { title: 'Kullanım', icon: <MapPin className="w-4 h-4" /> },
        { title: 'Yakıt', icon: <Fuel className="w-4 h-4" /> },
        { title: 'Yol', icon: <Target className="w-4 h-4" /> },
        { title: 'Aile', icon: <Users className="w-4 h-4" /> },
        { title: 'Öncelik', icon: <Sparkles className="w-4 h-4" /> },
        { title: 'Ekstra', icon: <MessageSquare className="w-4 h-4" /> }
    ];

    const vehicleTypes = [
        { id: 'sedan', label: 'Sedan', description: 'Konforlu & Şık', icon: <Car /> },
        { id: 'suv', label: 'SUV', description: 'Geniş & Yüksek', icon: <Car /> },
        { id: 'hatchback', label: 'Hatchback', description: 'Pratik & Kompakt', icon: <Car /> },
        { id: 'mpv', label: 'MPV', description: 'Aile & Hacim', icon: <Car /> },
        { id: 'pickup', label: 'Pickup', description: 'Güçlü & Yük', icon: <Car /> },
        { id: 'coupe', label: 'Coupe', description: 'Sportif & Tarz', icon: <Car /> }
    ];

    const usageOptions = [
        { id: 'şehir içi', label: 'Şehir İçi', description: 'Yoğun trafik, park kolaylığı' },
        { id: 'uzun yol', label: 'Uzun Yol', description: 'Sık seyahat, konfor odaklı' },
        { id: 'aile', label: 'Aile', description: 'Güvenlik, geniş bagaj, koltuk' },
        { id: 'performans', label: 'Performans', description: 'Hız, sürüş keyfi, güç' },
        { id: 'arazi', label: 'Arazi / Kamp', description: '4x4, doğa tutkusu' }
    ];

    const fuelTypes = [
        { id: 'benzin', label: 'Benzin', description: 'Performans & Yaygınlık' },
        { id: 'dizel', label: 'Dizel', description: 'Uzun yol & Tork' },
        { id: 'hibrit', label: 'Hibrit', description: 'Şehir içi ekonomi' },
        { id: 'elektrik', label: 'Elektrik', description: 'Sessiz & Çevreci' },
        { id: 'fark etmez', label: 'Fark Etmez', description: 'En iyisi olsun' }
    ];

    const familyOptions = [
        { id: 'tek', label: 'Tek Kişi', description: 'Bireysel kullanım' },
        { id: 'çift', label: 'Çift', description: 'İki kişilik hayat' },
        { id: 'bebek', label: 'Bebekli', description: 'Puset & bagaj ihtiyacı' },
        { id: 'çocuklu_kucuk', label: 'Küçük Çocuklu', description: 'Güvenlik önemli' },
        { id: 'genis', label: 'Geniş Aile', description: '5+ kişi veya evcil hayvan' }
    ];

    const priorityOptions = [
        { id: 'konfor', label: 'Konfor', icon: <Sparkles /> },
        { id: 'performans', label: 'Performans', icon: <Zap /> },
        { id: 'düşük masraf', label: 'Düşük Masraf', icon: <DollarSign /> },
        { id: 'teknoloji', label: 'Teknoloji', icon: <Gauge /> },
        { id: 'güvenlik', label: 'Güvenlik', icon: <AlertTriangle /> },
        { id: 'prestij', label: 'Prestij', icon: <Sparkles /> }
    ];

    const formatPrice = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)} Milyon TL`;
        }
        return `${(value / 1000).toFixed(0)} Bin TL`;
    };

    const toggleArrayItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const handleSaveVehicle = (rec) => {
        try {
            const newAdded = [...addedVehicles, {
                ...rec,
                savedAt: new Date().toISOString()
            }];
            setAddedVehicles(newAdded);
            localStorage.setItem('wizard_saved_vehicles', JSON.stringify(newAdded));
        } catch (error) {
            console.error('Save vehicle failed', error);
        }
    };

    const handleRemoveSaved = (modelName) => {
        const newAdded = addedVehicles.filter(v => v.model !== modelName);
        setAddedVehicles(newAdded);
        localStorage.setItem('wizard_saved_vehicles', JSON.stringify(newAdded));
    };

    const isVehicleAdded = (modelName) => {
        if (!Array.isArray(addedVehicles)) return false;
        return addedVehicles.some(v => v.model === modelName);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await aiAPI.wizard(formData);
            setResults(response);
        } catch (err) {
            console.error('Wizard error:', err);
            setResults({ error: 'Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setLoading(false);
        }
    };

    const handleWizardToggleFavorite = async (rec) => {
        if (!user) {
            navigate('/login');
            onClose();
            return;
        }

        try {
            await toggleFavorite(rec.id || rec.slug);
            // Refresh favorites list
            const favoritesData = await favoritesAPI.list();
            setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const isVehicleFavorited = (modelName) => {
        if (!Array.isArray(favorites)) return false;
        return favorites.some(v => v.model === modelName);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const resetWizard = () => {
        setCurrentStep(0);
        setResults(null);
        setFormData({
            budgetMin: 500000,
            budgetMax: 1500000,
            vehicleType: '',
            usage: [],
            fuelType: '',
            annualKm: 15000,
            fuelEconomyImportance: 5,
            familyStatus: '',
            priorities: [],
            additionalNotes: ''
        });
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-950/90 rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-md">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-50"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/5">
                            <Wand2 className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">AI Sihirbazı</h2>
                            <p className="text-sm font-medium text-slate-400">Size en uygun aracı bulalım</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Saved Items Toggle */}
                        <button
                            onClick={() => setShowSaved(!showSaved)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all border ${showSaved
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                        >
                            <Bookmark className={`w-4 h-4 ${(favorites.length > 0 || addedVehicles.length > 0) ? 'fill-current' : ''}`} />
                            <span>Kaydedilenler ({addedVehicles.length + favorites.length})</span>
                            {showSaved ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar (Timeline Style) */}
                {!results && !loading && !showSaved && (
                    <div className="px-8 py-2 shrink-0 z-10 overflow-x-auto">
                        <div className="flex items-center justify-between min-w-max md:min-w-0">
                            {steps.map((step, i) => (
                                <div key={i} className="flex flex-col items-center group cursor-default">
                                    <div className={`
                                        w-3 h-3 rounded-full mb-2 transition-all duration-500 relative
                                        ${i <= currentStep ? 'bg-amber-500 scale-125 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 border border-slate-700'}
                                    `}>
                                        {/* Connecting Line */}
                                        {i < steps.length - 1 && (
                                            <div className={`
                                                absolute top-1/2 left-3 w-[calc(100vw/9)] md:w-20 h-0.5 -translate-y-1/2 -z-10 transition-colors duration-500
                                                ${i < currentStep ? 'bg-amber-500/50' : 'bg-slate-800'}
                                            `} />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${i <= currentStep ? 'text-amber-500' : 'text-slate-600'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar z-10">
                    {showSaved ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                                    <Sparkles className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Kaydedilen Araçlar</h3>
                                <p className="text-slate-400">Favorilerinizi ve sihirbazda beğendiğiniz araçları buradan takip edebilirsiniz</p>
                            </div>

                            {loadingSaved ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : addedVehicles.length === 0 && favorites.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                        <Bookmark className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium">Henüz bir araç kaydetmediniz</p>
                                    <Button
                                        onClick={() => setShowSaved(false)}
                                        variant="link"
                                        className="text-amber-500 mt-2"
                                    >
                                        Sihirbaza Dön
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Favorites Section */}
                                    {favorites.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-red-500 fill-current" /> Sitedeki Favorilerim
                                            </h4>
                                            <div className="grid gap-3">
                                                {favorites.map((v, i) => (
                                                    <div key={i} className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-all">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-white truncate">{v.brand} {v.model}</h4>
                                                            <div className="text-xs text-red-500 flex items-center gap-1">
                                                                <Bookmark className="w-3 h-3 fill-current" /> Favorilerde
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                navigate(`/vehicles/${v.slug || v.id}`);
                                                                onClose();
                                                            }}
                                                            className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white"
                                                        >
                                                            İncele
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Garage Section */}
                                    {addedVehicles.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Bookmark className="w-4 h-4 text-emerald-500" /> Favorilerim
                                            </h4>
                                            <div className="grid gap-6">
                                                {addedVehicles.map((v, i) => (
                                                    <div key={i} className="bg-slate-900/60 rounded-[2rem] border border-white/10 p-6 group hover:border-amber-500/50 transition-all duration-300">
                                                        <div className="flex justify-between items-start gap-4 mb-4">
                                                            <div className="flex-1">
                                                                <h4 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors mb-2">
                                                                    {v.brand} {v.model}
                                                                </h4>
                                                                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                                                    {v.reason}
                                                                </p>

                                                                {/* Specs */}
                                                                {v.specs && (
                                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                                        {Object.entries(v.specs).map(([key, val]) => (
                                                                            val && val !== 'Bilinmiyor' && (
                                                                                <span key={key} className="text-[11px] bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-white/5 font-medium transition-colors group-hover:bg-slate-750">
                                                                                    {val}
                                                                                </span>
                                                                            )
                                                                        ))}
                                                                        {v.price_range && (
                                                                            <span className="text-[11px] bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl border border-amber-500/20 font-bold">
                                                                                {v.price_range}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2 shrink-0 items-end">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveSaved(v.model);
                                                                    }}
                                                                    className="border-white/10 hover:bg-red-500/10 text-slate-400 hover:text-red-500 h-8 text-[11px] rounded-lg px-3 font-bold"
                                                                >
                                                                    Kaldır
                                                                </Button>
                                                                {v.slug && (
                                                                    <Button
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            navigate(`/vehicles/${v.slug}`);
                                                                            onClose();
                                                                        }}
                                                                        className="w-10 h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-110 active:scale-95"
                                                                    >
                                                                        <ChevronRight className="w-6 h-6" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Pros & Cons Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                                            {v.pros?.map((pro, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 group/item hover:bg-emerald-500/10 transition-colors">
                                                                    <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                    <span className="text-xs text-slate-300 leading-snug">{pro}</span>
                                                                </div>
                                                            ))}
                                                            {v.cons?.map((con, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10 group/item hover:bg-orange-500/10 transition-colors">
                                                                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                                                    <span className="text-xs text-slate-300 leading-snug">{con}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => setShowSaved(false)}
                                        className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-xl font-bold"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-2" />
                                        Sihirbaza Dön
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
                                <Loader2 className="w-16 h-16 text-amber-500 animate-spin relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-8 mb-2">Analiz Yapılıyor</h3>
                            <p className="text-slate-400 text-center max-w-sm">
                                Cevaplarınız 500+ araç verisiyle karşılaştırılıyor ve en iyi eşleşmeler belirleniyor...
                            </p>
                        </div>
                    ) : results ? (
                        <div className="space-y-6 animate-fade-in-up">
                            {results.error ? (
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                                    <p className="text-red-300 font-medium">{results.error}</p>
                                </div>
                            ) : (
                                <>
                                    {results.aiSummary && (
                                        <div className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
                                            <Sparkles className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                            <div>
                                                <h4 className="text-amber-500 font-bold text-sm uppercase tracking-wider mb-1">AI Özeti</h4>
                                                <p className="text-slate-200 leading-relaxed">{results.aiSummary}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-4">
                                        {results.recommendations?.map((rec, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    if (rec.in_inventory && rec.slug) {
                                                        navigate(`/vehicles/${rec.slug}`);
                                                        onClose();
                                                    }
                                                }}
                                                className={`
                                                    group relative p-5 rounded-2xl border transition-all duration-300
                                                    ${rec.in_inventory
                                                        ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-800'
                                                        : 'bg-slate-900/30 border-white/5 opacity-90'}
                                                    ${rec.isTopPick ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/50 shadow-amber-500/10' : ''}
                                                `}
                                            >
                                                {rec.isTopPick && (
                                                    <div className="absolute -top-3 left-6 z-10">
                                                        <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" /> En İyi Seçim
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`text-xl font-bold group-hover:text-amber-500 transition-colors ${rec.isTopPick ? 'text-white' : 'text-slate-200'}`}>
                                                                {rec.brand} {rec.model}
                                                            </h4>
                                                            {!rec.in_inventory && (
                                                                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                    Veritabanında Yok
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-400 font-medium mb-2">{rec.reason}</p>

                                                        {/* Specs Grid */}
                                                        {rec.specs && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {Object.entries(rec.specs).map(([key, val]) => (
                                                                    val && val !== 'Bilinmiyor' && (
                                                                        <span key={key} className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-md border border-white/5">
                                                                            {val}
                                                                        </span>
                                                                    )
                                                                ))}
                                                                {rec.price_range && (
                                                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md border border-amber-500/20">
                                                                        {rec.price_range}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className={`h-9 px-3 rounded-xl border transition-all ${isVehicleAdded(rec.model)
                                                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                                                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isVehicleAdded(rec.model)) {
                                                                    handleSaveVehicle(rec);
                                                                }
                                                            }}
                                                            disabled={isVehicleAdded(rec.model)}
                                                        >
                                                            {isVehicleAdded(rec.model) ? (
                                                                <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Kaydedildi</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1"><Plus className="w-4 h-4" /> Kaydet</span>
                                                            )}
                                                        </Button>

                                                        {rec.in_inventory ? (
                                                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                                                                <ChevronRight className="w-5 h-5" />
                                                            </div>
                                                        ) : (
                                                            <div title="Detaylı inceleme henüz mevcut değil" className="p-2 rounded-full bg-slate-800 text-slate-600 cursor-not-allowed">
                                                                <AlertTriangle className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {rec.pros?.map((pro, idx) => (
                                                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-400 bg-white/5 p-2 rounded-lg">
                                                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>{pro}</span>
                                                        </div>
                                                    ))}
                                                    {rec.cons?.map((con, idx) => (
                                                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-400 bg-white/5 p-2 rounded-lg">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                                            <span>{con}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={resetWizard}
                                        variant="outline"
                                        className="w-full mt-2 border-white/10 text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl text-base"
                                    >
                                        Sihirbazı Yeniden Başlat
                                    </Button>

                                    {/* Saved Vehicles Section */}
                                    {(addedVehicles.length > 0 || favorites.length > 0) && (
                                        <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
                                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-amber-500" />
                                                Sihirbazdan Kaydedilenler ({addedVehicles.length})
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Favorites Mini List */}
                                                {favorites.slice(0, 4).map((v, i) => (
                                                    <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                                                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-white truncate">{v.brand} {v.model}</div>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                navigate(`/vehicles/${v.slug || v.id}`);
                                                                onClose();
                                                            }}
                                                            className="w-8 h-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-full"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}

                                                {/* Wizard Saved List (Detailed) */}
                                                {addedVehicles.map((v, i) => (
                                                    <div key={i} className="bg-slate-900/60 rounded-2xl border border-white/10 p-5 group hover:border-amber-500/50 transition-all duration-300">
                                                        <div className="flex justify-between gap-4 mb-4">
                                                            <div>
                                                                <h4 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">
                                                                    {v.brand} {v.model}
                                                                </h4>
                                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                                                    {v.reason}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => handleRemoveSaved(v.model)}
                                                                    className="w-9 h-9 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl border border-white/5"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                                {v.slug && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            navigate(`/vehicles/${v.slug}`);
                                                                            onClose();
                                                                        }}
                                                                        className="w-9 h-9 text-slate-500 hover:text-amber-500 hover:bg-amber-500/5 rounded-xl border border-white/5"
                                                                    >
                                                                        <ChevronRight className="w-5 h-5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Specs from Wizard */}
                                                        {v.specs && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {Object.entries(v.specs).map(([key, val]) => (
                                                                    val && val !== 'Bilinmiyor' && (
                                                                        <span key={key} className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg border border-white/5 font-medium">
                                                                            {val}
                                                                        </span>
                                                                    )
                                                                ))}
                                                                {v.price_range && (
                                                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/20 font-bold">
                                                                        {v.price_range}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="space-y-3">
                                                            {v.pros && v.pros.length > 0 && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {v.pros.map((pro, idx) => (
                                                                        <div key={idx} className="flex items-start gap-2 text-[11px] text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                                                            <ThumbsUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                            <span>{pro}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {v.cons && v.cons.length > 0 && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {v.cons.map((con, idx) => (
                                                                        <div key={idx} className="flex items-start gap-2 text-[11px] text-orange-400 bg-orange-500/5 p-2 rounded-lg border border-orange-500/10">
                                                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                            <span>{con}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 min-h-[300px] animate-fade-in-up">
                            {/* STEPS CONTENT */}

                            {/* Step 0: Budget */}
                            {currentStep === 0 && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Bütçenizi Belirleyin</h3>
                                        <p className="text-slate-400">Hayalinizdeki araç için ayırdığınız aralık nedir?</p>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="p-3 bg-slate-900 rounded-xl border border-white/10 w-[45%] text-center">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">MİNİMUM</div>
                                                <div className="text-lg font-bold text-white">{formatPrice(formData.budgetMin)}</div>
                                            </div>
                                            <div className="w-4 h-0.5 bg-slate-700"></div>
                                            <div className="p-3 bg-slate-900 rounded-xl border border-white/10 w-[45%] text-center">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">MAKSİMUM</div>
                                                <div className="text-lg font-bold text-amber-500">{formatPrice(formData.budgetMax)}</div>
                                            </div>
                                        </div>

                                        <div className="px-4">
                                            <div className="mb-6">
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Min Bütçe</label>
                                                <input
                                                    type="range"
                                                    min="100000"
                                                    max="5000000"
                                                    step="50000"
                                                    value={formData.budgetMin}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: Math.min(parseInt(e.target.value), prev.budgetMax - 50000) }))}
                                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">Max Bütçe</label>
                                                <input
                                                    type="range"
                                                    min="100000"
                                                    max="10000000"
                                                    step="50000"
                                                    value={formData.budgetMax}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: Math.max(parseInt(e.target.value), prev.budgetMin + 50000) }))}
                                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Vehicle Type */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Nasıl Bir Kasa?</h3>
                                        <p className="text-slate-400">Tarzınıza en uygun kasa tipini seçin</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {vehicleTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData(prev => ({ ...prev, vehicleType: type.id }))}
                                                className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] ${formData.vehicleType === type.id
                                                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500 shadow-lg shadow-amber-500/10'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                                                    }`}
                                            >
                                                <span className={`block text-2xl mb-2 ${formData.vehicleType === type.id ? 'text-amber-500' : 'text-slate-500'}`}>
                                                    {type.id === 'sedan' ? '🚗' : type.id === 'suv' ? '🚙' : type.id === 'pickup' ? '🛻' : '🚘'}
                                                </span>
                                                <div className={`font-bold ${formData.vehicleType === type.id ? 'text-white' : 'text-slate-200'}`}>{type.label}</div>
                                                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{type.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Usage */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Kullanım Amacı</h3>
                                        <p className="text-slate-400">Aracı en çok nerede kullanacaksınız?</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {usageOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => toggleArrayItem('usage', opt.id)}
                                                className={`p-4 flex items-center gap-4 rounded-2xl border text-left transition-all duration-300 ${formData.usage.includes(opt.id)
                                                    ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/50'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${formData.usage.includes(opt.id) ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-600'
                                                    }`}>
                                                    <Check className={`w-5 h-5 ${formData.usage.includes(opt.id) ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${formData.usage.includes(opt.id) ? 'text-white' : 'text-slate-200'}`}>{opt.label}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Fuel */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Yakıt Tipi</h3>
                                        <p className="text-slate-400">Hangi motor teknolojisi size uygun?</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {fuelTypes.map((fuel) => (
                                            <button
                                                key={fuel.id}
                                                onClick={() => setFormData(prev => ({ ...prev, fuelType: fuel.id }))}
                                                className={`p-4 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 ${formData.fuelType === fuel.id
                                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                                                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`text-lg font-bold mb-1`}>{fuel.label}</div>
                                                <div className={`text-[10px] uppercase font-bold opacity-60`}>{fuel.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Annual KM & Economy */}
                            {currentStep === 4 && (
                                <div className="space-y-10">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Yolculuk Alışkanlıkları</h3>
                                        <p className="text-slate-400">Yılda ne kadar yol yaparsınız?</p>
                                    </div>

                                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                        <div className="mb-10 text-center">
                                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2">
                                                {formData.annualKm.toLocaleString()}
                                            </div>
                                            <div className="text-sm font-bold text-amber-500 uppercase tracking-widest">KM / YIL</div>
                                        </div>

                                        <input
                                            type="range"
                                            min="5000"
                                            max="50000"
                                            step="1000"
                                            value={formData.annualKm}
                                            onChange={(e) => setFormData(prev => ({ ...prev, annualKm: parseInt(e.target.value) }))}
                                            className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 mb-8"
                                        />

                                        <div className="pt-8 border-t border-white/5">
                                            <div className="flex justify-between items-end mb-4">
                                                <label className="text-sm font-bold text-slate-400 uppercase">Yakıt Ekonomisi Önemi</label>
                                                <span className="text-2xl font-bold text-white">{formData.fuelEconomyImportance}<span className="text-slate-500 text-lg">/10</span></span>
                                            </div>
                                            <div className="flex gap-1 h-3">
                                                {[...Array(10)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 rounded-full transition-colors ${i < formData.fuelEconomyImportance ? 'bg-amber-500' : 'bg-slate-800'
                                                            }`}
                                                        onClick={() => setFormData(prev => ({ ...prev, fuelEconomyImportance: i + 1 }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Family */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Aile Durumu</h3>
                                        <p className="text-slate-400">Araçta genellikle kaç kişi olacaksınız?</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {familyOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFormData(prev => ({ ...prev, familyStatus: opt.id }))}
                                                className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-300 aspect-square ${formData.familyStatus === opt.id
                                                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-full mb-3 ${formData.familyStatus === opt.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-600'}`}>
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div className="font-bold mb-1">{opt.label}</div>
                                                <div className="text-[10px] opacity-60 uppercase font-bold">{opt.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Priorities */}
                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Öncelikleriniz</h3>
                                        <p className="text-slate-400">Sizin için olmazsa olmazlar (Max 3)</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {priorityOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => toggleArrayItem('priorities', opt.id)}
                                                disabled={formData.priorities.length >= 3 && !formData.priorities.includes(opt.id)}
                                                className={`p-4 rounded-2xl border text-left transition-all duration-300 ${formData.priorities.includes(opt.id)
                                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30'
                                                    : formData.priorities.length >= 3
                                                        ? 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                                                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                                                    }`}
                                            >
                                                <div className="mb-3 opacity-90">{opt.icon}</div>
                                                <div className="font-bold">{opt.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 7: Additional Notes */}
                            {currentStep === 7 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-2">Son Dokunuş</h3>
                                        <p className="text-slate-400">Eklemek istediğiniz özel bir detay var mı?</p>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={formData.additionalNotes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                                            placeholder="Örn: Sunroof mutlaka olsun, bagajı büyük olmalı, kırmızı renk tercihimdir..."
                                            rows={6}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:bg-slate-900 focus:ring-1 focus:ring-amber-500 transition-all resize-none text-lg"
                                        />
                                        <div className="absolute bottom-4 right-4 p-2 bg-slate-800 rounded-xl text-slate-500">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                        <p className="text-sm text-amber-200">
                                            AI bu notunuzu <strong>en yüksek öncelik</strong> olarak değerlendirecektir.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!loading && !results && !showSaved && (
                    <div className="p-6 md:p-8 pt-4 border-t border-white/5 flex items-center justify-between gap-4 z-10 bg-slate-950/50">
                        <Button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12 px-6"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" /> Geri
                        </Button>

                        <Button
                            onClick={handleNext}
                            className={`
                                h-14 px-8 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-all duration-300
                                ${currentStep === steps.length - 1
                                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] animate-shimmer text-white hover:shadow-amber-500/40'
                                    : 'bg-white text-slate-950 hover:bg-slate-200'}
                            `}
                        >
                            {currentStep === steps.length - 1 ? (
                                <span className="flex items-center">
                                    <Wand2 className="w-5 h-5 mr-2" />
                                    Sihirli Dokunuş
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Devam Et
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </span>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default VehicleWizardModal;
