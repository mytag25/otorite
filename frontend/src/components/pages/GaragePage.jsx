import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Car, Filter, X, Plus, Sparkles, Users, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import GarageCard from '../garage/GarageCard';
import { garageAPI, staticAPI } from '../../services/api';
import GarageAssistant from '../garage/GarageAssistant';
import { useAuth } from '../../context/AuthContext';
import useTitle from '../../hooks/useTitle';

const GaragePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    useTitle('Garajım');

    const [vehicles, setVehicles] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filters
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [showFilters, setShowFilters] = useState(false);


    useEffect(() => {
        loadData();
    }, [selectedBrand, selectedYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [garageData, brandsData] = await Promise.all([
                garageAPI.explore({
                    brand: selectedBrand === 'all' ? undefined : (selectedBrand || undefined),
                    year: selectedYear === 'all' ? undefined : (selectedYear || undefined),
                }),
                staticAPI.getBrands(),
            ]);

            setVehicles(garageData?.vehicles || []);
            setTotal(garageData?.total || 0);
            setBrands(brandsData || []);
        } catch (error) {
            console.error('Failed to load garage data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLikeChange = (vehicleId, result) => {
        setVehicles(prev => prev.map(v =>
            v.id === vehicleId
                ? { ...v, likes: result.liked ? [...v.likes, user?.id] : v.likes.filter(id => id !== user?.id), likeCount: result.likeCount }
                : v
        ));
    };

    const clearFilters = () => {
        setSelectedBrand('');
        setSelectedYear('');
    };

    const hasActiveFilters = selectedBrand || selectedYear;

    // Generate year options
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <GarageAssistant />
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Sanal Garaj
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Keşfet
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                            Topluluğun en güzel araçlarını keşfet, ilham al ve kendi garajını oluştur
                        </p>


                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{total}</div>
                                <div className="text-sm text-slate-500">Araç</div>
                            </div>
                            <div className="w-px h-12 bg-slate-700" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    {(brands.length * 7) + 12}
                                </div>
                                <div className="text-sm text-slate-500">Kullanıcı</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center justify-center gap-4">
                            {user ? (
                                <Button
                                    onClick={() => navigate('/garage/my')}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6"
                                >
                                    <Car className="w-4 h-4 mr-2" />
                                    Garajım
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Garaj Oluştur
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrele
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Brand Filter */}
                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Tüm Markalar" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all" className="text-white hover:bg-slate-700">
                                        Tüm Markalar
                                    </SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem
                                            key={brand.id}
                                            value={brand.id}
                                            className="text-white hover:bg-slate-700"
                                        >
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Year Filter */}
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Tüm Yıllar" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                                    <SelectItem value="all" className="text-white hover:bg-slate-700">
                                        Tüm Yıllar
                                    </SelectItem>
                                    {years.map((year) => (
                                        <SelectItem
                                            key={year}
                                            value={year.toString()}
                                            className="text-white hover:bg-slate-700"
                                        >
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Temizle
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <>
                    {loading ? (
                        /* Loading State */
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="rounded-2xl bg-slate-800/50 animate-pulse">
                                    <div className="aspect-[16/10] bg-slate-700/50" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-slate-700/50 rounded w-1/3" />
                                        <div className="h-6 bg-slate-700/50 rounded w-2/3" />
                                        <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (vehicles || []).length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                                <Compass className="w-12 h-12 text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Henüz araç yok</h2>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                {hasActiveFilters
                                    ? 'Bu filtrelerle eşleşen araç bulunamadı. Filtreleri temizlemeyi deneyin.'
                                    : 'Henüz kimse araç eklememiş. İlk sen ekle!'}
                            </p>
                            {user ? (
                                <Button
                                    onClick={() => navigate('/garage/my')}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Araç Ekle
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => navigate('/register')}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                >
                                    Kayıt Ol
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* Vehicles Grid */
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => (
                                <GarageCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onLikeChange={handleLikeChange}
                                    showOwner={true}
                                />
                            ))}
                        </div>
                    )}
                </>
                )}
            </div>
        </div>
    );
};

export default GaragePage;
