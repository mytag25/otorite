
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";


import { Plus, Edit, Trash2, Save, X, Search, Filter, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useTitle from "../../hooks/useTitle";

const AdminNewsPage = () => {
    const { user } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    useTitle('Haber Yönetimi');
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        summary: "",
        content: "",
        image: "",
        tags: "",
        isPublished: true
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await api.get('/news?limit=100');
            setNews(response.data.news);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching news:", error);
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            image: item.image,
            tags: item.tags.join(", "),
            isPublished: item.isPublished
        });
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleCreate = () => {
        setFormData({
            id: "",
            title: "",
            summary: "",
            content: "",
            image: "",
            tags: "",
            isPublished: true
        });
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu haberi silmek istediğinize emin misiniz?")) {
            try {
                await api.delete(`/news/${id}`);
                fetchNews();
            } catch (error) {
                alert("Silme işlemi başarısız: " + error.response?.data?.detail || error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                title: formData.title,
                summary: formData.summary,
                content: formData.content,
                image: formData.image,
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
                isPublished: formData.isPublished
            };

            if (formData.id) {
                // Update
                await api.put(`/news/${formData.id}`, payload);
            } else {
                // Create
                await api.post('/news', payload);
            }

            setIsEditing(false);
            fetchNews();
            alert("İşlem başarılı!");
        } catch (error) {
            console.error("Save error:", error);
            alert("Kaydetme başarısız: " + (error.response?.data?.detail || error.message));
        }
    };

    if (loading) return <div className="text-white text-center py-20">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                        Haber Yönetimi
                    </h1>
                    {!isEditing && (
                        <button
                            onClick={handleCreate}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-orange-900/20"
                        >
                            <Plus size={20} /> Yeni Haber Ekle
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-[fadeInUp_0.4s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            {formData.id ? <Edit className="text-blue-500" /> : <Plus className="text-green-500" />}
                            {formData.id ? "Haberi Düzenle" : "Yeni Haber Oluştur"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 mb-2">Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-2">Görsel URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                        {formData.image && (
                                            <div className="w-12 h-12 rounded overflow-hidden border border-slate-700 sticky top-0">
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-2">Özet (Listeleme sayfasında görünür)</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 h-24"
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 mb-2">İçerik (HTML destekler)</label>
                                <p className="text-xs text-slate-500 mb-2">Paragraflar için &lt;p&gt;, başlıklar için &lt;h2&gt; kullanabilirsiniz.</p>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 h-96 font-mono text-sm"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-400 mb-2">Etiketler (Virgülle ayırın)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="Teknoloji, İnceleme, BMW"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-orange-600 focus:ring-orange-500"
                                            checked={formData.isPublished}
                                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        />
                                        <span className="text-white">Yayında</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    <X size={20} /> İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-orange-900/40"
                                >
                                    <Save size={20} /> Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Görsel</th>
                                        <th className="px-6 py-4 text-left font-semibold">Başlık</th>
                                        <th className="px-6 py-4 text-left font-semibold">Durum</th>
                                        <th className="px-6 py-4 text-left font-semibold">Tarih</th>
                                        <th className="px-6 py-4 text-right font-semibold">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {news.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-10 rounded-md overflow-hidden bg-slate-800">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                                            <td className="px-6 py-4">
                                                {item.isPublished ? (
                                                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20">Yayında</span>
                                                ) : (
                                                    <span className="bg-slate-500/10 text-slate-500 px-2 py-1 rounded text-xs font-bold border border-slate-500/20">Taslak</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {news.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                Henüz haber eklenmemiş. "Yeni Haber Ekle" butonu ile başlayın.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminNewsPage;
