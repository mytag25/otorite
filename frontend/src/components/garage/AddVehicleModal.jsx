import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image, Car, Calendar, Palette, FileText, Wrench, Globe, Lock, Fuel, Layout, DollarSign, Star, HelpCircle, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { staticAPI, garageAPI } from '../../services/api';

const AddVehicleModal = ({ isOpen, onClose, onSuccess, editVehicle = null }) => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        image: '',
        images: [],
        description: '',
        modifications: [],
        isPublic: true,
        fuelType: '',
        bodyType: '',
        ownershipDate: '',
        purchaseReason: '',
        averageMonthlyExpense: 0,
        ownerRating: 0,
        maintenanceHistory: [],
        isForSale: false,
    });

    const [newModification, setNewModification] = useState('');
    const [newMaintenanceItem, setNewMaintenanceItem] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    // Load brands on mount
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await staticAPI.getBrands();
                setBrands(data);
            } catch (err) {
                console.error('Failed to load brands:', err);
            }
        };
        loadBrands();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (editVehicle) {
            setFormData({
                brand: editVehicle.brand || '',
                model: editVehicle.model || '',
                year: editVehicle.year || new Date().getFullYear(),
                color: editVehicle.color || '',
                image: editVehicle.image || '',
                images: editVehicle.images || [],
                description: editVehicle.description || '',
                modifications: editVehicle.modifications || [],
                isPublic: editVehicle.isPublic ?? true,
                fuelType: editVehicle.fuelType || '',
                bodyType: editVehicle.bodyType || '',
                ownershipDate: editVehicle.ownershipDate ? new Date(editVehicle.ownershipDate).toISOString().split('T')[0] : '',
                purchaseReason: editVehicle.purchaseReason || '',
                averageMonthlyExpense: editVehicle.averageMonthlyExpense || 0,
                ownerRating: editVehicle.ownerRating || 0,
                maintenanceHistory: editVehicle.maintenanceHistory || [],
                isForSale: editVehicle.isForSale || false,
            });
        } else {
            // Reset form for new vehicle
            setFormData({
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                color: '',
                image: '',
                images: [],
                description: '',
                modifications: [],
                isPublic: true,
                fuelType: '',
                bodyType: '',
                ownershipDate: '',
                purchaseReason: '',
                averageMonthlyExpense: 0,
                ownerRating: 0,
                maintenanceHistory: [],
                isForSale: false,
            });
        }
        setError('');
    }, [editVehicle, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const addModification = () => {
        if (newModification.trim()) {
            setFormData(prev => ({
                ...prev,
                modifications: [...prev.modifications, newModification.trim()]
            }));
            setNewModification('');
        }
    };

    const removeModification = (index) => {
        setFormData(prev => ({
            ...prev,
            modifications: prev.modifications.filter((_, i) => i !== index)
        }));
    };

    const addMaintenanceItem = () => {
        if (newMaintenanceItem.trim()) {
            setFormData(prev => ({
                ...prev,
                maintenanceHistory: [...prev.maintenanceHistory, newMaintenanceItem.trim()]
            }));
            setNewMaintenanceItem('');
        }
    };

    const removeMaintenanceItem = (index) => {
        setFormData(prev => ({
            ...prev,
            maintenanceHistory: prev.maintenanceHistory.filter((_, i) => i !== index)
        }));
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            setNewImageUrl('');
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.brand) {
            setError('Lütfen bir marka seçin');
            return;
        }
        if (!formData.model) {
            setError('Lütfen model adını girin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (editVehicle) {
                await garageAPI.updateVehicle(editVehicle.id, formData);
            } else {
                await garageAPI.addVehicle(formData);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === 'object' ? JSON.stringify(detail) : (detail || 'Bir hata oluştu'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Generate year options (1950 to current year)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

    // Color options
    const colors = [
        { value: 'Siyah', label: 'Siyah' },
        { value: 'Beyaz', label: 'Beyaz' },
        { value: 'Gri', label: 'Gri' },
        { value: 'Gümüş', label: 'Gümüş' },
        { value: 'Kırmızı', label: 'Kırmızı' },
        { value: 'Mavi', label: 'Mavi' },
        { value: 'Yeşil', label: 'Yeşil' },
        { value: 'Sarı', label: 'Sarı' },
        { value: 'Turuncu', label: 'Turuncu' },
        { value: 'Mor', label: 'Mor' },
        { value: 'Kahverengi', label: 'Kahverengi' },
        { value: 'Lacivert', label: 'Lacivert' },
        { value: 'Bordo', label: 'Bordo' },
        { value: 'Bej', label: 'Bej' },
        { value: 'Diğer', label: 'Diğer' },
    ];

    const fuelTypes = ['Benzin', 'Dizel', 'LPG', 'Hibrit', 'Elektrik'];
    const bodyTypes = ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Cabrio', 'Station Wagon', 'MPV', 'Pickup', 'Minivan', 'Van'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {editVehicle ? 'Aracı Düzenle' : 'Araç Ekle'}
                            </h2>
                            <p className="text-sm text-slate-400">Garajına yeni bir araç ekle</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-6">
                        {/* Brand & Model Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Brand */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Car className="w-4 h-4 text-amber-500" />
                                    Marka
                                </Label>
                                <Select
                                    value={formData.brand}
                                    onValueChange={(value) => handleChange('brand', value)}
                                >
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue placeholder="Marka seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {brands.map((brand) => (
                                            <SelectItem
                                                key={brand.id}
                                                value={brand.id}
                                                className="text-white hover:bg-slate-700"
                                            >
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Model */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Model</Label>
                                <Input
                                    value={formData.model}
                                    onChange={(e) => handleChange('model', e.target.value)}
                                    placeholder="Örn: M3 Competition"
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* Year & Color Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Year */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    Yıl
                                </Label>
                                <Select
                                    value={formData.year.toString()}
                                    onValueChange={(value) => handleChange('year', parseInt(value))}
                                >
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                                        {years.map((year) => (
                                            <SelectItem
                                                key={year}
                                                value={year.toString()}
                                                className="text-white hover:bg-slate-700"
                                            >
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Color */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-amber-500" />
                                    Renk
                                </Label>
                                <Select
                                    value={formData.color}
                                    onValueChange={(value) => handleChange('color', value)}
                                >
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue placeholder="Renk seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {colors.map((color) => (
                                            <SelectItem
                                                key={color.value}
                                                value={color.value}
                                                className="text-white hover:bg-slate-700"
                                            >
                                                {color.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>


                        {/* Fuel & Body Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Fuel */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Fuel className="w-4 h-4 text-amber-500" />
                                    Yakıt
                                </Label>
                                <Select
                                    value={formData.fuelType}
                                    onValueChange={(value) => handleChange('fuelType', value)}
                                >
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {fuelTypes.map((type) => (
                                            <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Body */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-amber-500" />
                                    Kasa Tipi
                                </Label>
                                <Select
                                    value={formData.bodyType}
                                    onValueChange={(value) => handleChange('bodyType', value)}
                                >
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                        <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {bodyTypes.map((type) => (
                                            <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Main Image */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <Image className="w-4 h-4 text-amber-500" />
                                Ana Görsel URL
                            </Label>
                            <Input
                                value={formData.image}
                                onChange={(e) => handleChange('image', e.target.value)}
                                placeholder="https://example.com/car.png"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            {formData.image && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/50">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-40 object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Additional Images */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Ek Görseller</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="Görsel URL ekle..."
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                                <Button
                                    type="button"
                                    onClick={addImage}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Extra ${index + 1}`}
                                                className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" />
                                Açıklama
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Aracınız hakkında bilgi verin..."
                                rows={3}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                            />
                        </div>

                        {/* Purchase Reason */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-amber-500" />
                                Bu aracı neden aldım?
                            </Label>
                            <Textarea
                                value={formData.purchaseReason}
                                onChange={(e) => handleChange('purchaseReason', e.target.value)}
                                placeholder="Tercih sebebiniz, hikayeniz..."
                                rows={2}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                            />
                        </div>

                        {/* Modifications */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-amber-500" />
                                Modifikasyonlar
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newModification}
                                    onChange={(e) => setNewModification(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModification())}
                                    placeholder="Örn: Stage 2 Tune, Akrapovic Egzoz..."
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                                <Button
                                    type="button"
                                    onClick={addModification}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.modifications.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.modifications.map((mod, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm"
                                        >
                                            {mod}
                                            <button
                                                type="button"
                                                onClick={() => removeModification(index)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Maintenance History */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-amber-500" />
                                Bakım Geçmişi
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newMaintenanceItem}
                                    onChange={(e) => setNewMaintenanceItem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaintenanceItem())}
                                    placeholder="Örn: 90.000 Bakımı, Triger Değişimi..."
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                                <Button
                                    type="button"
                                    onClick={addMaintenanceItem}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.maintenanceHistory.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {formData.maintenanceHistory.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                            <span className="text-slate-300 text-sm">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeMaintenanceItem(index)}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ownership Details Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ownership Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    Sahiplik Başlangıcı
                                </Label>
                                <Input
                                    type="date"
                                    value={formData.ownershipDate}
                                    onChange={(e) => handleChange('ownershipDate', e.target.value)}
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                />
                            </div>

                            {/* Monthly Expense */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-amber-500" />
                                    Aylık Ort. Masraf
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.averageMonthlyExpense}
                                        onChange={(e) => handleChange('averageMonthlyExpense', parseInt(e.target.value) || 0)}
                                        className="bg-slate-800/50 border-slate-700 text-white pl-8"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₺</span>
                                </div>
                            </div>

                            {/* Owner Rating */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Memnuniyet (1-10)
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.ownerRating}
                                    onChange={(e) => handleChange('ownerRating', parseFloat(e.target.value) || 0)}
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                />
                            </div>
                        </div>

                        {/* Privacy & Sale Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="flex items-center gap-3">
                                    {formData.isPublic ? (
                                        <Globe className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    )}
                                    <div>
                                        <p className="text-white font-medium">
                                            {formData.isPublic ? 'Herkese Açık' : 'Gizli'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {formData.isPublic ? 'Keşfet\'te görünür' : 'Sadece sen görürsün'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.isPublic}
                                    onCheckedChange={(checked) => handleChange('isPublic', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="flex items-center gap-3">
                                    <Tag className={`w-5 h-5 ${formData.isForSale ? 'text-amber-500' : 'text-slate-400'}`} />
                                    <div>
                                        <p className="text-white font-medium">Satılık mı?</p>
                                        <p className="text-xs text-slate-400">
                                            {formData.isForSale ? 'Satış niyeti belirtildi' : 'Satılık değil'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.isForSale}
                                    onCheckedChange={(checked) => handleChange('isForSale', checked)}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </form >

                {/* Footer */}
                < div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50" >
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white min-w-[120px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            editVehicle ? 'Kaydet' : 'Ekle'
                        )}
                    </Button>
                </div >
            </div >
        </div >
    );
};

export default AddVehicleModal;
