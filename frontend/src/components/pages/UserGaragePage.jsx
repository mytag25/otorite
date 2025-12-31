import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Car, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import GarageCard from '../garage/GarageCard';
import { garageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GarageAssistant from '../garage/GarageAssistant';

const UserGaragePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [ownerName, setOwnerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        loadData();
    }, [userId]);

    useEffect(() => {
        if (user && userId && user.id !== userId) {
            checkFollowStatus();
        }
    }, [userId, user]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await garageAPI.getUserGarage(userId);
            setVehicles(data?.vehicles || []);

            // Get owner name from first vehicle
            if (data?.vehicles && data.vehicles.length > 0) {
                setOwnerName(data.vehicles[0].userName);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Kullanıcı bulunamadı');
            } else {
                setError('Garaj yüklenirken bir hata oluştu');
            }
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        try {
            const data = await garageAPI.getFollowing(user.id);
            if (data.following.includes(userId)) {
                setIsFollowing(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFollow = async () => {
        if (!user) return navigate('/login');
        try {
            if (isFollowing) {
                await garageAPI.unfollowUser(userId);
                setIsFollowing(false);
            } else {
                await garageAPI.followUser(userId);
                setIsFollowing(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleLikeChange = (vehicleId, result) => {
        setVehicles(prev => prev.map(v =>
            v.id === vehicleId
                ? {
                    ...v,
                    likes: result.liked
                        ? [...(v.likes || []), user?.id]
                        : (v.likes || []).filter(id => id !== user?.id),
                    likeCount: result.likeCount
                }
                : v
        ));
    };

    // Stats
    const totalLikes = (vehicles || []).reduce((sum, v) => sum + (v.likeCount || 0), 0);
    const totalComments = (vehicles || []).reduce((sum, v) => sum + (v.commentCount || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">{error}</h2>
                    <Button
                        onClick={() => navigate('/garage')}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                        Keşfet'e Dön
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header Section */}
            <div className="relative overflow-hidden border-b border-slate-800">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-white mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{ownerName || 'Kullanıcı'}</h1>
                                <p className="text-slate-400">Garaj</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Follow Button */}
                            {user && user.id !== userId && (
                                <Button
                                    onClick={handleFollow}
                                    variant={isFollowing ? "outline" : "default"}
                                    className={isFollowing
                                        ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"}
                                >
                                    {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                                </Button>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                                        <Car className="w-5 h-5 text-amber-500" />
                                        {vehicles.length}
                                    </div>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {vehicles.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                            <Car className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Bu garaj boş</h2>
                        <p className="text-slate-400 mb-6">
                            Bu kullanıcı henüz araç eklememis.
                        </p>
                        <Button
                            onClick={() => navigate('/garage')}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            Keşfet'e Dön
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((vehicle) => (
                            <GarageCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                onLikeChange={handleLikeChange}
                                showOwner={false}
                            />
                        ))}
                    </div>
                )}
            </div>
            <GarageAssistant />
        </div>
    );
};

export default UserGaragePage;
