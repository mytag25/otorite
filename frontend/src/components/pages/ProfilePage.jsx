import React, { useState, useEffect } from 'react';
import {
    User, Mail, Lock, Shield, ChevronRight, Save,
    AlertCircle, CheckCircle, Camera, LogOut, Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    useTitle('Profilim');
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'security'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [personalData, setPersonalData] = useState({
        name: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (user) {
            setPersonalData({
                name: user.name || '',
                email: user.email || ''
            });
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updatedUser = await authAPI.updateProfile(personalData);

            // Update local storage manually since context might not refresh immediately
            const currentAuth = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentAuth, ...updatedUser }));

            setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi.' });
            setTimeout(() => window.location.reload(), 1500); // Reload to refresh context
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Güncelleme sırasında bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.changePassword({
                current_password: passwordData.current,
                new_password: passwordData.new
            });
            setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Şifre değiştirilemedi.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="relative mb-12">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-700" />

                    <div className="relative flex flex-col md:flex-row items-center gap-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 p-1 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
                                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center overflow-hidden">
                                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-orange-500">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 hover:bg-white transition-colors shadow-lg shadow-amber-500/20">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Merhaba, {user.name.split(' ')[0]}!</h1>
                            <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                                <Mail className="w-4 h-4 text-amber-500" />
                                {user.email}
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                                    {user.isAdmin ? 'Premium Admin' : 'Değerli Üye'}
                                </span>
                                <span className="bg-slate-800/50 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-white/5">
                                    Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={logout}
                            variant="outline"
                            className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-2xl px-6"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Çıkış Yap
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-4 space-y-3">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${activeTab === 'personal'
                                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <User className={`w-5 h-5 ${activeTab === 'personal' ? 'text-slate-950' : 'text-amber-500 group-hover:scale-110 transition-transform'}`} />
                                <span className="font-bold">Kişisel Bilgiler</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'personal' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${activeTab === 'security'
                                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Shield className={`w-5 h-5 ${activeTab === 'security' ? 'text-slate-950' : 'text-amber-500 group-hover:scale-110 transition-transform'}`} />
                                <span className="font-bold">Güvenlik Ayarları</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'security' ? 'rotate-90' : ''}`} />
                        </button>

                        <div className="pt-8 opacity-50">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                            <button className="flex items-center gap-3 text-red-500/80 hover:text-red-500 text-sm font-medium px-5 transition-colors group">
                                <Trash2 className="w-4 h-4 group-hover:shake" />
                                Hesabı Kalıcı Olarak Sil
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                {activeTab === 'personal' ? <User size={120} /> : <Shield size={120} />}
                            </div>

                            {message.text && (
                                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <span className="font-medium">{message.text}</span>
                                </div>
                            )}

                            {activeTab === 'personal' ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                        <User className="text-amber-500" />
                                        Profilimi Güncelle
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Ad Soyad</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                                <Input
                                                    value={personalData.name}
                                                    onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                                                    className="bg-slate-950/50 border-white/5 h-12 pl-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white transition-all shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">E-posta</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                                <Input
                                                    type="email"
                                                    value={personalData.email}
                                                    onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                                                    className="bg-slate-950/50 border-white/5 h-12 pl-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white transition-all shadow-inner"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            disabled={loading}
                                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black h-14 w-full md:w-auto md:px-12 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-lg"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 mr-3" />
                                                    Güncellemeleri Kaydet
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                        <Lock className="text-amber-500" />
                                        Şifre İşlemleri
                                    </h2>

                                    <div className="space-y-2 group">
                                        <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Mevcut Şifre</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                type="password"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                className="bg-slate-950/50 border-white/5 h-12 pl-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white transition-all shadow-inner"
                                                required
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Yeni Şifre</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <Input
                                                    type="password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    className="bg-slate-950/50 border-white/5 h-12 pl-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white transition-all shadow-inner"
                                                    required
                                                    placeholder="Yeni şifreniz"
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Tekrar Yeni Şifre</Label>
                                            <div className="relative">
                                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <Input
                                                    type="password"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    className="bg-slate-950/50 border-white/5 h-12 pl-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white transition-all shadow-inner"
                                                    required
                                                    placeholder="Şifrenizi onaylayın"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            disabled={loading}
                                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black h-14 w-full md:w-auto md:px-12 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-lg"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            ) : (
                                                'Şifreyi Değiştir'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
