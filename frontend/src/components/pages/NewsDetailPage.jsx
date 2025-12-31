
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Calendar, User, Eye, Share2, ArrowLeft, Clock, Sparkles } from "lucide-react";
import DOMPurify from 'dompurify';
import "../../styles/news.css";
import useTitle from "../../hooks/useTitle";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || `http://${window.location.hostname}:8001`;
const API_URL = `${BACKEND_URL}/api`;

const NewsDetailPage = () => {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    useTitle(news ? news.title : 'Haber Yükleniyor...');

    const lastFetchedId = React.useRef(null);

    useEffect(() => {
        // Prevent double fetching in React Strict Mode (dev only)
        if (lastFetchedId.current === id) return;
        lastFetchedId.current = id;

        const fetchNewsDetail = async () => {
            try {
                const response = await axios.get(`${API_URL}/news/${id}`);
                setNews(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news detail:", error);
                setLoading(false);
            }
        };

        fetchNewsDetail();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center news-hero-bg">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col news-hero-bg">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 backdrop-blur">
                        <Sparkles className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Haber Bulunamadı</h2>
                    <Link to="/news" className="text-orange-500 hover:text-orange-400 flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 transition-all hover:bg-orange-500/20">
                        <ArrowLeft size={20} /> Haberlere Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col news-hero-bg">
            <div className="news-hero-glow absolute top-0 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none fixed"></div>

            <article className="flex-1 pb-20 relative z-10">
                {/* Hero / Cover Image */}
                <div className="news-detail-hero relative h-[60vh] min-h-[500px]">
                    <img
                        src={news.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600"}
                        alt={news.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
                        <div className="max-w-4xl mx-auto animate-fade-in-up">
                            <div className="mb-6 flex flex-wrap gap-2">
                                {news.tags.map(tag => (
                                    <span key={tag} className="bg-orange-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg border border-orange-500/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight text-white drop-shadow-lg">
                                {news.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-slate-300 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 inline-flex">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                                        {news.author ? news.author.charAt(0).toUpperCase() : <User size={16} />}
                                    </div>
                                    <span className="font-medium">{news.author}</span>
                                </div>
                                <div className="w-px h-4 bg-slate-700"></div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-orange-500" size={20} />
                                    <span>{new Date(news.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="w-px h-4 bg-slate-700"></div>
                                <div className="flex items-center gap-2">
                                    <Eye className="text-orange-500" size={20} />
                                    <span>{news.viewCount} Okunma</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-8 relative z-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="glass-content-wrapper animate-fade-in-up delay-200">
                            {/* Summary */}
                            <div className="text-xl md:text-2xl text-orange-100/90 font-medium italic border-l-4 border-orange-500 pl-6 mb-10 py-2 leading-relaxed">
                                {news.summary}
                            </div>

                            {/* Main Content */}
                            <div
                                className="prose-premium prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
                            />

                            {/* Footer Actions */}
                            <div className="mt-16 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Link
                                    to="/news"
                                    className="text-slate-400 hover:text-white flex items-center gap-2 transition-all hover:-translate-x-1"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <ArrowLeft size={20} />
                                    </div>
                                    <span className="font-medium">Tüm Haberlere Dön</span>
                                </Link>

                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all font-semibold border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-orange-500/10 group">
                                        <Share2 size={20} className="group-hover:text-orange-500 transition-colors" />
                                        <span>Paylaş</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default NewsDetailPage;
