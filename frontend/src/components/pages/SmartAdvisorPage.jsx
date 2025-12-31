import React, { useState, useRef, useEffect } from 'react';
import { Bot, Camera, Send, Upload, Loader2, Sparkles, AlertCircle, Zap, User, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { aiAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import BackgroundShapes from '../layout/BackgroundShapes';
import ParticleField from '../layout/ParticleField';
import useTitle from '../../hooks/useTitle';
import ReactMarkdown from 'react-markdown';

const SmartAdvisorPage = () => {
    useTitle('Akıllı Danışman');
    const [activeTab, setActiveTab] = useState('advisor');

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Merhaba! Ben OTORITE AI. Araç arayışında sana nasıl yardımcı olabilirim? Bütçeni, ihtiyaçlarını veya hayalindeki arabayı anlatabilirsin.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Vision State
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [snapLoading, setSnapLoading] = useState(false);
    const [snapResult, setSnapResult] = useState(null); // { brand, model, confidence... }
    const [rateResult, setRateResult] = useState(null); // { scores... }
    const [visionError, setVisionError] = useState('');

    const navigate = useNavigate();
    const chatContainerRef = useRef(null);

    // Enhanced Markdown Formatter Component using ReactMarkdown
    const MarkdownText = ({ text }) => {
        if (!text) return null;

        return (
            <div className="prose prose-invert prose-amber prose-sm md:prose-base max-w-none text-slate-200 leading-relaxed">
                <ReactMarkdown
                    components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-2 text-slate-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-2 text-slate-300">{children}</ol>,
                        li: ({ children }) => <li className="marker:text-amber-500">{children}</li>,
                        strong: ({ children }) => <strong className="text-amber-400 font-bold">{children}</strong>,
                        h1: ({ children }) => <h1 className="text-xl font-black text-white mt-6 mb-3 border-b border-slate-700 pb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold text-amber-500 mt-5 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold text-slate-100 mt-4 mb-1">{children}</h3>,
                    }}
                >
                    {text}
                </ReactMarkdown>
            </div>
        );
    };

    // Scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Force scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const suggestionChips = [
        { label: "Günlük işe gidiş-geliş için ekonomik araç", icon: <Zap className="w-4 h-4" /> },
        { label: "Haftasonu gezileri için geniş bagajlı SUV", icon: <Sparkles className="w-4 h-4" /> },
        { label: "İlk arabam olacak, bütçem kısıtlı ne önerirsin?", icon: <Bot className="w-4 h-4" /> },
        { label: "7 kişilik aile araçları nelerdir?", icon: <Bot className="w-4 h-4" /> },
        { label: "Elektrikli araç almayı düşünüyorum, önerilerin neler?", icon: <Zap className="w-4 h-4" /> },
        { label: "Yeni evliler için pratik ve ekonomik araç", icon: <Sparkles className="w-4 h-4" /> },
        { label: "Uzun yol ve şehir içi ikisine de uygun araç", icon: <Bot className="w-4 h-4" /> },
        { label: "500.000 TL bütçeyle ne alabilirim?", icon: <Bot className="w-4 h-4" /> },
        { label: "Şehir içi park sorunu yaşamayan küçük araç", icon: <Zap className="w-4 h-4" /> },
        { label: "Kışın kar yollarına çıkabilecek 4x4 araç lazım", icon: <Sparkles className="w-4 h-4" /> },
        { label: "Yakıt tasarruflu hibrit araç önerir misin?", icon: <Zap className="w-4 h-4" /> },
        { label: "Yeni sürücüler için güvenli ve kolay araç", icon: <Sparkles className="w-4 h-4" /> },
        { label: "Emekliler için konforlu ve güvenilir araç", icon: <Bot className="w-4 h-4" /> },
        { label: "İş için sürekli yolda olacağım, hangi aracı alayım?", icon: <Sparkles className="w-4 h-4" /> },
        { label: "Aylık 5000 TL taksitle hangi araç alınır?", icon: <Zap className="w-4 h-4" /> },
        { label: "Ticari kullanım için panel van önerileri", icon: <Bot className="w-4 h-4" /> },
        { label: "Hem şehirde hem arazide kullanabileceğim araç", icon: <Sparkles className="w-4 h-4" /> },
        { label: "2 çocuklu aile için en uygun araç hangisi?", icon: <Bot className="w-4 h-4" /> },
        { label: "Bakım maliyeti düşük araç arıyorum", icon: <Zap className="w-4 h-4" /> },
        { label: "Üniversite öğrencisi için bütçe dostu araç", icon: <Sparkles className="w-4 h-4" /> }
    ];

    // Pick 4 random chips on each load
    const [randomChips, setRandomChips] = useState([]);
    useEffect(() => {
        const shuffled = [...suggestionChips].sort(() => 0.5 - Math.random());
        setRandomChips(shuffled.slice(0, 4));
    }, []);

    // === CHAT HANDLERS ===
    const handleChatSubmit = async (e, forcedInput) => {
        if (e) e.preventDefault();

        const userMessage = forcedInput || chatInput.trim();
        if (!userMessage || chatLoading) return;

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput('');
        setChatLoading(true);

        try {
            const data = await aiAPI.chat(userMessage);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.response,
                recommendations: data.recommendations // Added support for cards
            }]);
        } catch (err) {
            console.error("AI Chat Error:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Bağlantı hatası";
            setMessages(prev => [...prev, { role: 'ai', content: `HATA: ${errorMessage}. Lütfen konsolu kontrol et.` }]);
        } finally {
            setChatLoading(false);
        }
    };

    // === VISION HANDLERS ===
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSnapResult(null);
            setRateResult(null);
            setVisionError('');
        }
    };

    const handleSnapProcess = async () => {
        if (!selectedImage) return;
        setSnapLoading(true);
        setVisionError('');
        setSnapResult(null);
        setRateResult(null);

        try {
            // 1. Identify
            const identityData = await aiAPI.snap(selectedImage);
            setSnapResult(identityData);

            // 2. Auto-Rate if confidence is high
            if (identityData.confidence >= 75 && identityData.brand !== "Unknown") {
                const rateData = await aiAPI.snapRate({
                    brand: identityData.brand,
                    model: identityData.model,
                    generation: identityData.generation
                });
                setRateResult(rateData);
            } else if (identityData.brand === "Unknown") {
                setVisionError("Bu görselde bir araç tespit edemedim. Lütfen daha net bir fotoğraf yükle.");
            }

        } catch (err) {
            setVisionError("İşlem sırasında bir hata oluştu. Lütfen tekrar dene.");
        } finally {
            setSnapLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 relative overflow-hidden">
            <ParticleField />
            <BackgroundShapes />

            <div className="container mx-auto max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-in-up">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 mb-4 animate-ai-pulse">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-2">
                        <span className="animate-gradient-text uppercase tracking-tight">
                            OTORİTE AI
                        </span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Google Gemini destekli profesyonel otomobil danışmanınız.
                    </p>
                </div>

                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/20 animate-in-up delay-200 min-h-[600px] flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                        <div className="border-b border-slate-800">
                            <TabsList className="flex w-full bg-slate-900/50 p-1">
                                <TabsTrigger value="advisor" className="flex-1 py-4 data-[state=active]:bg-slate-800 text-slate-400">
                                    <Bot className="w-5 h-5 mr-2" />
                                    AI Danışman
                                </TabsTrigger>
                                <TabsTrigger value="vision" className="flex-1 py-4 data-[state=active]:bg-slate-800 text-slate-400">
                                    <Camera className="w-5 h-5 mr-2" />
                                    Snap & Rate
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* === CHAT TAB === */}
                        <TabsContent value="advisor" className="flex-1 flex flex-col mt-0 h-[600px] overflow-hidden">
                            {/* Messages Area */}
                            <div
                                ref={chatContainerRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/30 scroll-smooth no-scrollbar"
                                style={{ maxHeight: 'calc(600px - 140px)' }}
                            >
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in-up`}>
                                        <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-green-600/20 border border-green-500/30'}`}>
                                                {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-green-400" />}
                                            </div>
                                            <div className="flex flex-col gap-3 max-w-full overflow-hidden">
                                                <div className={`p-5 rounded-2xl text-[16px] leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/50 backdrop-blur-sm'}`}>
                                                    {msg.role === 'ai' ? <MarkdownText text={msg.content} /> : msg.content}
                                                </div>

                                                {/* Recommendations Cards */}
                                                {msg.recommendations && msg.recommendations.length > 0 && (
                                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-mini">
                                                        {msg.recommendations.map((rec, rIdx) => (
                                                            <div
                                                                key={rIdx}
                                                                className="min-w-[240px] bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer group"
                                                                onClick={() => navigate(`/vehicles/${rec.slug}`)}
                                                            >
                                                                <div className="h-24 bg-slate-900 overflow-hidden">
                                                                    <img src={rec.image} alt={rec.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                </div>
                                                                <div className="p-3">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">{rec.brand}</span>
                                                                        <span className="text-[10px] text-slate-500">{rec.year}</span>
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-200 text-sm mb-2">{rec.model}</h4>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-bold text-amber-500">{(Number(rec.overallScore) || 8.0).toFixed(1)} Puan</span>
                                                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-3 max-w-[85%]">
                                            <div className="w-10 h-10 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
                                                <Bot className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {messagesEndRef.current && (
                                    <div className="h-4 w-full" />
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area + Pills */}
                            <div className="p-4 bg-slate-900/90 border-t border-slate-700/50 backdrop-blur-md">
                                {/* Pills moved here, above the input */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar scroll-smooth">
                                    {randomChips.map((chip, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleChatSubmit(null, chip.label)}
                                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] font-bold shadow-lg shadow-red-500/20 hover:scale-105 hover:from-red-500 hover:to-orange-500 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                                        >
                                            {chip.icon}
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleChatSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Bir araç hakkında soru sor..."
                                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || chatLoading}
                                        className="absolute right-2 top-2 p-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 rounded-full hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <Send className="w-5 h-5 font-bold" />
                                    </button>
                                </form>
                            </div>
                        </TabsContent>

                        {/* === SNAP TAB === */}
                        <TabsContent value="vision" className="mt-0 p-6 md:p-8 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start h-full">
                                {/* Left: Upload Area */}
                                <div className="space-y-6">
                                    <div className="relative group w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-700 bg-slate-800/30 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-indigo-500/50 hover:bg-slate-800/50">
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => {
                                                        setSelectedImage(null);
                                                        setPreviewUrl('');
                                                        setSnapResult(null);
                                                        setRateResult(null);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors animate-float-y">
                                                        <Camera className="w-10 h-10" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-xl">Aracın Fotoğrafını Yükle</p>
                                                        <p className="text-sm opacity-60">AI modelini ve yılını tahmin etsin</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {snapLoading && (
                                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                                <p className="text-white font-medium animate-pulse">Fotoğraf Analiz Ediliyor...</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleSnapProcess}
                                        disabled={!selectedImage || snapLoading || snapResult}
                                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-6 text-lg rounded-2xl shadow-lg shadow-amber-500/20 transition-all font-bold"
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        Snap & Rate Başlat
                                    </Button>

                                    {visionError && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                                            <AlertCircle className="w-5 h-5" />
                                            {visionError}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Results Area */}
                                <div className="space-y-6">
                                    {/* 1. Identification Result */}
                                    {snapResult && (
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 animate-in-up">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Araç Kimliği</h3>
                                                    <h2 className="text-3xl font-black text-white">{snapResult.brand} {snapResult.model}</h2>
                                                    {snapResult.generation && <p className="text-amber-500 font-medium">{snapResult.generation}</p>}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${snapResult.confidence > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    %{snapResult.confidence} Emin
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-slate-700 rounded-lg text-sm text-slate-300">{snapResult.bodyType}</span>
                                                </div>
                                                {rateResult?.matchedVehicleId && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-500 text-[10px] font-black rounded-full shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        SİTEDE İNCELEMESİ VAR
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Rating Scores */}
                                    {rateResult && (
                                        <div className="space-y-4 animate-in-up delay-100">
                                            <div className="grid grid-cols-2 gap-4">
                                                <ScoreCard label="Güvenilirlik" score={rateResult.reliability} />
                                                <ScoreCard label="Performans" score={rateResult.performance} />
                                                <ScoreCard label="Bakım Maliyeti" score={rateResult.maintenance} />
                                                <ScoreCard label="Yakıt" score={rateResult.fuelEconomy} />
                                            </div>

                                            <div className="p-5 rounded-2xl bg-amber-600/10 border border-amber-500/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-amber-500/80">
                                                        {rateResult.source === 'database' ? 'RESMİ OTORİTE PUANI' : 'TAHMİNİ YZ SKORU'}
                                                    </h3>
                                                    <span className={`text-3xl font-black ${rateResult.source === 'database' ? 'text-amber-400' : 'text-orange-500'}`}>
                                                        {(Number(rateResult.overallScore) || 0).toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${rateResult.source === 'database' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-amber-600 to-orange-600'}`}
                                                        style={{ width: `${(Number(rateResult.overallScore) || 0) * 10}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className={`p-5 rounded-2xl border ${rateResult.source === 'database' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                                                <p className={`${rateResult.source === 'database' ? 'text-amber-200/80 font-medium' : 'text-slate-300 italic'}`}>
                                                    {rateResult.source === 'database' && <Sparkles className="w-4 h-4 inline mr-2 text-amber-400" />}
                                                    {rateResult.explanation}
                                                </p>
                                            </div>

                                            <Button
                                                className={`w-full font-bold py-7 rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 ${rateResult.matchedVehicleId
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                                                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20'
                                                    }`}
                                                onClick={() => {
                                                    const targetId = rateResult.matchedVehicleSlug || rateResult.matchedVehicleId;
                                                    if (targetId) {
                                                        navigate(`/vehicles/${targetId}`);
                                                    } else {
                                                        navigate(`/vehicles`);
                                                    }
                                                }}
                                            >
                                                {rateResult.matchedVehicleId ? "Editör İncelemesine Git" : "Tüm İncelemelere Göz At"}
                                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Scores
const ScoreCard = ({ label, score }) => (
    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-black text-amber-500 mb-1">
            {(typeof score === 'number' ? score : 0).toFixed(1)}
        </div>
        <div className="text-xs text-slate-400">{label}</div>
    </div>
);

export default SmartAdvisorPage;
