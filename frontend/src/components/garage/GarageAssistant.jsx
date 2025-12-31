import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Car, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, garageAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

const GarageAssistant = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'system',
            content: 'Merhaba! Ben Garaj Asistanın. Garajındaki araçlar hakkında bakım, teknik bilgi veya genel öneriler için bana danışabilirsin.'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [garageContext, setGarageContext] = useState([]);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch user garage for context
    useEffect(() => {
        const fetchGarage = async () => {
            if (user) {
                try {
                    const data = await garageAPI.getMyGarage();
                    setGarageContext(data.vehicles || []);
                } catch (error) {
                    console.error("Context fetch failed", error);
                }
            }
        };
        if (isOpen && user) {
            fetchGarage();
        }
    }, [isOpen, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Include garage context only if user is logged in and has vehicles
            const context = garageContext.length > 0 ? garageContext : null;

            const response = await aiAPI.chat(userMsg, context);

            setMessages(prev => [...prev, {
                role: 'model',
                content: response.response,
                recommendations: response.recommendations
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: 'Üzgünüm, şu an bağlantıda bir sorun yaşıyorum. Lütfen biraz sonra tekrar dene.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null; // Only show for logged in users? Or maybe show login prompt? Let's hide for now.

    return (
        <div className="fixed bottom-6 right-6 z-50 flexflex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div
                className={`
                    pointer-events-auto
                    absolute bottom-16 right-0 w-[380px] h-[550px] 
                    bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/50 
                    flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center relative">
                            <Bot className="w-6 h-6 text-amber-500" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                Garaj Asistanı
                                <Sparkles className="w-3 h-3 text-amber-500" />
                            </h3>
                            <p className="text-xs text-slate-400">
                                {garageContext.length > 0 ? `${garageContext.length} araç tanındı` : 'Genel Danışman'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-amber-500" />
                                </div>
                            )}

                            <div
                                className={`
                                    max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'bg-amber-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }
                                `}
                            >
                                <div className="whitespace-pre-wrap">{typeof msg.content === 'string' ? msg.content : (typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content)}</div>

                                {/* Recommendations Cards (if any) */}
                                {msg.recommendations && msg.recommendations.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {msg.recommendations.map((rec, rIdx) => (
                                            <a
                                                key={rIdx}
                                                href={`/garage/vehicle/${rec.slug}`}
                                                className="block p-2 rounded-lg bg-black/20 hover:bg-black/40 border border-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {rec.image && (
                                                        <img src={rec.image} alt={rec.model} className="w-10 h-10 rounded object-cover" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-amber-500 truncate group-hover:underline">
                                                            {rec.brand} {rec.model}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            Puan: {rec.overallScore}/10
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="bg-slate-800 rounded-2xl p-4 rounded-tl-none border border-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-700/50">
                    <div className="relative flex items-center gap-2">
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Bir soru sor..."
                            disabled={loading}
                            className="bg-slate-800 border-slate-700 text-white pr-12 h-12 rounded-xl focus:ring-amber-500/50"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || loading}
                            size="icon"
                            className="absolute right-1 top-1 h-10 w-10 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Float Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    relative w-14 h-14 rounded-full shadow-2xl shadow-amber-500/20
                    flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
                    ${isOpen ? 'bg-slate-800 rotate-90 text-slate-400' : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'}
                `}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}

                {/* Notification Dot (if closed, animate) */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default GarageAssistant;
