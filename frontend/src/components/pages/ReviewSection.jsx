import React, { useState, useEffect } from 'react';
import {
    Star, ThumbsUp, MessageSquare, Check, X, User, Award,
    ChevronDown, ChevronUp, Send, Edit2, Trash2, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { reviewsAPI } from '../../services/api';

const ReviewSection = ({ vehicleId, vehicleBrand, vehicleModel }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [expandedReviews, setExpandedReviews] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        rating: 8,
        title: '',
        content: '',
        pros: [''],
        cons: ['']
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadReviews();
        loadStats();
    }, [vehicleId, sortBy]);

    const loadReviews = async () => {
        try {
            const data = await reviewsAPI.getByVehicle(vehicleId, { sort: sortBy });
            setReviews(data);
        } catch (err) {
            console.error('Reviews yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await reviewsAPI.getStats(vehicleId);
            setStats(data);
        } catch (err) {
            console.error('Stats yüklenemedi:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError('');

        try {
            const reviewData = {
                vehicleId,
                rating: formData.rating,
                title: formData.title,
                content: formData.content,
                pros: formData.pros.filter(p => p.trim()),
                cons: formData.cons.filter(c => c.trim())
            };

            if (editingId) {
                await reviewsAPI.update(editingId, reviewData);
            } else {
                await reviewsAPI.create(reviewData);
            }

            setFormData({ rating: 8, title: '', content: '', pros: [''], cons: [''] });
            setShowForm(false);
            setEditingId(null);
            loadReviews();
            loadStats();
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (reviewId) => {
        if (!user) return;
        try {
            await reviewsAPI.toggleLike(reviewId);
            loadReviews();
        } catch (err) {
            console.error('Beğeni hatası:', err);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            await reviewsAPI.delete(reviewId);
            loadReviews();
            loadStats();
        } catch (err) {
            console.error('Silme hatası:', err);
        }
    };

    const handleEdit = (review) => {
        setFormData({
            rating: review.rating,
            title: review.title,
            content: review.content,
            pros: review.pros.length > 0 ? review.pros : [''],
            cons: review.cons.length > 0 ? review.cons : ['']
        });
        setEditingId(review.id);
        setShowForm(true);
    };

    const addProCon = (type) => {
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], '']
        }));
    };

    const updateProCon = (type, index, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].map((item, i) => i === index ? value : item)
        }));
    };

    const removeProCon = (type, index) => {
        if (formData[type].length <= 1) return;
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

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

    const userHasReviewed = reviews.some(r => r.userId === user?.id);

    return (
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-amber-500" />
                        KULLANICI YORUMLARI
                    </h2>
                    <p className="text-slate-400 mt-2">
                        {vehicleBrand} {vehicleModel} sahiplerinin ve kullanıcılarının yorumları
                    </p>
                </div>

                {/* User Score Summary */}
                {stats && stats.totalReviews > 0 && (
                    <div className="glass-panel rounded-2xl p-6 flex items-center gap-6">
                        <div className="text-center">
                            <div className={`text-4xl font-black ${getScoreColor(stats.averageRating)}`}>
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">KULLANICI PUANI</div>
                        </div>
                        <div className="h-12 w-px bg-slate-700" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
                            <div className="text-xs text-slate-500 mt-1">YORUM</div>
                        </div>
                        <div className="flex gap-0.5 ml-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(stats.averageRating / 2)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Write Review Button */}
            {user && !userHasReviewed && !showForm && (
                <Button
                    onClick={() => setShowForm(true)}
                    className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-amber-500/20"
                >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Yorum Yaz
                </Button>
            )}

            {!user && (
                <div className="glass-panel rounded-2xl p-6 mb-8 flex items-center gap-4 border border-amber-500/20">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <p className="text-slate-300">
                        Yorum yapabilmek için <a href="/login" className="text-amber-400 hover:underline font-medium">giriş yapın</a>.
                    </p>
                </div>
            )}

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 mb-8 animate-in-up">
                    <h3 className="text-xl font-bold text-white mb-6">
                        {editingId ? 'Yorumunuzu Düzenleyin' : 'Yorumunuzu Paylaşın'}
                    </h3>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {/* Rating */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-400 mb-3 block">Puanınız</label>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                                        className={`w-10 h-10 rounded-lg font-bold transition-all ${i + 1 <= formData.rating
                                            ? 'bg-amber-500 text-slate-950'
                                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <span className={`text-2xl font-black ${getScoreColor(formData.rating)}`}>
                                {formData.rating}/10
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Başlık</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Örn: 3 yıldır kullanıyorum, memnunum"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                            required
                            minLength={3}
                            maxLength={100}
                        />
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-400 mb-2 block">Yorumunuz</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Deneyimlerinizi paylaşın..."
                            rows={4}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                            required
                            minLength={10}
                            maxLength={2000}
                        />
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Pros */}
                        <div>
                            <label className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                                <Check className="w-4 h-4" /> Artılar
                            </label>
                            {formData.pros.map((pro, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={pro}
                                        onChange={(e) => updateProCon('pros', idx, e.target.value)}
                                        placeholder="Artı ekleyin..."
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                    />
                                    {formData.pros.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProCon('pros', idx)}
                                            className="p-2 text-slate-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addProCon('pros')}
                                className="text-emerald-400 text-sm hover:underline"
                            >
                                + Artı ekle
                            </button>
                        </div>

                        {/* Cons */}
                        <div>
                            <label className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                                <X className="w-4 h-4" /> Eksiler
                            </label>
                            {formData.cons.map((con, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={con}
                                        onChange={(e) => updateProCon('cons', idx, e.target.value)}
                                        placeholder="Eksi ekleyin..."
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500"
                                    />
                                    {formData.cons.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProCon('cons', idx)}
                                            className="p-2 text-slate-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addProCon('cons')}
                                className="text-red-400 text-sm hover:underline"
                            >
                                + Eksi ekle
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl px-8 h-12"
                        >
                            {submitting ? 'Gönderiliyor...' : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    {editingId ? 'Güncelle' : 'Gönder'}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({ rating: 8, title: '', content: '', pros: [''], cons: [''] });
                            }}
                            className="text-slate-400 hover:text-white"
                        >
                            İptal
                        </Button>
                    </div>
                </form>
            )}

            {/* Sort Options */}
            {reviews.length > 0 && (
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'newest', label: 'En Yeni' },
                        { id: 'highest', label: 'En Yüksek Puan' },
                        { id: 'lowest', label: 'En Düşük Puan' },
                        { id: 'helpful', label: 'En Faydalı' }
                    ].map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSortBy(option.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === option.id
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Henüz yorum yok</h3>
                    <p className="text-slate-400">Bu araç için ilk yorumu siz yazın!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const isExpanded = expandedReviews[review.id];
                        const isOwner = user?.id === review.userId;
                        const hasLiked = review.likes?.includes(user?.id);

                        return (
                            <div
                                key={review.id}
                                className="glass-panel rounded-2xl p-6 hover:border-slate-700 transition-colors animate-in-up"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                                            <User className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{review.userName}</span>
                                                {review.isVerifiedOwner && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-medium text-amber-400">
                                                        <Award className="w-3 h-3" />
                                                        Doğrulanmış Araç Sahibi
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${getScoreBgColor(review.rating)} text-white font-black text-xl px-4 py-2 rounded-xl`}>
                                        {review.rating}/10
                                    </div>
                                </div>

                                {/* Title & Content */}
                                <h4 className="text-lg font-bold text-white mb-2">{review.title}</h4>
                                <p className={`text-slate-300 ${!isExpanded && review.content.length > 300 ? 'line-clamp-3' : ''}`}>
                                    {review.content}
                                </p>

                                {review.content.length > 300 && (
                                    <button
                                        onClick={() => setExpandedReviews(prev => ({ ...prev, [review.id]: !isExpanded }))}
                                        className="text-amber-400 text-sm mt-2 hover:underline flex items-center gap-1"
                                    >
                                        {isExpanded ? (
                                            <>Daha az göster <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Devamını oku <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}

                                {/* Pros & Cons */}
                                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        {review.pros?.length > 0 && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                                <div className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-1">
                                                    <Check className="w-4 h-4" /> Artılar
                                                </div>
                                                <ul className="space-y-1">
                                                    {review.pros.map((pro, i) => (
                                                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                            <Check className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                                                            {pro}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {review.cons?.length > 0 && (
                                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                                <div className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
                                                    <X className="w-4 h-4" /> Eksiler
                                                </div>
                                                <ul className="space-y-1">
                                                    {review.cons.map((con, i) => (
                                                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                            <X className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                                                            {con}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleLike(review.id)}
                                        disabled={!user}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${hasLiked
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
                                            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">Faydalı ({review.likeCount})</span>
                                    </button>

                                    {isOwner && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
