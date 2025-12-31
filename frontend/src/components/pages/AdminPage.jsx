import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, FileText, Sparkles, Newspaper,
  BookOpen, Settings, Search, Bell, Menu, X, Heart, LogOut,
  Eye, MoreHorizontal, Plus, Edit, Trash2, Save, Shield,
  ChevronDown, ChevronUp, Image as ImageIcon, User, Warehouse, Home
} from 'lucide-react';


import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { vehiclesAPI, staticAPI, authAPI, blogAPI } from '../../services/api';
import api from '../../services/api';
import useTitle from '../../hooks/useTitle';
import '../../styles/admin-glass.css';

const scoringDimensions = [
  { id: 'reliability', name: 'Güvenilirlik', icon: '🛡️' },
  { id: 'buildQuality', name: 'Yapı Kalitesi', icon: '🔧' },
  { id: 'performance', name: 'Performans', icon: '⚡' },
  { id: 'drivingExperience', name: 'Sürüş Deneyimi', icon: '🎯' },
  { id: 'technology', name: 'Teknoloji', icon: '💻' },
  { id: 'safety', name: 'Güvenlik', icon: '🔒' },
  { id: 'costOfOwnership', name: 'Sahip Olma Maliyeti', icon: '💰' },
  { id: 'design', name: 'Tasarım', icon: '🎨' },
  { id: 'valueForMoney', name: 'Fiyat/Performans', icon: '📈' },
  { id: 'overall', name: 'Genel Puan', icon: '⭐' }
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { t, getLocalizedText } = useLanguage();
  const { user } = useAuth();
  const { isChristmasEnabled, toggleChristmas, loading: themeLoading } = useTheme();
  useTitle('Admin Paneli');

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { logout } = useAuth();

  // News state
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsFormData, setNewsFormData] = useState({
    title: '', summary: '', content: '', image: '', tags: '', isPublished: true
  });

  // Blog state
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: { tr: '', en: '' }, summary: { tr: '', en: '' }, content: { tr: '', en: '' },
    coverImage: '', category: 'review', tags: '', featured: false, published: false
  });

  const blogCategories = [
    { id: 'review', name: 'İnceleme' }, { id: 'news', name: 'Haber' },
    { id: 'comparison', name: 'Karşılaştırma' }, { id: 'guide', name: 'Rehber' }
  ];

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Yeni araç eklendi', desc: 'BMW 3 Series veritabanına eklendi', time: '5 dk önce', read: false },
    { id: 2, title: 'Kullanıcı kaydı', desc: 'Yeni bir kullanıcı sisteme kaydoldu', time: '1 saat önce', read: false },
    { id: 3, title: 'Sistem güncellemesi', desc: 'v2.1.0 başarıyla yüklendi', time: '2 saat önce', read: true },
  ];

  // Form state
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '2024', segment: '', images: [''],
    specs: { engine: '', power: '', torque: '', acceleration: '', topSpeed: '' },
    scores: {}, strengths: { tr: [''], en: [''] }, weaknesses: { tr: [''], en: [''] },
    bestFor: { tr: '', en: '' },
    editorial: { content: { tr: '', en: '' }, verdict: { tr: '', en: '' }, summary: { tr: '', en: '' } },
    reliability_details: {
      engine: { tr: '', en: '' }, transmission: { tr: '', en: '' },
      electronics: { tr: '', en: '' }, materials: { tr: '', en: '' }, editor_note: { tr: '', en: '' }
    },
    slug: ''
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Critical data
        const [vehiclesRes, brandsData, segmentsData, yearsData, usersRes] = await Promise.all([
          vehiclesAPI.list({ limit: 100 }),
          staticAPI.getBrands(),
          staticAPI.getSegments(),
          staticAPI.getYears(),
          authAPI.listUsers()
        ]);
        setVehicles(vehiclesRes.vehicles);
        setBrands(brandsData);
        setSegments(segmentsData);
        setYears(yearsData);
        setUsers(usersRes);

        // Non-critical data - load separately so failures don't block critical data
        try {
          const newsRes = await api.get('/news?limit=100&published=all');
          setNews(newsRes.data.news);
        } catch (e) {
          console.error('Failed to load news:', e);
        }

        try {
          const blogRes = await blogAPI.list({ published: 'all', limit: 100 });
          setBlogPosts(blogRes.posts);
        } catch (e) {
          console.error('Failed to load blog posts:', e);
        }

      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleAdmin = async (userId, currentState) => {
    try {
      await authAPI.updateUserRole(userId, !currentState);
      setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !currentState } : u));
    } catch (error) {
      alert(error.response?.data?.detail || 'Yetki güncellenemedi');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await authAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      alert(error.response?.data?.detail || 'Kullanıcı silinemedi');
    }
  };

  // News Functions
  const loadNews = async () => {
    setNewsLoading(true);
    try {
      const response = await api.get('/news?limit=100&published=all');
      setNews(response.data.news);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const openAddNews = () => {
    setEditingNews(null);
    setNewsFormData({ title: '', summary: '', content: '', image: '', tags: '', isPublished: true });
    setNewsDialogOpen(true);
  };

  const openEditNews = (item) => {
    setEditingNews(item);
    setNewsFormData({
      title: item.title, summary: item.summary, content: item.content,
      image: item.image, tags: item.tags?.join(', ') || '', isPublished: item.isPublished
    });
    setNewsDialogOpen(true);
  };

  const handleSaveNews = async () => {
    setSaving(true);
    try {
      const payload = {
        title: newsFormData.title, summary: newsFormData.summary, content: newsFormData.content,
        image: newsFormData.image, tags: newsFormData.tags.split(',').map(t => t.trim()).filter(t => t),
        isPublished: newsFormData.isPublished
      };
      if (editingNews) {
        await api.put(`/news/${editingNews.id}`, payload);
      } else {
        await api.post('/news', payload);
      }
      setNewsDialogOpen(false);
      loadNews();
    } catch (error) {
      alert('Haber kaydedilemedi: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Bu haberi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/news/${id}`);
      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      alert('Haber silinemedi');
    }
  };

  // Blog Functions
  const loadBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const response = await blogAPI.list({ published: 'all', limit: 100 });
      setBlogPosts(response.posts);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setBlogLoading(false);
    }
  };

  const openAddBlog = () => {
    setEditingBlog(null);
    setBlogFormData({
      title: { tr: '', en: '' }, summary: { tr: '', en: '' }, content: { tr: '', en: '' },
      coverImage: '', category: 'review', tags: '', featured: false, published: false
    });
    setBlogDialogOpen(true);
  };

  const openEditBlog = (post) => {
    setEditingBlog(post);
    setBlogFormData({
      title: post.title || { tr: '', en: '' }, summary: post.summary || { tr: '', en: '' },
      content: post.content || { tr: '', en: '' }, coverImage: post.coverImage || '',
      category: post.category || 'review', tags: post.tags?.join(', ') || '',
      featured: post.featured || false, published: post.published || false
    });
    setBlogDialogOpen(true);
  };

  const handleSaveBlog = async () => {
    setSaving(true);
    try {
      const postData = {
        ...blogFormData,
        tags: blogFormData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      if (editingBlog) {
        await blogAPI.update(editingBlog.id, postData);
      } else {
        await blogAPI.create(postData);
      }
      setBlogDialogOpen(false);
      loadBlogPosts();
    } catch (error) {
      alert('Blog yazısı kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    try {
      await blogAPI.delete(id);
      setBlogPosts(blogPosts.filter(p => p.id !== id));
    } catch (error) {
      alert('Yazı silinemedi');
    }
  };

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="admin-glass-layout">
        <div className="admin-main" style={{ marginLeft: 0 }}>
          <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Shield size={40} style={{ color: '#ef4444' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Erişim Reddedildi</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Bu sayfaya erişim için admin yetkileri gereklidir.</p>
              <button onClick={() => navigate('/')} className="glass-btn glass-btn-primary">Ana Sayfaya Dön</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchQuery) return true;
    const brand = brands.find(b => b.id === vehicle.brand);
    const searchLower = searchQuery.toLowerCase();
    return brand?.name.toLowerCase().includes(searchLower) || vehicle.model.toLowerCase().includes(searchLower);
  });

  const initializeScores = () => {
    const scores = {};
    scoringDimensions.forEach(dim => {
      scores[dim.id] = { score: 7, justification: { tr: '', en: '' } };
    });
    return scores;
  };

  const openAddDialog = () => {
    setEditingVehicle(null);
    setFormData({
      brand: '', model: '', year: '2024', segment: '', images: [''],
      specs: { engine: '', power: '', torque: '', acceleration: '', topSpeed: '' },
      scores: initializeScores(), strengths: { tr: [''], en: [''] }, weaknesses: { tr: [''], en: [''] },
      bestFor: { tr: '', en: '' },
      editorial: { content: { tr: '', en: '' }, verdict: { tr: '', en: '' }, summary: { tr: '', en: '' } },
      reliability_details: {
        engine: { tr: '', en: '' }, transmission: { tr: '', en: '' },
        electronics: { tr: '', en: '' }, materials: { tr: '', en: '' }, editor_note: { tr: '', en: '' }
      },
      slug: ''
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    let images = vehicle.images?.length > 0 ? vehicle.images : (vehicle.image ? [vehicle.image] : ['']);
    let scores = vehicle.scores || {};
    scoringDimensions.forEach(dim => {
      if (!scores[dim.id]) scores[dim.id] = { score: 7, justification: { tr: '', en: '' } };
    });
    let strengths = vehicle.strengths || { tr: [], en: [] };
    let weaknesses = vehicle.weaknesses || { tr: [], en: [] };
    if (!Array.isArray(strengths.tr)) strengths.tr = strengths.tr ? [strengths.tr] : [''];
    if (!Array.isArray(strengths.en)) strengths.en = strengths.en ? [strengths.en] : [''];
    if (!Array.isArray(weaknesses.tr)) weaknesses.tr = weaknesses.tr ? [weaknesses.tr] : [''];
    if (!Array.isArray(weaknesses.en)) weaknesses.en = weaknesses.en ? [weaknesses.en] : [''];
    if (strengths.tr.length === 0) strengths.tr = [''];
    if (strengths.en.length === 0) strengths.en = [''];
    if (weaknesses.tr.length === 0) weaknesses.tr = [''];
    if (weaknesses.en.length === 0) weaknesses.en = [''];
    let editorial = vehicle.editorial || { content: { tr: '', en: '' }, verdict: { tr: '', en: '' }, summary: { tr: '', en: '' } };
    if (!editorial.content) editorial.content = { tr: '', en: '' };
    if (!editorial.verdict) editorial.verdict = { tr: '', en: '' };
    if (!editorial.summary) editorial.summary = { tr: '', en: '' };

    setFormData({
      brand: vehicle.brand, model: vehicle.model, year: vehicle.year.toString(), segment: vehicle.segment,
      images, specs: vehicle.specs || { engine: '', power: '', torque: '', acceleration: '', topSpeed: '' },
      scores, strengths, weaknesses, bestFor: vehicle.bestFor || { tr: '', en: '' },
      reliability_details: vehicle.reliability_details || {
        engine: { tr: '', en: '' }, transmission: { tr: '', en: '' },
        electronics: { tr: '', en: '' }, materials: { tr: '', en: '' }, editor_note: { tr: '', en: '' }
      },
      editorial, slug: vehicle.slug || ''
    });
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const filteredImages = formData.images.filter(img => img.trim() !== '');
      const vehicleData = {
        brand: formData.brand, model: formData.model, year: parseInt(formData.year), segment: formData.segment,
        image: filteredImages[0] || '', images: filteredImages, specs: formData.specs, scores: formData.scores,
        strengths: { tr: formData.strengths.tr.filter(s => s.trim()), en: formData.strengths.en.filter(s => s.trim()) },
        weaknesses: { tr: formData.weaknesses.tr.filter(s => s.trim()), en: formData.weaknesses.en.filter(s => s.trim()) },
        bestFor: formData.bestFor, reliability_details: formData.reliability_details,
        editorial: formData.editorial, slug: formData.slug
      };
      if (editingVehicle) {
        const updated = await vehiclesAPI.update(editingVehicle.id, vehicleData);
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? updated : v));
      } else {
        const created = await vehiclesAPI.create(vehicleData);
        setVehicles([created, ...vehicles]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      alert('Araç kaydedilemedi: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    try {
      await vehiclesAPI.delete(vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      setDeleteConfirm(null);
    } catch (error) {
      alert('Araç silinemedi');
    }
  };

  const updateScore = (dimId, value) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [dimId]: { ...prev.scores[dimId], score: value } }
    }));
  };

  const updateJustification = (dimId, lang, value) => {
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [dimId]: { ...prev.scores[dimId], justification: { ...prev.scores[dimId]?.justification, [lang]: value } }
      }
    }));
  };

  const addImage = () => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImage = (index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  const updateImage = (index, value) => setFormData(prev => ({ ...prev, images: prev.images.map((img, i) => i === index ? value : img) }));
  const addStrength = (lang) => setFormData(prev => ({ ...prev, strengths: { ...prev.strengths, [lang]: [...prev.strengths[lang], ''] } }));
  const addWeakness = (lang) => setFormData(prev => ({ ...prev, weaknesses: { ...prev.weaknesses, [lang]: [...prev.weaknesses[lang], ''] } }));

  const selectedBrand = brands.find(b => b.id === formData.brand);
  const availableModels = selectedBrand?.models || [];

  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore >= 7.0) return '#10b981';
    if (numScore >= 4.0) return '#f97316';
    return '#ef4444';
  };

  // Calculate stats
  const totalReviews = vehicles.reduce((sum, v) => sum + (v.scores?.overall?.score ? 1 : 0), 0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Araçlar', icon: Car, badge: vehicles.length },
    { id: 'users', label: 'Kullanıcılar', icon: Users, badge: users.length || null },
    { id: 'reviews', label: 'İncelemeler', icon: FileText },
  ];

  const contentItems = [
    { id: 'news', label: 'Haberler', icon: Newspaper },
    { id: 'blog', label: 'Blog Yazıları', icon: BookOpen },
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Global search filtering
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { vehicles: [], users: [] };
    const query = searchQuery.toLowerCase();
    const matchedVehicles = vehicles.filter(v => {
      const brand = brands.find(b => b.id === v.brand);
      return brand?.name.toLowerCase().includes(query) || v.model.toLowerCase().includes(query);
    }).slice(0, 5);
    const matchedUsers = users.filter(u =>
      u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    ).slice(0, 5);
    return { vehicles: matchedVehicles, users: matchedUsers };
  };

  const searchResults = getSearchResults();

  if (loading) {
    return (
      <div className="admin-glass-layout">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-glass-layout">
      <div className={`admin-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 blur-sm opacity-60 group-hover:opacity-80" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/40 transition-all border border-white/10">
                <Car className="w-5 h-5 text-white transform -rotate-6 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white leading-none tracking-tight group-hover:text-amber-500 transition-colors">OTORİTE</span>
                <span className="admin-sidebar-logo-badge">Admin</span>
              </div>
              <span className="text-[9px] text-amber-500 font-bold tracking-[0.2em] uppercase">AUTO RANK</span>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <span className="admin-nav-section-title">Ana Menü</span>
            {navItems.map((item) => (
              <div key={item.id} className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => handleNavClick(item.id)}>
                <item.icon className="admin-nav-item-icon" size={20} />
                <span>{item.label}</span>
                {item.badge > 0 && <span className="admin-nav-item-badge">{item.badge}</span>}
              </div>
            ))}
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-section-title">İçerik</span>
            {contentItems.map((item) => (
              <div key={item.id} className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => handleNavClick(item.id)}>
                <item.icon className="admin-nav-item-icon" size={20} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-section-title">Sistem</span>
            <div className={`admin-nav-item ${activeSection === 'settings' ? 'active' : ''}`} onClick={() => setActiveSection('settings')}>
              <Settings className="admin-nav-item-icon" size={20} />
              <span>Ayarlar</span>
            </div>
            <div className="admin-nav-item" onClick={() => navigate('/')}>
              <Home className="admin-nav-item-icon" size={20} />
              <span>Siteye Dön</span>
            </div>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">{user?.name || 'Admin'}</div>
              <div className="admin-sidebar-user-role">Sistem Yöneticisi</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="admin-topbar-title">
                {activeSection === 'dashboard' && 'Dashboard'}
                {activeSection === 'vehicles' && 'Araçlar'}
                {activeSection === 'users' && 'Kullanıcılar'}
                {activeSection === 'reviews' && 'İncelemeler'}
                {activeSection === 'settings' && 'Ayarlar'}
                {activeSection === 'news' && 'Haberler'}
                {activeSection === 'blog' && 'Blog Yazıları'}
                <span className="admin-topbar-subtitle"> Genel Bakış</span>
              </h1>
            </div>
          </div>

          <div className="admin-search" style={{ position: 'relative' }}>
            <Search className="admin-search-icon" size={20} />
            <input type="text" className="admin-search-input" placeholder="Ara... (araç, kullanıcı, içerik)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && (searchResults.vehicles.length > 0 || searchResults.users.length > 0) && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', zIndex: 100 }}>
                {searchResults.vehicles.length > 0 && (
                  <div style={{ marginBottom: searchResults.users.length > 0 ? '8px' : 0 }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', padding: '4px 8px', textTransform: 'uppercase' }}>Araçlar</div>
                    {searchResults.vehicles.map(v => {
                      const brand = brands.find(b => b.id === v.brand);
                      return (
                        <div key={v.id} onClick={() => { openEditDialog(v); setSearchQuery(''); }} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} className="admin-nav-item">
                          <Car size={16} style={{ opacity: 0.5 }} />
                          <span style={{ color: 'white' }}>{brand?.name} {v.model}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {searchResults.users.length > 0 && (
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', padding: '4px 8px', textTransform: 'uppercase' }}>Kullanıcılar</div>
                    {searchResults.users.map(u => (
                      <div key={u.id} onClick={() => { setActiveSection('users'); setSearchQuery(''); }} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} className="admin-nav-item">
                        <User size={16} style={{ opacity: 0.5 }} />
                        <span style={{ color: 'white' }}>{u.name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{u.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="admin-topbar-right">
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button className="admin-topbar-btn" onClick={() => { setNotificationsOpen(!notificationsOpen); setUserDropdownOpen(false); }}>
                <Bell size={20} />
                <span className="admin-topbar-btn-badge">{notifications.filter(n => !n.read).length}</span>
              </button>
              {notificationsOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '320px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', zIndex: 100 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 600 }}>Bildirimler</span>
                    <span style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer' }}>Tümünü okundu işaretle</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(59,130,246,0.1)' }} className="admin-nav-item">
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{n.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>{n.desc}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <div className="admin-topbar-avatar" onClick={() => { setUserDropdownOpen(!userDropdownOpen); setNotificationsOpen(false); }} style={{ cursor: 'pointer' }}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              {userDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '200px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', zIndex: 100 }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>Hesabım</div>
                    <div onClick={() => { navigate('/profile'); setUserDropdownOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} className="admin-nav-item">
                      <User size={16} style={{ color: '#f59e0b' }} />
                      <span style={{ color: 'white', fontSize: '14px' }}>Profil Ayarları</span>
                    </div>
                    <div onClick={() => { navigate('/favorites'); setUserDropdownOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} className="admin-nav-item">
                      <Heart size={16} style={{ color: '#ec4899' }} />
                      <span style={{ color: 'white', fontSize: '14px' }}>Favoriler</span>
                    </div>
                    <div onClick={() => { navigate('/garage/my'); setUserDropdownOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} className="admin-nav-item">
                      <Warehouse size={16} style={{ color: '#10b981' }} />
                      <span style={{ color: 'white', fontSize: '14px' }}>Garajım</span>
                    </div>
                  </div>
                  <div style={{ padding: '0 12px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>Yönetim</div>
                    <div onClick={() => { setActiveSection('dashboard'); setUserDropdownOpen(false); }} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} className="admin-nav-item">
                      <Settings size={16} style={{ color: '#8b5cf6' }} />
                      <span style={{ color: 'white', fontSize: '14px' }}>Yönetim</span>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '8px' }}>
                    <div onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} className="admin-nav-item">
                      <LogOut size={16} style={{ color: '#ef4444' }} />
                      <span style={{ color: '#ef4444', fontSize: '14px' }}>Çıkış</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <>
              <div className="stat-cards-grid">
                <div className="stat-card blue">
                  <div className="stat-card-header">
                    <div className="stat-card-icon"><Car size={24} /></div>
                    <div className="stat-card-menu"><MoreHorizontal size={16} /></div>
                  </div>
                  <div className="stat-card-value">{vehicles.length}</div>
                  <div className="stat-card-label">Toplam Araç</div>
                  <div className="stat-card-footer">
                    <div className="stat-card-metric"><span className="stat-card-metric-value">+12</span><span className="stat-card-metric-label">Bu Ay</span></div>
                    <div className="stat-card-metric"><span className="stat-card-metric-value" style={{ color: '#10b981' }}>+8%</span><span className="stat-card-metric-label">Artış</span></div>
                  </div>
                </div>

                <div className="stat-card amber">
                  <div className="stat-card-header">
                    <div className="stat-card-icon"><Users size={24} /></div>
                    <div className="stat-card-menu"><MoreHorizontal size={16} /></div>
                  </div>
                  <div className="stat-card-value">{users.length}</div>
                  <div className="stat-card-label">Kayıtlı Kullanıcı</div>
                  <div className="stat-card-footer">
                    <div className="stat-card-metric"><span className="stat-card-metric-value">+48</span><span className="stat-card-metric-label">Bu Hafta</span></div>
                    <div className="stat-card-metric"><span className="stat-card-metric-value" style={{ color: '#10b981' }}>+15%</span><span className="stat-card-metric-label">Artış</span></div>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-card-header">
                    <div className="stat-card-icon"><FileText size={24} /></div>
                    <div className="stat-card-menu"><MoreHorizontal size={16} /></div>
                  </div>
                  <div className="stat-card-value">{totalReviews}</div>
                  <div className="stat-card-label">İnceleme</div>
                  <div className="stat-card-footer">
                    <div className="stat-card-metric"><span className="stat-card-metric-value">+{Math.floor(totalReviews * 0.1)}</span><span className="stat-card-metric-label">Bu Ay</span></div>
                    <div className="stat-card-metric"><span className="stat-card-metric-value" style={{ color: '#f59e0b' }}>4.8★</span><span className="stat-card-metric-label">Ort. Puan</span></div>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-card-header">
                    <div className="stat-card-icon"><Eye size={24} /></div>
                    <div className="stat-card-menu"><MoreHorizontal size={16} /></div>
                  </div>
                  <div className="stat-card-value">{(vehicles.length * 8234).toLocaleString()}</div>
                  <div className="stat-card-label">Aylık Ziyaret</div>
                  <div className="stat-card-footer">
                    <div className="stat-card-metric"><span className="stat-card-metric-value">2.4K</span><span className="stat-card-metric-label">Bugün</span></div>
                    <div className="stat-card-metric"><span className="stat-card-metric-value" style={{ color: '#10b981' }}>+22%</span><span className="stat-card-metric-label">Artış</span></div>
                  </div>
                </div>
              </div>

              <div className="chart-grid">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div><span className="chart-card-title">Ziyaret Analizi</span><span className="chart-card-subtitle"> Son 30 Gün</span></div>
                    <div className="chart-card-actions">
                      <span className="chart-tab active">Günlük</span>
                      <span className="chart-tab">Haftalık</span>
                      <span className="chart-tab">Aylık</span>
                    </div>
                  </div>
                  <div className="chart-placeholder">
                    <svg viewBox="0 0 800 280" preserveAspectRatio="none">
                      <defs><linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" /><stop offset="100%" stopColor="rgba(59, 130, 246, 0)" /></linearGradient></defs>
                      <path d="M0,200 Q100,180 200,160 T400,120 T600,140 T800,100 L800,280 L0,280 Z" fill="url(#chartGradient)" />
                      <path d="M0,200 Q100,180 200,160 T400,120 T600,140 T800,100" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="200" cy="160" r="6" fill="#3b82f6" /><circle cx="400" cy="120" r="6" fill="#3b82f6" /><circle cx="600" cy="140" r="6" fill="#3b82f6" />
                    </svg>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-card-header"><span className="chart-card-title">Performans</span></div>
                  <div className="progress-list">
                    {[{ label: 'SDK Entegrasyonu', value: 78, color: 'blue' }, { label: 'API Kullanımı', value: 92, color: 'green' }, { label: 'Önbellek Verimliliği', value: 65, color: 'amber' }, { label: 'CDN Dağıtımı', value: 88, color: 'purple' }].map((item, i) => (
                      <div key={i} className="progress-item">
                        <div className="progress-item-header"><span className="progress-item-label">{item.label}</span><span className="progress-item-value">{item.value}%</span></div>
                        <div className="progress-bar"><div className={`progress-bar-fill ${item.color}`} style={{ width: `${item.value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="system-grid">
                <div className="system-card"><div className="system-card-indicator online" /><div className="system-card-info"><div className="system-card-title">API Sunucusu</div><div className="system-card-status">Çalışıyor • 99.9% uptime</div></div><div className="system-card-value">45ms</div></div>
                <div className="system-card"><div className="system-card-indicator online" /><div className="system-card-info"><div className="system-card-title">Veritabanı</div><div className="system-card-status">MongoDB Atlas • Bağlı</div></div><div className="system-card-value">12ms</div></div>
                <div className="system-card"><div className="system-card-indicator warning" /><div className="system-card-info"><div className="system-card-title">AI Servisleri</div><div className="system-card-status">Gemini API • Yüksek kullanım</div></div><div className="system-card-value">320ms</div></div>
              </div>
            </>
          )}

          {/* VEHICLES */}
          {activeSection === 'vehicles' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="glass-btn glass-btn-primary" onClick={openAddDialog}><Plus size={18} /> Yeni Araç Ekle</button>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Araç</th>
                      <th>Segment</th>
                      <th>Yıl</th>
                      <th style={{ textAlign: 'center' }}>Puan</th>
                      <th style={{ textAlign: 'center' }}>Resim</th>
                      <th style={{ textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map(vehicle => {
                      const brand = brands.find(b => b.id === vehicle.brand);
                      const segment = segments.find(s => s.id === vehicle.segment);
                      const overallScore = vehicle.scores?.overall?.score || 0;
                      return (
                        <tr key={vehicle.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={vehicle.images?.[0] || vehicle.image} alt="" style={{ width: '64px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                              <div>
                                <div style={{ color: 'white', fontWeight: 500 }}>{brand?.name} {vehicle.model}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{vehicle.specs?.power}</div>
                              </div>
                            </div>
                          </td>
                          <td>{segment ? getLocalizedText(segment.name) : vehicle.segment}</td>
                          <td>{vehicle.year}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: getScoreColor(overallScore) }}>{overallScore.toFixed(1)}</td>
                          <td style={{ textAlign: 'center' }}><ImageIcon size={16} style={{ opacity: 0.5 }} /> {vehicle.images?.length || 1}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="glass-btn glass-btn-ghost" style={{ padding: '8px', marginRight: '8px' }} onClick={() => openEditDialog(vehicle)}><Edit size={16} /></button>
                            <button className="glass-btn glass-btn-ghost" style={{ padding: '8px', color: '#ef4444' }} onClick={() => setDeleteConfirm(vehicle)}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* USERS */}
          {activeSection === 'users' && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="glass-table">
                <thead>
                  <tr><th>Kullanıcı</th><th>E-posta</th><th>Kayıt Tarihi</th><th style={{ textAlign: 'center' }}>Rol</th><th style={{ textAlign: 'right' }}>İşlemler</th></tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px' }}>Yükleniyor...</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>{u.name.charAt(0).toUpperCase()}</div><span style={{ color: 'white' }}>{u.name}</span></div></td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td style={{ textAlign: 'center' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: u.isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', color: u.isAdmin ? '#f59e0b' : 'rgba(255,255,255,0.5)', border: `1px solid ${u.isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}` }}>{u.isAdmin ? 'ADMIN' : 'ÜYE'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="glass-btn glass-btn-ghost" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => handleToggleAdmin(u.id, u.isAdmin)} disabled={u.id === user.id}>{u.isAdmin ? 'Yetki Al' : 'Admin Yap'}</button>
                        <button className="glass-btn glass-btn-ghost" style={{ padding: '8px', color: '#ef4444' }} onClick={() => handleDeleteUser(u.id)} disabled={u.id === user.id}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REVIEWS */}
          {activeSection === 'reviews' && (
            <div className="glass-card">
              <h2 style={{ color: 'white', marginBottom: '16px' }}>Araç İncelemeleri</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Toplam {totalReviews} araç incelemesi mevcut. Her aracın 10 boyutlu puanlama sistemi bulunmaktadır.</p>
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {vehicles.slice(0, 6).map(v => {
                  const brand = brands.find(b => b.id === v.brand);
                  return (
                    <div key={v.id} className="glass-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 600 }}>{brand?.name} {v.model}</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: getScoreColor(v.scores?.overall?.score || 0) }}>{(v.scores?.overall?.score || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeSection === 'settings' && (
            <div className="glass-card">
              <h2 style={{ color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Sparkles size={24} style={{ color: '#f59e0b' }} /> Görünüm Ayarları</h2>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>🎄 Christmas Teması</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Kar yağışı ve yılbaşı süslemeleri</p>
                  </div>
                  <button onClick={toggleChristmas} disabled={themeLoading} style={{ width: '56px', height: '32px', borderRadius: '16px', background: isChristmasEnabled ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', position: 'absolute', top: '4px', left: isChristmasEnabled ? '28px' : '4px', transition: 'left 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{isChristmasEnabled ? '❄️' : ''}</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NEWS MANAGEMENT */}
          {activeSection === 'news' && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Newspaper size={24} style={{ color: '#3b82f6' }} /> Haber Yönetimi
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontSize: '14px' }}>
                    Toplam {news.length} haber listeleniyor
                  </p>
                </div>
                <button className="glass-btn glass-btn-primary" onClick={openAddNews}>
                  <Plus size={18} /> Yeni Haber Ekle
                </button>
              </div>

              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Görsel</th><th>Başlık</th><th>Durum</th><th>Tarih</th><th style={{ textAlign: 'center' }}>Etiketler</th><th style={{ textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {newsLoading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px' }}>Yükleniyor...</td></tr>
                  ) : news.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.5)' }}>Henüz haber eklenmemiş.</td></tr>
                  ) : news.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ width: '64px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                          {item.image ? (
                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={16} color="rgba(255,255,255,0.3)" /></div>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'white', fontWeight: 500 }}>{item.title}</td>
                      <td>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: item.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: item.isPublished ? '#10b981' : 'rgba(255,255,255,0.5)', border: `1px solid ${item.isPublished ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                          {item.isPublished ? 'YAYINDA' : 'TASLAK'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {item.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>{tag}</span>
                          ))}
                          {item.tags?.length > 2 && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>+{item.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="glass-btn glass-btn-ghost" style={{ padding: '8px', marginRight: '8px' }} onClick={() => openEditNews(item)}><Edit size={16} /></button>
                        <button className="glass-btn glass-btn-ghost" style={{ padding: '8px', color: '#ef4444' }} onClick={() => handleDeleteNews(item.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BLOG MANAGEMENT */}
          {activeSection === 'blog' && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BookOpen size={24} style={{ color: '#8b5cf6' }} /> Blog Yönetimi
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontSize: '14px' }}>
                    Toplam {blogPosts.length} yazı listeleniyor
                  </p>
                </div>
                <button className="glass-btn glass-btn-primary" onClick={openAddBlog}>
                  <Plus size={18} /> Yeni Yazı Ekle
                </button>
              </div>

              <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {blogLoading ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px' }}>Yükleniyor...</div>
                ) : blogPosts.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.5)' }}>Henüz blog yazısı eklenmemiş.</div>
                ) : blogPosts.map(post => (
                  <div key={post.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', ...(!post.published && { border: '1px dashed rgba(255,255,255,0.2)' }) }}>
                    <div style={{ height: '160px', position: 'relative' }}>
                      <img src={post.coverImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: post.published ? 'rgba(16,185,129,0.9)' : 'rgba(15,23,42,0.9)', color: 'white', backdropFilter: 'blur(4px)' }}>
                          {post.published ? 'YAYINDA' : 'TASLAK'}
                        </span>
                        {post.featured && (
                          <span style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: 'rgba(245,158,11,0.9)', color: 'white', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={10} /> ÖNE ÇIKAN
                          </span>
                        )}
                      </div>
                      <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: 'rgba(15,23,42,0.8)', color: 'white', backdropFilter: 'blur(4px)', textTransform: 'uppercase' }}>
                          {blogCategories.find(c => c.id === post.category)?.name || post.category}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ color: 'white', fontWeight: 600, fontSize: '16px', marginBottom: '8px', height: '48px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {post.title?.tr || post.title?.en}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                          <Eye size={14} /> {post.views || 0}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="glass-btn glass-btn-ghost" style={{ padding: '6px' }} onClick={() => openEditBlog(post)}><Edit size={14} /></button>
                          <button className="glass-btn glass-btn-ghost" style={{ padding: '6px', color: '#ef4444' }} onClick={() => handleDeleteBlog(post.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News Dialog */}
          <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <DialogHeader>
                <DialogTitle style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Newspaper size={24} color="#3b82f6" />
                  {editingNews ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input value={newsFormData.title} onChange={e => setNewsFormData({ ...newsFormData, title: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="Haber başlığı" />
                  </div>
                  <div className="space-y-2">
                    <Label>Görsel URL</Label>
                    <div className="flex gap-2">
                      <Input value={newsFormData.image} onChange={e => setNewsFormData({ ...newsFormData, image: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="https://..." />
                      {newsFormData.image && <div className="w-10 h-10 rounded overflow-hidden bg-slate-800 flex-shrink-0"><img src={newsFormData.image} alt="" className="w-full h-full object-cover" /></div>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Özet</Label>
                  <Textarea value={newsFormData.summary} onChange={e => setNewsFormData({ ...newsFormData, summary: e.target.value })} className="bg-slate-800/50 border-slate-700" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>İçerik (HTML)</Label>
                  <Textarea value={newsFormData.content} onChange={e => setNewsFormData({ ...newsFormData, content: e.target.value })} className="bg-slate-800/50 border-slate-700 font-mono text-sm" rows={10} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Etiketler (Virgülle ayırın)</Label>
                    <Input value={newsFormData.tags} onChange={e => setNewsFormData({ ...newsFormData, tags: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="Otomotiv, Teknoloji, ..." />
                  </div>
                  <div className="flex items-center gap-4 pt-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setNewsFormData({ ...newsFormData, isPublished: !newsFormData.isPublished })}>
                      <div style={{ width: '40px', height: '24px', borderRadius: '12px', background: newsFormData.isPublished ? '#10b981' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: newsFormData.isPublished ? '19px' : '3px', transition: 'left 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Yayınla</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button variant="ghost" onClick={() => setNewsDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">İptal</Button>
                <Button onClick={handleSaveNews} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Blog Dialog */}
          <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <DialogHeader>
                <DialogTitle style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BookOpen size={24} color="#8b5cf6" />
                  {editingBlog ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="tr" className="w-full">
                <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start p-1 h-auto">
                  <TabsTrigger value="tr" className="data-[state=active]:bg-slate-700">Türkçe</TabsTrigger>
                  <TabsTrigger value="en" className="data-[state=active]:bg-slate-700">English</TabsTrigger>
                  <TabsTrigger value="media" className="data-[state=active]:bg-slate-700">Medya & Ayarlar</TabsTrigger>
                </TabsList>

                <TabsContent value="tr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Başlık (TR)</Label>
                    <Input value={blogFormData.title.tr} onChange={e => setBlogFormData({ ...blogFormData, title: { ...blogFormData.title, tr: e.target.value } })} className="bg-slate-800/50 border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Özet (TR)</Label>
                    <Textarea value={blogFormData.summary.tr} onChange={e => setBlogFormData({ ...blogFormData, summary: { ...blogFormData.summary, tr: e.target.value } })} className="bg-slate-800/50 border-slate-700" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>İçerik (TR - Markdown)</Label>
                    <Textarea value={blogFormData.content.tr} onChange={e => setBlogFormData({ ...blogFormData, content: { ...blogFormData.content, tr: e.target.value } })} className="bg-slate-800/50 border-slate-700 font-mono text-sm" rows={12} />
                  </div>
                </TabsContent>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input value={blogFormData.title.en} onChange={e => setBlogFormData({ ...blogFormData, title: { ...blogFormData.title, en: e.target.value } })} className="bg-slate-800/50 border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Summary (EN)</Label>
                    <Textarea value={blogFormData.summary.en} onChange={e => setBlogFormData({ ...blogFormData, summary: { ...blogFormData.summary, en: e.target.value } })} className="bg-slate-800/50 border-slate-700" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (EN - Markdown)</Label>
                    <Textarea value={blogFormData.content.en} onChange={e => setBlogFormData({ ...blogFormData, content: { ...blogFormData.content, en: e.target.value } })} className="bg-slate-800/50 border-slate-700 font-mono text-sm" rows={12} />
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Kapak Görseli</Label>
                      <Input value={blogFormData.coverImage} onChange={e => setBlogFormData({ ...blogFormData, coverImage: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="https://..." />
                      {blogFormData.coverImage && <img src={blogFormData.coverImage} alt="" className="w-full h-32 object-cover rounded-lg border border-slate-700 mt-2" />}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Select value={blogFormData.category} onValueChange={v => setBlogFormData({ ...blogFormData, category: v })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {blogCategories.map(c => <SelectItem key={c.id} value={c.id} className="focus:bg-slate-700 cursor-pointer">{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Etiketler</Label>
                        <Input value={blogFormData.tags} onChange={e => setBlogFormData({ ...blogFormData, tags: e.target.value })} className="bg-slate-800/50 border-slate-700" placeholder="Virgülle ayırın" />
                      </div>
                      <div className="flex gap-8 pt-4">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setBlogFormData({ ...blogFormData, published: !blogFormData.published })}>
                          <div style={{ width: '40px', height: '24px', borderRadius: '12px', background: blogFormData.published ? '#10b981' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: blogFormData.published ? '19px' : '3px', transition: 'left 0.3s' }} />
                          </div>
                          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Yayınla</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setBlogFormData({ ...blogFormData, featured: !blogFormData.featured })}>
                          <div style={{ width: '40px', height: '24px', borderRadius: '12px', background: blogFormData.featured ? '#f59e0b' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: blogFormData.featured ? '19px' : '3px', transition: 'left 0.3s' }} />
                          </div>
                          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Öne Çıkar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button variant="ghost" onClick={() => setBlogDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">İptal</Button>
                <Button onClick={handleSaveBlog} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Vehicle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{editingVehicle ? 'Araç Düzenle' : 'Yeni Araç Ekle'}</DialogTitle>
            <DialogDescription className="text-slate-400">Araç bilgilerini, puanları ve görselleri ekleyin.</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-slate-800 border-slate-700 w-full justify-start overflow-x-auto p-1 h-auto flex-wrap gap-1">
              <TabsTrigger value="basic" className="data-[state=active]:bg-amber-500">Temel</TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-amber-500">Görseller</TabsTrigger>
              <TabsTrigger value="scores" className="data-[state=active]:bg-amber-500">Puanlama</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-amber-500">Detaylar</TabsTrigger>
              <TabsTrigger value="editorial" className="data-[state=active]:bg-amber-500">İçerik & SEO</TabsTrigger>
              <TabsTrigger value="reliability" className="data-[state=active]:bg-amber-500">Güvenilirlik</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Marka</Label>
                  <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v, model: '' })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Marka seçin" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">{brands.map(brand => (<SelectItem key={brand.id} value={brand.id} className="text-white hover:bg-slate-700">{brand.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Model</Label>
                  <Select value={formData.model} onValueChange={(v) => setFormData({ ...formData, model: v })} disabled={!formData.brand}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Model seçin" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">{availableModels.map(model => (<SelectItem key={model} value={model} className="text-white hover:bg-slate-700">{model}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Yıl</Label>
                  <Select value={formData.year} onValueChange={(v) => setFormData({ ...formData, year: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">{years.map(year => (<SelectItem key={year} value={year.toString()} className="text-white hover:bg-slate-700">{year}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Segment</Label>
                  <Select value={formData.segment} onValueChange={(v) => setFormData({ ...formData, segment: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Segment seçin" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">{segments.map(segment => (<SelectItem key={segment.id} value={segment.id} className="text-white hover:bg-slate-700">{getLocalizedText(segment.name)}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Motor" value={formData.specs.engine} onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, engine: e.target.value } })} className="bg-slate-800 border-slate-700 text-white" />
                <Input placeholder="Güç" value={formData.specs.power} onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, power: e.target.value } })} className="bg-slate-800 border-slate-700 text-white" />
                <Input placeholder="Tork" value={formData.specs.torque} onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, torque: e.target.value } })} className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Araç Görselleri</Label>
                <Button onClick={addImage} size="sm" variant="outline" className="border-slate-700 text-slate-300"><Plus className="w-4 h-4 mr-1" /> Ekle</Button>
              </div>
              {formData.images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={img} onChange={(e) => updateImage(index, e.target.value)} placeholder={`Görsel URL ${index + 1}`} className="bg-slate-800 border-slate-700 text-white flex-1" />
                  {formData.images.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeImage(index)} className="text-red-400"><X className="w-4 h-4" /></Button>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="scores" className="space-y-4 mt-6">
              {scoringDimensions.map((dim) => (
                <div key={dim.id} className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">{dim.icon} {dim.name}</span>
                    <span className="text-xl font-bold" style={{ color: getScoreColor(formData.scores[dim.id]?.score || 7) }}>{(formData.scores[dim.id]?.score || 7).toFixed(1)}</span>
                  </div>
                  <Slider value={[formData.scores[dim.id]?.score || 7]} onValueChange={([v]) => updateScore(dim.id, v)} min={1} max={10} step={0.1} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Kimler İçin İdeal (TR)</Label>
                <Input value={formData.bestFor.tr} onChange={(e) => setFormData({ ...formData, bestFor: { ...formData.bestFor, tr: e.target.value } })} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">SONUÇ Özeti (Title Style - TR)</Label>
                <Input value={formData.editorial?.verdict?.tr || ''} onChange={(e) => setFormData({ ...formData, editorial: { ...formData.editorial, verdict: { ...formData.editorial?.verdict, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white" placeholder="Örn: Segmentinin en dinamik seçeneği" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">SONUÇ Açıklaması (TR)</Label>
                <Textarea value={formData.editorial?.summary?.tr || ''} onChange={(e) => setFormData({ ...formData, editorial: { ...formData.editorial, summary: { ...formData.editorial?.summary, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white min-h-[80px]" />
              </div>
            </TabsContent>

            <TabsContent value="editorial" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="text-slate-300">SEO Slug (Benzersiz URL)</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-slate-800 border-slate-700 text-white" placeholder="bmw-3-series" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Kapsamlı İnceleme İçeriği (TR - HTML/Markdown)</Label>
                <Textarea value={formData.editorial?.content?.tr || ''} onChange={(e) => setFormData({ ...formData, editorial: { ...formData.editorial, content: { ...formData.editorial?.content, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white min-h-[300px] font-mono text-sm" placeholder="Araç hakkında detaylı makale içeriği..." />
              </div>
            </TabsContent>

            <TabsContent value="reliability" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Motor Güvenilirliği (TR)</Label>
                  <Textarea value={formData.reliability_details.engine.tr} onChange={(e) => setFormData({ ...formData, reliability_details: { ...formData.reliability_details, engine: { ...formData.reliability_details.engine, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Şanzıman Güvenilirliği (TR)</Label>
                  <Textarea value={formData.reliability_details.transmission.tr} onChange={(e) => setFormData({ ...formData, reliability_details: { ...formData.reliability_details, transmission: { ...formData.reliability_details.transmission, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Elektronik Güvenilirliği (TR)</Label>
                  <Textarea value={formData.reliability_details.electronics.tr} onChange={(e) => setFormData({ ...formData, reliability_details: { ...formData.reliability_details, electronics: { ...formData.reliability_details.electronics, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Malzeme Kalitesi (TR)</Label>
                  <Textarea value={formData.reliability_details.materials.tr} onChange={(e) => setFormData({ ...formData, reliability_details: { ...formData.reliability_details, materials: { ...formData.reliability_details.materials, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Editörün Notu (TR)</Label>
                <Textarea value={formData.reliability_details.editor_note.tr} onChange={(e) => setFormData({ ...formData, reliability_details: { ...formData.reliability_details, editor_note: { ...formData.reliability_details.editor_note, tr: e.target.value } } })} className="bg-slate-800 border-slate-700 text-white" rows={3} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400"><X className="w-4 h-4 mr-2" /> İptal</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white" disabled={!formData.brand || !formData.model || saving}><Save className="w-4 h-4 mr-2" /> Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Araç Sil</DialogTitle>
            <DialogDescription className="text-slate-400">{deleteConfirm && <><strong>{brands.find(b => b.id === deleteConfirm.brand)?.name} {deleteConfirm.model}</strong> aracını silmek istediğinize emin misiniz?</>}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-slate-400">İptal</Button>
            <Button onClick={() => handleDelete(deleteConfirm?.id)} className="bg-red-500 hover:bg-red-600 text-white"><Trash2 className="w-4 h-4 mr-2" /> Sil</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
