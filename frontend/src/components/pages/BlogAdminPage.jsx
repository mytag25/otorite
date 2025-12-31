import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Edit, Trash2, Save, X, Search, Eye, EyeOff,
  Star, Image as ImageIcon, ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { blogAPI } from '../../services/api';

const categories = [
  { id: 'review', name: { tr: 'İnceleme', en: 'Review' } },
  { id: 'news', name: { tr: 'Haber', en: 'News' } },
  { id: 'comparison', name: { tr: 'Karşılaştırma', en: 'Comparison' } },
  { id: 'guide', name: { tr: 'Rehber', en: 'Guide' } }
];

const BlogAdminPage = () => {
  const navigate = useNavigate();
  const { getLocalizedText } = useLanguage();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: { tr: '', en: '' },
    summary: { tr: '', en: '' },
    content: { tr: '', en: '' },
    coverImage: '',
    images: [''],
    category: 'review',
    tags: '',
    featured: false,
    published: false
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await blogAPI.list({ published: null });
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Erişim Reddedildi</h2>
          <Button onClick={() => navigate('/')} className="bg-amber-500 hover:bg-amber-600">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const openAddDialog = () => {
    setEditingPost(null);
    setFormData({
      title: { tr: '', en: '' },
      summary: { tr: '', en: '' },
      content: { tr: '', en: '' },
      coverImage: '',
      images: [''],
      category: 'review',
      tags: '',
      featured: false,
      published: false
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || { tr: '', en: '' },
      summary: post.summary || { tr: '', en: '' },
      content: post.content || { tr: '', en: '' },
      coverImage: post.coverImage || '',
      images: post.images?.length > 0 ? post.images : [''],
      category: post.category || 'review',
      tags: post.tags?.join(', ') || '',
      featured: post.featured || false,
      published: post.published || false
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const postData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingPost) {
        await blogAPI.update(editingPost.id, postData);
      } else {
        await blogAPI.create(postData);
      }
      await loadPosts();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Yazı kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await blogAPI.delete(postId);
      setPosts(posts.filter(p => p.id !== postId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title?.tr?.toLowerCase().includes(searchLower) ||
      post.title?.en?.toLowerCase().includes(searchLower)
    );
  });

  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const updateImage = (index, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-amber-500" />
                Blog Yönetimi
              </h1>
              <p className="text-slate-400">{posts.length} yazı</p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Yazı
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            type="text"
            placeholder="Yazı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white"
          />
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden group">
              {post.coverImage && (
                <div className="relative aspect-video">
                  <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {post.featured && (
                      <Badge className="bg-amber-500 text-white">
                        <Star className="w-3 h-3 mr-1" /> Öne Çıkan
                      </Badge>
                    )}
                    <Badge className={post.published ? 'bg-green-500' : 'bg-slate-600'}>
                      {post.published ? 'Yayında' : 'Taslak'}
                    </Badge>
                  </div>
                </div>
              )}
              <div className="p-4">
                <Badge variant="secondary" className="mb-2 bg-slate-800">
                  {getLocalizedText(categories.find(c => c.id === post.category)?.name)}
                </Badge>
                <h3 className="text-white font-bold mb-1">{post.title?.tr || post.title?.en}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                  {post.summary?.tr || post.summary?.en}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    <Eye className="w-4 h-4 inline mr-1" />
                    {post.views || 0}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(post)}
                      className="text-slate-400 hover:text-amber-500 h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(post)}
                      className="text-slate-400 hover:text-red-500 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Henüz yazı yok</h3>
            <p className="text-slate-400 mb-4">Top Gear tarzı içerikler oluşturmaya başlayın.</p>
            <Button onClick={openAddDialog} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> İlk Yazıyı Oluştur
            </Button>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPost ? 'Yazıyı Düzenle' : 'Yeni Yazı'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Başlık (TR)</Label>
                  <Input
                    value={formData.title.tr}
                    onChange={(e) => setFormData({...formData, title: {...formData.title, tr: e.target.value}})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    placeholder="Yazı başlığı..."
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Title (EN)</Label>
                  <Input
                    value={formData.title.en}
                    onChange={(e) => setFormData({...formData, title: {...formData.title, en: e.target.value}})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    placeholder="Post title..."
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Özet (TR)</Label>
                  <Textarea
                    value={formData.summary.tr}
                    onChange={(e) => setFormData({...formData, summary: {...formData.summary, tr: e.target.value}})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    rows={2}
                    placeholder="Kısa özet..."
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Summary (EN)</Label>
                  <Textarea
                    value={formData.summary.en}
                    onChange={(e) => setFormData({...formData, summary: {...formData.summary, en: e.target.value}})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    rows={2}
                    placeholder="Short summary..."
                  />
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">İçerik (TR)</Label>
                  <Textarea
                    value={formData.content.tr}
                    onChange={(e) => setFormData({...formData, content: {...formData.content, tr: e.target.value}})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    rows={8}
                    placeholder="Yazı içeriği... (Markdown desteklenir)"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Content (EN)</Label>
                  <Textarea
                    value={formData.content.en}
                    onChange={(e) => setFormData({...formData, content: {...formData.content, en: e.target.value}})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    rows={8}
                    placeholder="Post content... (Markdown supported)"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <Label className="text-slate-300">Kapak Görseli</Label>
                <Input
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="https://..."
                />
                {formData.coverImage && (
                  <img src={formData.coverImage} alt="Cover" className="mt-2 h-32 rounded-lg object-cover" />
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300">Galeri Görselleri</Label>
                  <Button onClick={addImage} size="sm" variant="outline" className="border-slate-700 text-slate-300">
                    <Plus className="w-4 h-4 mr-1" /> Ekle
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={img}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder={`Görsel URL ${index + 1}`}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      {formData.images.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeImage(index)} className="text-red-400">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Kategori</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-slate-700">
                          {getLocalizedText(cat.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Etiketler (virgülle ayırın)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    placeholder="BMW, SUV, Elektrikli"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(v) => setFormData({...formData, featured: v})}
                  />
                  <Label className="text-slate-300">Öne Çıkar</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(v) => setFormData({...formData, published: v})}
                  />
                  <Label className="text-slate-300">Yayınla</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400">
                İptal
              </Button>
              <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600" disabled={saving}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Kaydet
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Yazıyı Sil</DialogTitle>
              <DialogDescription className="text-slate-400">
                Bu yazıyı silmek istediğinize emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-slate-400">İptal</Button>
              <Button onClick={() => handleDelete(deleteConfirm?.id)} className="bg-red-500 hover:bg-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Sil
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BlogAdminPage;
