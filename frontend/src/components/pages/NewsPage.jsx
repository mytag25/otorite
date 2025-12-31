import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Calendar, ArrowRight, Sparkles } from "lucide-react";
import useTitle from "../../hooks/useTitle";
import "../../styles/news.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || `http://${window.location.hostname}:8001`;
const API_URL = `${BACKEND_URL}/api`;

const NewsPage = () => {
    useTitle('Güncel Haberler');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axios.get(`${API_URL}/news`);
            setNews(response.data.news);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching news:", error);
            setLoading(false);
        }
    };

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen text-white flex flex-col news-hero-bg">
            <div className="news-hero-glow absolute top-0 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none"></div>

            <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
                {/* Hero / Header Section */}
                <section className="text-center mb-20 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Otomobil Dünyasının Nabzı</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            En Güncel
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                            Haberler ve İncelemeler
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Endüstrinin en yeni gelişmelerini, derinlemesine analizleri ve özel incelemeleri keşfedin.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-12 max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Haber başlığı veya içerik ara..."
                            className="block w-full pl-12 pr-4 py-4 border border-slate-700/50 rounded-2xl leading-5 bg-slate-900/60 backdrop-blur-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 sm:text-lg transition-all shadow-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </section>

                {/* News Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[400px] rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
                        {filteredNews.map((item, index) => (
                            <div
                                key={item.id}
                                className="news-card-premium animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <article className="news-card-inner group">
                                    <div className="news-image-wrapper-premium">
                                        <img
                                            src={item.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"}
                                            alt={item.title}
                                            className="news-image-premium"
                                        />
                                        <div className="news-overlay-premium"></div>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {item.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="news-tag-premium backdrop-blur-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="news-content-premium">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                                            <Calendar size={14} className="text-orange-500" />
                                            <span>{new Date(item.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>

                                        <h2 className="news-title-premium">{item.title}</h2>
                                        <p className="news-summary-premium">{item.summary}</p>

                                        <Link to={`/news/${item.id}`} className="read-more-btn-premium mt-auto group/btn">
                                            <span>Devamını Oku</span>
                                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredNews.length === 0 && (
                    <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
                        <p className="text-slate-500">Arama kriterlerinize uygun haber bulunamadı.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NewsPage;
