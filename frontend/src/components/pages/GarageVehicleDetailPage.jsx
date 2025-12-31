import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Heart, Calendar, Palette, Wrench, User, Share2,
    Check, Sparkles, ChevronLeft, ChevronRight, Gauge, Fuel, Trophy, Medal, Star,
    MessageCircle, ShieldCheck, Edit2, DollarSign, HelpCircle,
    Quote, Wand2, RefreshCw, ZoomIn, ZoomOut, Maximize, X, Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import CommentSection from '../garage/CommentSection';
import AddVehicleModal from '../garage/AddVehicleModal';
import { garageAPI, staticAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import useTitle from '../../hooks/useTitle';

const GarageVehicleDetailPage = () => {
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [brands, setBrands] = useState([]);

    // Marka ismini baş harfi büyük olacak şekilde formatla
    const formatBrand = (brand) => {
        if (!brand) return '';
        if (brand.toLowerCase() === 'bmw') return 'BMW';
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    };

    useTitle(vehicle ? `${formatBrand(vehicle.brand)} ${vehicle.model} | Garaj` : 'Araç Yükleniyor...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiking, setIsLiking] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openViewer = (index) => {
        setCurrentImageIndex(index);
        setViewerIsOpen(true);
        setZoomLevel(1);
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

    useEffect(() => {
        loadData();
    }, [vehicleId]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [vehicleData, brandsData] = await Promise.all([
                garageAPI.getVehicle(vehicleId),
                staticAPI.getBrands(),
            ]);

            setVehicle(vehicleData);
            setBrands(brandsData);
            setIsLiked(vehicleData.likes?.includes(user?.id));
            setLikeCount(vehicleData.likeCount || 0);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Araç bulunamadı');
            } else {
                setError('Araç yüklenirken bir hata oluştu');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isLiking) return;
        setIsLiking(true);

        try {
            const result = await garageAPI.toggleLike(vehicleId);
            setIsLiked(result.liked);
            setLikeCount(result.likeCount);
        } catch (error) {
            console.error('Like error:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await garageAPI.deleteVehicle(vehicleId);
            navigate('/garage/my');
        } catch (error) {
            console.error('Delete error:', error);
            // Could add toast here
        } finally {
            setIsDeleting(false);
        }
    };

    const handleGenerateSummary = async () => {
        setLoadingAI(true);
        try {
            const data = await aiAPI.generateSummary(vehicle);
            // Save to DB (Assuming updateVehicle is available or using partial update)
            // For now, let's just update local state, persistence requires API support
            // We'll update via garageAPI.updateVehicle
            await garageAPI.updateVehicle(vehicle.id, { aiSummary: data.summary });

            setVehicle(prev => ({ ...prev, aiSummary: data.summary }));
        } catch (error) {
            console.error('AI Gen Error:', error);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleCommentAdded = (comment) => {
        setVehicle(prev => ({
            ...prev,
            comments: [...prev.comments, comment],
            commentCount: (prev.commentCount || 0) + 1
        }));
    };

    const handleCommentDeleted = (commentId) => {
        setVehicle(prev => ({
            ...prev,
            comments: prev.comments.filter(c => c.id !== commentId),
            commentCount: Math.max(0, (prev.commentCount || 0) - 1)
        }));
    };

    const getBrandName = (brandId) => {
        const brand = brands.find(b => b.id === brandId);
        const val = brand?.name || brandId;
        return typeof val === 'string' ? val : JSON.stringify(val);
    };

    const getOwnershipDuration = (dateString) => {
        if (!dateString) return '-';
        const start = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return `${diffDays} Gün`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} Ay`;
        return `${(diffDays / 365).toFixed(1)} Yıl`;
    };

    const allImages = vehicle ? [vehicle.image, ...(vehicle.images || [])].filter(Boolean) : [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${getBrandName(vehicle.brand)} ${vehicle.model}`,
                    url: url,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(url);
            // Could show a toast here
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-t-2 border-b-2 border-amber-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 blur-md animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000')] bg-cover bg-center brightness-[0.2]"></div>
                <div className="relative z-10 text-center p-8 bg-slate-950/50 backdrop-blur-xl rounded-3xl border border-white/10 max-w-md w-full">
                    <div className="text-6xl mb-6">🏜️</div>
                    <h2 className="text-2xl font-bold text-white mb-4">{error || 'Garaj Boş'}</h2>
                    <p className="text-slate-400 mb-8">Aradığınız araç garajdan çıkarılmış veya hiç var olmamış olabilir.</p>
                    <Button
                        onClick={() => navigate('/garage')}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6 rounded-xl"
                    >
                        Garajı Keşfet
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === vehicle.userId;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* --- IMMERSIVE HERO SECTION --- */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                {/* Background Image with Parallax-ish feel */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {allImages.length > 0 ? (
                        <img
                            key={currentImageIndex}
                            src={allImages[currentImageIndex]}
                            alt={`${getBrandName(vehicle.brand)} ${vehicle.model}`}
                            className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out animate-fade-in"
                            style={{ objectPosition: 'center center' }}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Fuel className="w-20 h-20 text-slate-800" />
                        </div>
                    )}
                    {/* Gradient Overlays using Brand Colors */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/20"></div>
                </div>

                {/* Top Navigation */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 rounded-full h-12 w-12 p-0"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleShare}
                            className="bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 rounded-full h-12 w-12 p-0"
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                        {isOwner && (
                            <>
                                <Button
                                    onClick={() => setShowEditModal(true)}
                                    className="bg-amber-500/80 hover:bg-amber-600 backdrop-blur-md text-white border border-amber-400/50 rounded-full h-12 w-12 p-0"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white border border-red-400/50 rounded-full h-12 w-12 p-0"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Interactive Gallery Controls */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all z-40 group"
                        >
                            <ChevronLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all z-40 group"
                        >
                            <ChevronRight className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </button>
                    </>
                )}

                {/* Slider Indicators */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                        {allImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                                    ? 'bg-amber-500 w-8 h-2 shadow-lg shadow-amber-500/50'
                                    : 'bg-white/40 hover:bg-white/70 w-2 h-2'
                                    }`}
                            />
                        ))}
                        <span className="ml-3 text-sm text-white/70 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {allImages.length}
                        </span>
                    </div>
                )}

                {/* Hero Content - Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 z-20">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-end justify-between gap-8">
                        <div className="space-y-4 animate-fade-in-up">
                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-sm flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-current" />
                                    Premium Garage
                                </span>
                                <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white font-medium text-sm backdrop-blur-md">
                                    {vehicle.year} Model
                                </span>
                                {vehicle.color && (
                                    <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white font-medium text-sm backdrop-blur-md flex items-center gap-2">
                                        <Palette className="w-3 h-3" />
                                        {vehicle.color}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <h2 className="text-2xl lg:text-3xl text-amber-500 font-medium tracking-wide mb-1 opacity-90">{getBrandName(vehicle.brand)}</h2>
                                <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tight drop-shadow-2xl leading-none">
                                    {typeof vehicle.model === 'string' ? vehicle.model : JSON.stringify(vehicle.model)}
                                </h1>
                            </div>
                        </div>

                        {/* Interaction Hub */}
                        <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl p-2 rounded-full border border-white/10">
                                <Button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`h-14 px-8 rounded-full text-lg font-bold transition-all shadow-lg ${isLiked
                                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/30 hover:shadow-rose-500/50 scale-105'
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                        }`}
                                >
                                    <Heart className={`w-6 h-6 mr-2 transition-transform ${isLiked ? 'fill-current scale-125' : 'scale-100'}`} />
                                    {likeCount} Beğeni
                                </Button>

                                <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

                                <div className="flex items-center gap-2 text-slate-300 pr-4">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="font-bold">{vehicle.commentCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-10 relative z-20">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (User & Specs) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Owner Card - Glassmorphism */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-[2px] shadow-lg shadow-amber-500/20">
                                    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
                                        {/* Avatar Placeholder */}
                                        <User className="w-10 h-10 text-amber-500" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {typeof vehicle.userName === 'string' ? vehicle.userName : 'Gizli Üye'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-semibold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full w-fit">
                                        <ShieldCheck className="w-3 h-3" />
                                        Doğrulanmış Sahip
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate(`/garage/user/${vehicle.userId}`)}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-6 rounded-xl group-hover:border-amber-500/30 transition-all font-semibold"
                            >
                                Profili ve Diğer Araçları
                            </Button>
                        </div>

                        {/* Specs Grid */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-amber-500" />
                                Teknik Detaylar
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Marka</div>
                                    <div className="text-white font-bold truncate">{getBrandName(vehicle.brand)}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Yıl</div>
                                    <div className="text-white font-bold">{vehicle.year}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Kasa</div>
                                    <div className="text-white font-bold">{vehicle.bodyType || '-'}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Yakıt</div>
                                    <div className="text-white font-bold">{vehicle.fuelType || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Ownership Stats */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                İstatistikler
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                    <span className="text-slate-400 text-sm">Sahiplik</span>
                                    <span className="text-white font-bold">{getOwnershipDuration(vehicle.ownershipDate)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                    <span className="text-slate-400 text-sm">Aylık Ort. Masraf</span>
                                    <span className="text-white font-bold">{vehicle.averageMonthlyExpense || 0} ₺</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                    <span className="text-slate-400 text-sm">Sahip Puanı</span>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold">{vehicle.ownerRating || '-'}/10</span>
                                    </div>
                                </div>
                                {vehicle.isForSale && (
                                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                                        <span className="text-green-400 font-bold flex items-center justify-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Satılık Olabilir
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modifications List */}
                        {vehicle.modifications?.length > 0 && (
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-amber-500" />
                                    Modifikasyonlar
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {vehicle.modifications.map((mod, index) => (
                                        <div key={index} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-200 text-sm font-medium">
                                            {typeof mod === 'string' ? mod : JSON.stringify(mod)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Story, Gallery, Comments) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Story / Description */}
                        {vehicle.description && (
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Trophy className="w-6 h-6 text-amber-500" />
                                    Garaj Hikayesi
                                </h3>
                                <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap font-light">
                                    {typeof vehicle.description === 'string' ? vehicle.description : ''}
                                </p>
                            </div>
                        )}



                        {/* Purchase Reason */}
                        {vehicle.purchaseReason && (
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-amber-500" />
                                    Neden Aldım?
                                </h3>
                                <div className="relative pl-6 border-l-2 border-amber-500/30">
                                    <p className="text-lg text-slate-300 italic">"{typeof vehicle.purchaseReason === 'string' ? vehicle.purchaseReason : ''}"</p>
                                </div>
                            </div>
                        )}

                        {/* Maintenance History */}
                        {vehicle.maintenanceHistory?.length > 0 && (
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-amber-500" />
                                    Bakım Geçmişi
                                </h3>
                                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                                    {vehicle.maintenanceHistory.map((item, i) => (
                                        <div key={i} className="pl-8 relative group">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-amber-500 group-hover:bg-amber-500/20 transition-colors"></div>
                                            <p className="text-slate-300 group-hover:text-white transition-colors">
                                                {typeof item === 'string' ? item : JSON.stringify(item)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Thumbnail Gallery (If multiple images) */}
                        {allImages.length > 1 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white px-2">Galeri</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {allImages.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => openViewer(index)}
                                            className={`relative aspect-square rounded-2xl overflow-hidden group border-2 transition-all ${index === currentImageIndex ? 'border-amber-500 scale-95 shadow-lg shadow-amber-500/20' : 'border-transparent hover:border-white/20'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Gallery ${index}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {index === currentImageIndex && (
                                                <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[2px]">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div id="comments" className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-2 sm:p-6 lg:p-8">
                            <CommentSection
                                vehicleId={vehicle.id}
                                comments={vehicle.comments || []}
                                onCommentAdded={handleCommentAdded}
                                onCommentDeleted={handleCommentDeleted}
                                isOwner={isOwner}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {viewerIsOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setViewerIsOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors z-[110]"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors z-[110]"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" onClick={() => setViewerIsOpen(false)}>
                        <img
                            src={allImages[currentImageIndex]}
                            alt="Full screen"
                            className="max-w-full max-h-full object-contain transition-transform duration-300"
                            style={{ transform: `scale(${zoomLevel})` }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md rounded-full px-6 py-3 z-[110]">
                        <button onClick={handleZoomOut} className="text-white hover:text-amber-500 transition-colors">
                            <ZoomOut className="w-6 h-6" />
                        </button>
                        <span className="text-white/80 font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={handleZoomIn} className="text-white hover:text-amber-500 transition-colors">
                            <ZoomIn className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Aracı Sil</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            <strong>{getBrandName(vehicle.brand)} {vehicle.model}</strong> aracını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                            İptal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 text-white hover:bg-red-600"
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sil'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Vehicle Modal */}
            <AddVehicleModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    setShowEditModal(false);
                    loadData(); // Reload vehicle data after edit
                }}
                editVehicle={vehicle}
            />
        </div>
    );
};

export default GarageVehicleDetailPage;
