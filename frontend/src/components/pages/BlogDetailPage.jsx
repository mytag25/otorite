import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Share2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../context/LanguageContext';
import { blogAPI } from '../../services/api';
import useTitle from '../../hooks/useTitle';

const categories = [
  { id: 'review', name: { tr: 'İnceleme', en: 'Review' } },
  { id: 'news', name: { tr: 'Haber', en: 'News' } },
  { id: 'comparison', name: { tr: 'Karşılaştırma', en: 'Comparison' } },
  { id: 'guide', name: { tr: 'Rehber', en: 'Guide' } }
];

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, getLocalizedText } = useLanguage();
  useTitle(post ? getLocalizedText(post.title) : 'Yükleniyor...');

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await blogAPI.getById(id);
        setPost(data);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const allImages = post ? [post.coverImage, ...(post.images || [])].filter(Boolean) : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Yazı bulunamadı</h2>
          <Button onClick={() => navigate('/blog')} className="bg-amber-500 hover:bg-amber-600">
            Blog'a Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Image with Slider */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={allImages[currentImageIndex]}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        {/* Slider Controls */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-amber-500 w-6' : 'bg-white/50 hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Blog'a Dön
        </Button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-amber-500 text-white mb-4">
              {getLocalizedText(categories.find(c => c.id === post.category)?.name)}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {getLocalizedText(post.title)}
            </h1>
            <div className="flex items-center gap-6 text-slate-300">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.authorName}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {post.views || 0} görüntülenme
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Summary */}
        <p className="text-xl text-slate-300 mb-8 leading-relaxed border-l-4 border-amber-500 pl-6">
          {getLocalizedText(post.summary)}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-300">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Main Content */}
        <article className="prose prose-invert prose-lg max-w-none">
          <div
            className="text-slate-300 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{
              __html: (getLocalizedText(post.content) || '').replace(/\n/g, '<br />')
            }}
          />
        </article>

        {/* Image Gallery */}
        {allImages.length > 1 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-4">Galeri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-amber-500' : ''
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Share2 className="w-4 h-4 mr-2" />
            Paylaş
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
