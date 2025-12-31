import React, { useState, useEffect } from 'react';
import { garageAPI } from '../../services/api';
import { Wrench, Camera, DollarSign, Tag, Info, User, ArrowRight, Clock, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            setLoading(true);
            // 1. Try to fetch personal feed (following users)
            let data = await garageAPI.getFeed();

            // 2. If personal feed is empty or doesn't exist, fetch global activity
            if (!data || data.length === 0) {
                // If there's a global explore/activity endpoint, use it. 
                // For now, we'll use explore vehicles as a source of "New Vehicles" activity
                const exploreData = await garageAPI.explore({ limit: 10 });
                if (exploreData?.vehicles?.length > 0) {
                    data = exploreData.vehicles.map(v => ({
                        id: `v-${v.id}`,
                        type: 'STATUS_UPDATE',
                        userId: v.userId,
                        userName: v.userName,
                        vehicleId: v.id,
                        vehicleBrand: v.brand,
                        vehicleModel: v.model,
                        vehicleImage: v.image,
                        title: 'Garaja Yeni Araç Eklendi',
                        description: v.description || `${v.brand} ${v.model} artık garajda!`,
                        createdAt: v.createdAt,
                        likes: v.likes || []
                    }));
                }
            }

            if (data && data.length > 0) {
                setActivities(data);
            } else {
                // Final fallback to mock data if absolutely nothing is found
                setActivities(getMockActivities());
            }
        } catch (error) {
            console.error('Error loading feed:', error);
            setActivities(getMockActivities());
        } finally {
            setLoading(false);
        }
    };

    const getMockActivities = () => [
        {
            id: 'm1',
            type: 'MAINTENANCE',
            userId: 'u1',
            userName: 'Can Yılmaz',
            vehicleId: 'v1',
            vehicleBrand: 'BMW',
            vehicleModel: 'M3 Competition',
            vehicleImage: 'https://images.unsplash.com/photo-1555215695-3004980adade?w=800&q=80',
            title: 'Periyodik Bakım Tamamlandı',
            description: '15.000km bakımı Borusan Oto\'da yapıldı.',
            createdAt: new Date().toISOString(),
            likes: ['u2', 'u3']
        },
        {
            id: 'm2',
            type: 'FOR_SALE',
            userId: 'u2',
            userName: 'Mert Kaya',
            vehicleId: 'v2',
            vehicleBrand: 'Honda',
            vehicleModel: 'S2000',
            vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
            title: 'Aracım Satılıktır',
            description: 'İlgilenenler iletişime geçebilir.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likes: []
        }
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'MAINTENANCE': return <Wrench className="w-5 h-5 text-blue-400" />;
            case 'MODIFICATION': return <Wrench className="w-5 h-5 text-amber-500" />;
            case 'PHOTO_ADDED': return <Camera className="w-5 h-5 text-purple-500" />;
            case 'STATUS_UPDATE': return <Info className="w-5 h-5 text-green-500" />;
            case 'FOR_SALE': return <DollarSign className="w-5 h-5 text-emerald-500" />;
            default: return <Tag className="w-5 h-5 text-slate-400" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now - date) / 1000; // seconds

        if (diff < 60) return 'Az önce';
        if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}s önce`;
        return `${Math.floor(diff / 86400)}g önce`;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group"
                >
                    <div className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-slate-800/50 border border-white/5">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white hover:text-amber-500 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/garage/user/${activity.userId}`)}>
                                            {activity.userName}
                                        </span>
                                        <span className="text-slate-500 text-sm">•</span>
                                        <span className="text-slate-400 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(activity.createdAt)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {activity.vehicleBrand} {activity.vehicleModel}
                                    </div>
                                </div>
                            </div>

                            {/* Like Button */}
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-rose-400 group/like">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-xs font-medium">{activity.likes?.length || 0}</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr,200px] gap-6">
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">
                                    {activity.title}
                                </h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {activity.description}
                                </p>

                                {/* Extra Data Badges */}
                                {activity.data && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {Object.entries(activity.data).map(([key, value]) => (
                                            <span key={key} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                                                {key === 'cost' ? 'Maliyet: ' : key === 'price' ? 'Fiyat: ' : key === 'part' ? 'Parça: ' : ''}
                                                <span className="text-white">{value}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Vehicle Image Snapshot */}
                            {activity.vehicleImage && (
                                <div
                                    className="hidden md:block relative h-32 rounded-xl overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/garage/vehicle/${activity.vehicleId}`)}
                                >
                                    <img
                                        src={activity.vehicleImage}
                                        alt={activity.vehicleModel}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {activities.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-slate-400">Henüz bir aktivite yok.</p>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
