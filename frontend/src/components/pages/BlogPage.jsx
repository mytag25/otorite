import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Eye, ChevronRight, Star, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { blogAPI } from '../../services/api';
import useTitle from '../../hooks/useTitle';
import '../../styles/premium-blog.css';

const categories = [
  { id: 'all', name: { tr: 'Tümü', en: 'All' } },
  { id: 'review', name: { tr: 'İnceleme', en: 'Review' } },
  { id: 'news', name: { tr: 'Haber', en: 'News' } },
  { id: 'comparison', name: { tr: 'Karşılaştırma', en: 'Comparison' } },
  { id: 'guide', name: { tr: 'Rehber', en: 'Guide' } }
];

const BlogPage = () => {
  const navigate = useNavigate();
  const { language, getLocalizedText } = useLanguage();
  useTitle('Blog ve İncelemeler');

  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const [allPosts, featured] = await Promise.all([
          blogAPI.list({ published: 'true' }),
          blogAPI.list({ featured: true, published: 'true', limit: 3 })
        ]);
        setPosts(allPosts.posts);
        setFeaturedPosts(featured.posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = getLocalizedText(post.title).toLowerCase();
      const summary = getLocalizedText(post.summary).toLowerCase();
      return title.includes(q) || summary.includes(q);
    }
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const getReadTime = (text) => {
    const wordsPerMinute = 200;
    const words = text ? text.split(/\s+/).length : 0;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 blog-bg-gradient pointer-events-none" />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center animate-entry">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full blog-hero-badge mb-6 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Otomotiv Dünyasının Nabzı</span>
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight blog-hero-title">
            Otorite Blog
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            En son otomobil incelemeleri, sektör haberleri ve detaylı karşılaştırmalar ile tutkunuzu ateşleyin.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pro-search-container flex items-center mb-16 animate-entry animate-delay-1">
            <Search className="w-5 h-5 ml-4 text-slate-400" />
            <input
              type="text"
              placeholder="İçerik arayın..."
              className="pro-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Featured Posts (Only show if no search) */}
        {!searchQuery && featuredPosts.length > 0 && (
          <section className="mb-20 animate-entry animate-delay-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Öne Çıkanlar</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Main Featured Post */}
              {featuredPosts[0] && (
                <div
                  onClick={() => navigate(`/blog/${featuredPosts[0].id}`)}
                  className="glass-blog-card featured md:col-span-2 md:h-[500px] group cursor-pointer"
                >
                  <div className="absolute inset-0 card-image-wrapper">
                    <img src={featuredPosts[0].coverImage} alt="" className="w-full h-full object-cover" />
                    <div className="card-overlay" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
                    <span className="inline-block px-3 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-lg shadow-amber-900/40">
                      {getLocalizedText(categories.find(c => c.id === featuredPosts[0].category)?.name)}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight post-title">
                      {getLocalizedText(featuredPosts[0].title)}
                    </h3>
                    <p className="text-slate-300 text-lg line-clamp-2 max-w-3xl mb-6">
                      {getLocalizedText(featuredPosts[0].summary)}
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold border border-slate-600">
                          {featuredPosts[0].authorName?.charAt(0) || 'A'}
                        </div>
                        <div className="text-sm">
                          <p className="text-white font-medium">{featuredPosts[0].authorName || 'Otorite Editör'}</p>
                          <p className="text-slate-500">{formatDate(featuredPosts[0].createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-entry animate-delay-3 sticky top-24 z-30 py-4 backdrop-blur-md rounded-2xl border border-white/5 bg-slate-900/40">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-pill px-6 py-2.5 rounded-full text-sm font-medium ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {getLocalizedText(cat.name)}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-entry animate-delay-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/blog/${post.id}`)}
              className="glass-blog-card h-full flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[16/10] card-image-wrapper">
                <img
                  src={post.coverImage || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800"}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="card-overlay" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-slate-900/80 backdrop-blur text-white text-xs font-bold rounded-lg border border-slate-700">
                    {getLocalizedText(categories.find(c => c.id === post.category)?.name)}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 relative z-10">
                <h3 className="text-xl font-bold mb-3 line-clamp-2 post-title group-hover:text-amber-400">
                  {getLocalizedText(post.title)}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                  {getLocalizedText(post.summary)}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-4">
                    <span className="meta-item">
                      <Clock className="w-4 h-4" />
                      {getReadTime(getLocalizedText(post.content).tr)} dk
                    </span>
                    <span className="meta-item">
                      <Eye className="w-4 h-4" />
                      {post.views || 0}
                    </span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-32 animate-entry">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <FileText className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">İçerik Bulunamadı</h3>
            <p className="text-slate-400">Aradığınız kriterlere uygun yazı mevcut değil.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-6 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
