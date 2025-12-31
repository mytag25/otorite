import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, Settings, Trash2, Edit2, Heart, MessageCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import GarageCard from '../garage/GarageCard';
import AddVehicleModal from '../garage/AddVehicleModal';
import { garageAPI, staticAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GarageAssistant from '../garage/GarageAssistant';

const MyGaragePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [deleteVehicle, setDeleteVehicle] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [garageData, brandsData] = await Promise.all([
                garageAPI.getMyGarage(),
                staticAPI.getBrands(),
            ]);

            setVehicles(garageData?.vehicles || []);
            setBrands(brandsData || []);
        } catch (error) {
            console.error('Failed to load garage:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = () => {
        loadData();
        setShowAddModal(false);
        setEditVehicle(null);
    };

    const handleEdit = (vehicle) => {
        setEditVehicle(vehicle);
        setShowAddModal(true);
    };

    const handleDelete = async () => {
        if (!deleteVehicle) return;

        setIsDeleting(true);
        try {
            await garageAPI.deleteVehicle(deleteVehicle.id);
            setVehicles(prev => prev.filter(v => v.id !== deleteVehicle.id));
            setDeleteVehicle(null);
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLikeChange = (vehicleId, result) => {
        setVehicles(prev => prev.map(v =>
            v.id === vehicleId
                ? { ...v, likeCount: result.likeCount }
                : v
        ));
    };

    const getBrandName = (brandId) => {
        const brand = brands.find(b => b.id === brandId);
        return brand?.name || brandId;
    };

    // Stats
    const totalLikes = (vehicles || []).reduce((sum, v) => sum + (v.likeCount || 0), 0);
    const totalComments = (vehicles || []).reduce((sum, v) => sum + (v.commentCount || 0), 0);
    const publicCount = (vehicles || []).filter(v => v.isPublic).length;
    const privateCount = (vehicles || []).length - publicCount;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header Section */}
            <div className="relative overflow-hidden border-b border-slate-800">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Car className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Garajım</h1>
                                <p className="text-slate-400">{user.name}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{vehicles.length}</div>
                                <div className="text-xs text-slate-500">Araç</div>
                            </div>
                            <div className="w-px h-10 bg-slate-700" />
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-400">
                                    <Heart className="w-5 h-5 fill-current" />
                                    {totalLikes}
                                </div>
                                <div className="text-xs text-slate-500">Beğeni</div>
                            </div>
                            <div className="w-px h-10 bg-slate-700" />
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                                    <MessageCircle className="w-5 h-5" />
                                    {totalComments}
                                </div>
                                <div className="text-xs text-slate-500">Yorum</div>
                            </div>
                        </div>

                        {/* Add Button */}
                        <Button
                            onClick={() => {
                                setEditVehicle(null);
                                setShowAddModal(true);
                            }}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Araç Ekle
                        </Button>
                    </div>

                    {/* Privacy Stats */}
                    {vehicles.length > 0 && (
                        <div className="flex items-center gap-4 mt-6 text-sm">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                                <Eye className="w-4 h-4" />
                                <span>{publicCount} Herkese Açık</span>
                            </div>
                            {privateCount > 0 && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-slate-600" />
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <EyeOff className="w-4 h-4" />
                                        <span>{privateCount} Gizli</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    /* Loading State */
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl bg-slate-800/50 animate-pulse">
                                <div className="aspect-[16/10] bg-slate-700/50" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-slate-700/50 rounded w-1/3" />
                                    <div className="h-6 bg-slate-700/50 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : vehicles.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20">
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl">🚗</div>
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <Sparkles className="w-8 h-8 text-amber-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Garajın Boş</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Hadi ilk aracını ekle ve topluluğa katıl! Araçlarını paylaş, beğeni ve yorum al.
                        </p>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg shadow-lg shadow-amber-500/20"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            İlk Aracını Ekle
                        </Button>
                    </div>
                ) : (
                    /* Vehicles Grid with Action Buttons */
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="relative group">
                                <GarageCard
                                    vehicle={{
                                        ...vehicle,
                                        brand: getBrandName(vehicle.brand),
                                    }}
                                    onLikeChange={handleLikeChange}
                                    showOwner={false}
                                    isOwner={true}
                                />

                                {/* Action Overlay */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(vehicle);
                                        }}
                                        className="w-9 h-9 bg-slate-900/80 backdrop-blur-sm text-white hover:bg-slate-800 border border-slate-700/50"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteVehicle(vehicle);
                                        }}
                                        className="w-9 h-9 bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600 border border-red-500/50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <button
                            onClick={() => {
                                setEditVehicle(null);
                                setShowAddModal(true);
                            }}
                            className="group aspect-[16/14] rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/30 flex flex-col items-center justify-center gap-4 transition-all hover:bg-slate-800/30"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 group-hover:bg-amber-500/10 flex items-center justify-center transition-colors">
                                <Plus className="w-8 h-8 text-slate-500 group-hover:text-amber-500 transition-colors" />
                            </div>
                            <span className="text-slate-500 group-hover:text-amber-500 font-medium transition-colors">
                                Yeni Araç Ekle
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AddVehicleModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditVehicle(null);
                }}
                onSuccess={handleAddSuccess}
                editVehicle={editVehicle}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteVehicle} onOpenChange={() => setDeleteVehicle(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Aracı Sil</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            {deleteVehicle && (
                                <>
                                    <strong className="text-white">{getBrandName(deleteVehicle.brand)} {deleteVehicle.model}</strong> aracını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </>
                            )}
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
            <GarageAssistant />
        </div>
    );
};

export default MyGaragePage;
