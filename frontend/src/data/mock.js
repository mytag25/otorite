// Mock data for Vehicle Rating Platform

export const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true }
];

export const segments = [
  { id: 'sedan', name: { tr: 'Sedan', en: 'Sedan', de: 'Limousine', fr: 'Berline', es: 'Sedán', it: 'Berlina', nl: 'Sedan', pt: 'Sedã', pl: 'Sedan', ar: 'سيدان' } },
  { id: 'suv', name: { tr: 'SUV', en: 'SUV', de: 'SUV', fr: 'SUV', es: 'SUV', it: 'SUV', nl: 'SUV', pt: 'SUV', pl: 'SUV', ar: 'SUV' } },
  { id: 'hatchback', name: { tr: 'Hatchback', en: 'Hatchback', de: 'Schrägheck', fr: 'Berline compacte', es: 'Hatchback', it: 'Berlina', nl: 'Hatchback', pt: 'Hatchback', pl: 'Hatchback', ar: 'هاتشباك' } },
  { id: 'coupe', name: { tr: 'Coupe', en: 'Coupe', de: 'Coupé', fr: 'Coupé', es: 'Cupé', it: 'Coupé', nl: 'Coupé', pt: 'Cupê', pl: 'Coupe', ar: 'كوبيه' } },
  { id: 'wagon', name: { tr: 'Station Wagon', en: 'Station Wagon', de: 'Kombi', fr: 'Break', es: 'Familiar', it: 'Station Wagon', nl: 'Stationwagen', pt: 'Perua', pl: 'Kombi', ar: 'ستيشن واجن' } },
  { id: 'convertible', name: { tr: 'Cabrio', en: 'Convertible', de: 'Cabrio', fr: 'Cabriolet', es: 'Descapotable', it: 'Cabriolet', nl: 'Cabrio', pt: 'Conversível', pl: 'Kabriolet', ar: 'مكشوفة' } },
  { id: 'sports', name: { tr: 'Spor', en: 'Sports', de: 'Sportwagen', fr: 'Sportive', es: 'Deportivo', it: 'Sportiva', nl: 'Sport', pt: 'Esportivo', pl: 'Sportowy', ar: 'رياضية' } },
  { id: 'electric', name: { tr: 'Elektrikli', en: 'Electric', de: 'Elektro', fr: 'Électrique', es: 'Eléctrico', it: 'Elettrica', nl: 'Elektrisch', pt: 'Elétrico', pl: 'Elektryczny', ar: 'كهربائي' } },
  { id: 'pickup', name: { tr: 'Pickup', en: 'Pickup', de: 'Pickup', fr: 'Pick-up', es: 'Pickup', it: 'Pickup', nl: 'Pickup', pt: 'Picape', pl: 'Pickup', ar: 'بيك أب' } },
  { id: 'mpv', name: { tr: 'MPV', en: 'MPV', de: 'Van', fr: 'Monospace', es: 'Monovolumen', it: 'Monovolume', nl: 'MPV', pt: 'MPV', pl: 'Van', ar: 'MPV' } }
];

export const scoringDimensions = [
  { id: 'reliability', name: { tr: 'Güvenilirlik', en: 'Reliability', de: 'Zuverlässigkeit', fr: 'Fiabilité', es: 'Fiabilidad', it: 'Affidabilità', nl: 'Betrouwbaarheid', pt: 'Confiabilidade', pl: 'Niezawodność', ar: 'الموثوقية' }, icon: 'Shield' },
  { id: 'buildQuality', name: { tr: 'Yapı Kalitesi', en: 'Build Quality', de: 'Verarbeitungsqualität', fr: 'Qualité de Construction', es: 'Calidad de Construcción', it: 'Qualità Costruttiva', nl: 'Bouwkwaliteit', pt: 'Qualidade de Construção', pl: 'Jakość Wykonania', ar: 'جودة البناء' }, icon: 'Wrench' },
  { id: 'performance', name: { tr: 'Performans', en: 'Performance', de: 'Leistung', fr: 'Performance', es: 'Rendimiento', it: 'Prestazioni', nl: 'Prestaties', pt: 'Desempenho', pl: 'Osiągi', ar: 'الأداء' }, icon: 'Gauge' },
  { id: 'drivingExperience', name: { tr: 'Sürüş Deneyimi', en: 'Driving Experience', de: 'Fahrerlebnis', fr: 'Expérience de Conduite', es: 'Experiencia de Conducción', it: 'Esperienza di Guida', nl: 'Rijervaring', pt: 'Experiência de Condução', pl: 'Doświadczenie Jazdy', ar: 'تجربة القيادة' }, icon: 'Disc' },
  { id: 'technology', name: { tr: 'Teknoloji', en: 'Technology & Infotainment', de: 'Technologie', fr: 'Technologie', es: 'Tecnología', it: 'Tecnologia', nl: 'Technologie', pt: 'Tecnologia', pl: 'Technologia', ar: 'التكنولوجيا' }, icon: 'Cpu' },
  { id: 'safety', name: { tr: 'Güvenlik', en: 'Safety', de: 'Sicherheit', fr: 'Sécurité', es: 'Seguridad', it: 'Sicurezza', nl: 'Veiligheid', pt: 'Segurança', pl: 'Bezpieczeństwo', ar: 'السلامة' }, icon: 'ShieldCheck' },
  { id: 'costOfOwnership', name: { tr: 'Sahip Olma Maliyeti', en: 'Cost of Ownership', de: 'Betriebskosten', fr: 'Coût de Possession', es: 'Costo de Propiedad', it: 'Costo di Gestione', nl: 'Eigendomskosten', pt: 'Custo de Propriedade', pl: 'Koszt Posiadania', ar: 'تكلفة الملكية' }, icon: 'Wallet' },
  { id: 'design', name: { tr: 'Tasarım', en: 'Design', de: 'Design', fr: 'Design', es: 'Diseño', it: 'Design', nl: 'Design', pt: 'Design', pl: 'Design', ar: 'التصميم' }, icon: 'Palette' },
  { id: 'valueForMoney', name: { tr: 'Fiyat/Performans', en: 'Value for Money', de: 'Preis-Leistung', fr: 'Rapport Qualité-Prix', es: 'Relación Calidad-Precio', it: 'Rapporto Qualità-Prezzo', nl: 'Prijs-Kwaliteit', pt: 'Custo-Benefício', pl: 'Stosunek Jakości do Ceny', ar: 'القيمة مقابل المال' }, icon: 'TrendingUp' },
  { id: 'overall', name: { tr: 'Genel Puan', en: 'Overall Score', de: 'Gesamtwertung', fr: 'Note Globale', es: 'Puntuación General', it: 'Punteggio Complessivo', nl: 'Totaalscore', pt: 'Pontuação Geral', pl: 'Ocena Ogólna', ar: 'التقييم العام' }, icon: 'Star' }
];

export const brands = [
  { id: 'audi', name: 'Audi', country: 'Germany', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { id: 'bmw', name: 'BMW', country: 'Germany', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { id: 'mercedes', name: 'Mercedes-Benz', country: 'Germany', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { id: 'volkswagen', name: 'Volkswagen', country: 'Germany', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
  { id: 'porsche', name: 'Porsche', country: 'Germany', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { id: 'toyota', name: 'Toyota', country: 'Japan', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
  { id: 'honda', name: 'Honda', country: 'Japan', logo: 'https://www.carlogos.org/car-logos/honda-logo.png' },
  { id: 'mazda', name: 'Mazda', country: 'Japan', logo: 'https://www.carlogos.org/car-logos/mazda-logo.png' },
  { id: 'nissan', name: 'Nissan', country: 'Japan', logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
  { id: 'lexus', name: 'Lexus', country: 'Japan', logo: 'https://www.carlogos.org/car-logos/lexus-logo.png' },
  { id: 'ford', name: 'Ford', country: 'USA', logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
  { id: 'chevrolet', name: 'Chevrolet', country: 'USA', logo: 'https://www.carlogos.org/car-logos/chevrolet-logo.png' },
  { id: 'tesla', name: 'Tesla', country: 'USA', logo: 'https://www.carlogos.org/car-logos/tesla-logo.png' },
  { id: 'volvo', name: 'Volvo', country: 'Sweden', logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
  { id: 'peugeot', name: 'Peugeot', country: 'France', logo: 'https://www.carlogos.org/car-logos/peugeot-logo.png' },
  { id: 'renault', name: 'Renault', country: 'France', logo: 'https://www.carlogos.org/car-logos/renault-logo.png' },
  { id: 'fiat', name: 'Fiat', country: 'Italy', logo: 'https://www.carlogos.org/car-logos/fiat-logo.png' },
  { id: 'alfaromeo', name: 'Alfa Romeo', country: 'Italy', logo: 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png' },
  { id: 'hyundai', name: 'Hyundai', country: 'South Korea', logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
  { id: 'kia', name: 'Kia', country: 'South Korea', logo: 'https://www.carlogos.org/car-logos/kia-logo.png' }
];

export const mockVehicles = [
  {
    id: '1',
    brand: 'bmw',
    model: '3 Series',
    year: 2024,
    segment: 'sedan',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    scores: {
      reliability: { score: 7.5, justification: { tr: 'Olgun platform, ancak bazı elektronik sorunlar bildirilmiş', en: 'Mature platform with some reported electronic issues' } },
      buildQuality: { score: 8.5, justification: { tr: 'Premium malzemeler ve hassas montaj', en: 'Premium materials and precise assembly' } },
      performance: { score: 8.8, justification: { tr: 'Güçlü motor seçenekleri ve keskin tepkiler', en: 'Powerful engine options with sharp responses' } },
      drivingExperience: { score: 9.0, justification: { tr: 'Segment lideri direksiyon hissi ve dinamikler', en: 'Segment-leading steering feel and dynamics' } },
      technology: { score: 8.5, justification: { tr: 'iDrive 8 sistemi sezgisel ve kapsamlı', en: 'iDrive 8 system is intuitive and comprehensive' } },
      safety: { score: 8.7, justification: { tr: 'Euro NCAP 5 yıldız, gelişmiş ADAS', en: 'Euro NCAP 5 stars with advanced ADAS' } },
      costOfOwnership: { score: 6.5, justification: { tr: 'Premium segment bakım maliyetleri', en: 'Premium segment maintenance costs' } },
      design: { score: 8.5, justification: { tr: 'Sportif oranlar, modern iç mekan', en: 'Sporty proportions with modern interior' } },
      valueForMoney: { score: 7.0, justification: { tr: 'Yüksek fiyat ancak güçlü donanım', en: 'High price but strong equipment' } },
      overall: { score: 8.1, justification: { tr: 'Segmentinin en dinamik seçeneği', en: 'Most dynamic choice in its segment' } }
    },
    specs: { engine: '2.0L Turbo', power: '258 hp', torque: '400 Nm', acceleration: '5.8s', topSpeed: '250 km/h' },
    strengths: { tr: ['Üstün sürüş dinamikleri', 'Premium iç mekan', 'Güçlü motor'], en: ['Superior driving dynamics', 'Premium interior', 'Powerful engine'] },
    weaknesses: { tr: ['Yüksek bakım maliyeti', 'Sert süspansiyon'], en: ['High maintenance cost', 'Firm suspension'] },
    bestFor: { tr: 'Sürüş keyfi arayanlar', en: 'Those seeking driving pleasure' }
  },
  {
    id: '2',
    brand: 'mercedes',
    model: 'C-Class',
    year: 2024,
    segment: 'sedan',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    scores: {
      reliability: { score: 7.0, justification: { tr: 'Yeni platform, uzun vadeli veriler sınırlı', en: 'New platform with limited long-term data' } },
      buildQuality: { score: 9.0, justification: { tr: 'S-Class kalitesinde malzemeler', en: 'S-Class quality materials' } },
      performance: { score: 8.0, justification: { tr: 'Yeterli güç, hafif hibrit desteği', en: 'Adequate power with mild hybrid support' } },
      drivingExperience: { score: 8.0, justification: { tr: 'Konfor odaklı ancak yetkin', en: 'Comfort-focused but capable' } },
      technology: { score: 9.2, justification: { tr: 'MBUX sistemi segment lideri', en: 'MBUX system is segment-leading' } },
      safety: { score: 8.8, justification: { tr: 'Kapsamlı güvenlik paketleri', en: 'Comprehensive safety packages' } },
      costOfOwnership: { score: 6.0, justification: { tr: 'Yüksek servis maliyetleri', en: 'High service costs' } },
      design: { score: 9.0, justification: { tr: 'Zarif ve modern tasarım', en: 'Elegant and modern design' } },
      valueForMoney: { score: 6.8, justification: { tr: 'Premium fiyatlandırma', en: 'Premium pricing' } },
      overall: { score: 8.0, justification: { tr: 'Lüks ve teknoloji odaklı seçenek', en: 'Luxury and technology focused choice' } }
    },
    specs: { engine: '1.5L Turbo + Mild Hybrid', power: '204 hp', torque: '300 Nm', acceleration: '7.3s', topSpeed: '246 km/h' },
    strengths: { tr: ['Üstün iç mekan kalitesi', 'İleri teknoloji', 'Zarif tasarım'], en: ['Superior interior quality', 'Advanced technology', 'Elegant design'] },
    weaknesses: { tr: ['Yüksek fiyat', 'Düşük taban motor gücü'], en: ['High price', 'Low base engine power'] },
    bestFor: { tr: 'Lüks ve prestij arayanlar', en: 'Those seeking luxury and prestige' }
  },
  {
    id: '3',
    brand: 'toyota',
    model: 'Camry',
    year: 2024,
    segment: 'sedan',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    scores: {
      reliability: { score: 9.5, justification: { tr: 'Kanıtlanmış güvenilirlik geçmişi', en: 'Proven reliability track record' } },
      buildQuality: { score: 7.5, justification: { tr: 'Sağlam ancak premium hissi yok', en: 'Solid but lacks premium feel' } },
      performance: { score: 7.0, justification: { tr: 'Yeterli performans, hibrit verimli', en: 'Adequate performance, efficient hybrid' } },
      drivingExperience: { score: 7.0, justification: { tr: 'Konforlu ve sessiz', en: 'Comfortable and quiet' } },
      technology: { score: 7.5, justification: { tr: 'Temel özellikler yeterli', en: 'Basic features are adequate' } },
      safety: { score: 8.5, justification: { tr: 'Toyota Safety Sense standart', en: 'Toyota Safety Sense standard' } },
      costOfOwnership: { score: 9.0, justification: { tr: 'Düşük bakım, yüksek değer koruma', en: 'Low maintenance, high value retention' } },
      design: { score: 7.0, justification: { tr: 'Fonksiyonel tasarım', en: 'Functional design' } },
      valueForMoney: { score: 8.5, justification: { tr: 'Güçlü değer önerisi', en: 'Strong value proposition' } },
      overall: { score: 8.0, justification: { tr: 'En güvenilir seçenek', en: 'Most reliable choice' } }
    },
    specs: { engine: '2.5L Hybrid', power: '218 hp', torque: '221 Nm', acceleration: '8.1s', topSpeed: '180 km/h' },
    strengths: { tr: ['Efsanevi güvenilirlik', 'Düşük işletme maliyeti', 'Yüksek ikinci el değeri'], en: ['Legendary reliability', 'Low running costs', 'High resale value'] },
    weaknesses: { tr: ['Sıradan iç mekan', 'Düşük sürüş heyecanı'], en: ['Ordinary interior', 'Low driving excitement'] },
    bestFor: { tr: 'Güvenilirlik arayanlar', en: 'Those seeking reliability' }
  },
  {
    id: '4',
    brand: 'tesla',
    model: 'Model 3',
    year: 2024,
    segment: 'electric',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    scores: {
      reliability: { score: 6.5, justification: { tr: 'Panel uyumu sorunları, yazılım güvenilir', en: 'Panel gap issues, software reliable' } },
      buildQuality: { score: 6.5, justification: { tr: 'Değişken kalite kontrolü', en: 'Variable quality control' } },
      performance: { score: 9.0, justification: { tr: 'Anlık tork, hızlı hızlanma', en: 'Instant torque, rapid acceleration' } },
      drivingExperience: { score: 8.0, justification: { tr: 'Sessiz ve çevik', en: 'Quiet and agile' } },
      technology: { score: 9.5, justification: { tr: 'Segment lideri yazılım ve OTA', en: 'Segment-leading software and OTA' } },
      safety: { score: 8.5, justification: { tr: 'Güçlü çarpışma testi sonuçları', en: 'Strong crash test results' } },
      costOfOwnership: { score: 8.0, justification: { tr: 'Düşük enerji maliyeti, yüksek sigorta', en: 'Low energy cost, high insurance' } },
      design: { score: 7.5, justification: { tr: 'Minimalist ancak tartışmalı', en: 'Minimalist but divisive' } },
      valueForMoney: { score: 7.5, justification: { tr: 'Segment için rekabetçi fiyat', en: 'Competitive pricing for segment' } },
      overall: { score: 7.8, justification: { tr: 'En iyi teknoloji odaklı EV', en: 'Best tech-focused EV' } }
    },
    specs: { engine: 'Dual Motor Electric', power: '340 hp', torque: '493 Nm', acceleration: '4.4s', topSpeed: '233 km/h' },
    strengths: { tr: ['Üstün teknoloji', 'Hızlı hızlanma', 'Geniş şarj ağı'], en: ['Superior technology', 'Rapid acceleration', 'Extensive charging network'] },
    weaknesses: { tr: ['Yapı kalitesi tutarsızlıkları', 'Minimalist iç mekan'], en: ['Build quality inconsistencies', 'Minimalist interior'] },
    bestFor: { tr: 'Teknoloji meraklıları', en: 'Tech enthusiasts' }
  },
  {
    id: '5',
    brand: 'porsche',
    model: '911',
    year: 2024,
    segment: 'sports',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    scores: {
      reliability: { score: 8.0, justification: { tr: 'Olgun platform, premium bakım gerektirir', en: 'Mature platform, requires premium maintenance' } },
      buildQuality: { score: 9.5, justification: { tr: 'El işçiliği ve hassasiyet', en: 'Handcrafted precision' } },
      performance: { score: 9.8, justification: { tr: 'Efsanevi performans mimarisi', en: 'Legendary performance architecture' } },
      drivingExperience: { score: 10.0, justification: { tr: 'Segment tanımlayan sürüş deneyimi', en: 'Segment-defining driving experience' } },
      technology: { score: 8.0, justification: { tr: 'Sürüş odaklı, yeterli infotainment', en: 'Driving-focused, adequate infotainment' } },
      safety: { score: 8.0, justification: { tr: 'Spor araç için yeterli sistemler', en: 'Adequate systems for sports car' } },
      costOfOwnership: { score: 5.0, justification: { tr: 'Çok yüksek bakım ve sigorta', en: 'Very high maintenance and insurance' } },
      design: { score: 9.5, justification: { tr: 'İkonik ve zamansız', en: 'Iconic and timeless' } },
      valueForMoney: { score: 7.0, justification: { tr: 'Yüksek fiyat ancak yüksek değer koruma', en: 'High price but high value retention' } },
      overall: { score: 9.0, justification: { tr: 'Spor araç segmentinin referans noktası', en: 'Benchmark of sports car segment' } }
    },
    specs: { engine: '3.0L Twin-Turbo Flat-6', power: '385 hp', torque: '450 Nm', acceleration: '4.2s', topSpeed: '293 km/h' },
    strengths: { tr: ['Efsanevi sürüş', 'Zamansız tasarım', 'Yüksek değer koruma'], en: ['Legendary driving', 'Timeless design', 'High value retention'] },
    weaknesses: { tr: ['Yüksek fiyat', 'Sınırlı pratiklik'], en: ['High price', 'Limited practicality'] },
    bestFor: { tr: 'Saf sürüş tutkunları', en: 'Pure driving enthusiasts' }
  }
];

export const translations = {
  tr: {
    nav: { home: 'Ana Sayfa', vehicles: 'Araçlar', compare: 'Karşılaştır', favorites: 'Favoriler', admin: 'Yönetim' },
    hero: { title: 'Profesyonel Araç Değerlendirme Platformu', subtitle: 'Kanıta dayalı, tutarlı ve tekrarlanabilir araç değerlendirmeleri', cta: 'Araçları Keşfet' },
    search: { placeholder: 'Marka veya model ara...', filter: 'Filtrele', segment: 'Segment', brand: 'Marka', year: 'Yıl', all: 'Tümü' },
    vehicle: { specs: 'Teknik Özellikler', scores: 'Puanlar', strengths: 'Güçlü Yönler', weaknesses: 'Zayıf Yönler', bestFor: 'Kime Uygun?', compare: 'Karşılaştır', addFavorite: 'Favorilere Ekle', removeFavorite: 'Favorilerden Çıkar' },
    comparison: { title: 'Araç Karşılaştırma', selectVehicle: 'Araç Seç', winner: 'Kazanan', clear: 'Temizle' },
    auth: { login: 'Giriş Yap', register: 'Kayıt Ol', logout: 'Çıkış', email: 'E-posta', password: 'Şifre', name: 'Ad Soyad' },
    admin: { title: 'Yönetim Paneli', addVehicle: 'Araç Ekle', editVehicle: 'Araç Düzenle', deleteVehicle: 'Araç Sil', selectBrand: 'Marka Seç', selectModel: 'Model Seç', selectYear: 'Yıl Seç' },
    footer: { rights: 'Tüm hakları saklıdır', privacy: 'Gizlilik', terms: 'Kullanım Şartları' }
  },
  en: {
    nav: { home: 'Home', vehicles: 'Vehicles', compare: 'Compare', favorites: 'Favorites', admin: 'Admin' },
    hero: { title: 'Professional Vehicle Rating Platform', subtitle: 'Evidence-based, consistent and repeatable vehicle evaluations', cta: 'Explore Vehicles' },
    search: { placeholder: 'Search brand or model...', filter: 'Filter', segment: 'Segment', brand: 'Brand', year: 'Year', all: 'All' },
    vehicle: { specs: 'Specifications', scores: 'Scores', strengths: 'Strengths', weaknesses: 'Weaknesses', bestFor: 'Best For', compare: 'Compare', addFavorite: 'Add to Favorites', removeFavorite: 'Remove from Favorites' },
    comparison: { title: 'Vehicle Comparison', selectVehicle: 'Select Vehicle', winner: 'Winner', clear: 'Clear' },
    auth: { login: 'Login', register: 'Register', logout: 'Logout', email: 'Email', password: 'Password', name: 'Full Name' },
    admin: { title: 'Admin Panel', addVehicle: 'Add Vehicle', editVehicle: 'Edit Vehicle', deleteVehicle: 'Delete Vehicle', selectBrand: 'Select Brand', selectModel: 'Select Model', selectYear: 'Select Year' },
    footer: { rights: 'All rights reserved', privacy: 'Privacy', terms: 'Terms of Service' }
  }
};

// Generate years from 2005 to 2025
export const years = Array.from({ length: 21 }, (_, i) => 2025 - i);

// Model data for brands (sample - would be comprehensive in production)
export const brandModels = {
  bmw: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX', 'iX3'],
  mercedes: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'AMG GT', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS'],
  audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'e-tron GT'],
  volkswagen: ['Polo', 'Golf', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'ID.Buzz'],
  toyota: ['Yaris', 'Corolla', 'Camry', 'Avalon', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Supra', 'GR86', 'bZ4X', 'Prius'],
  honda: ['Jazz', 'Civic', 'Accord', 'HR-V', 'CR-V', 'ZR-V', 'e:Ny1', 'NSX'],
  tesla: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  porsche: ['718 Cayman', '718 Boxster', '911', 'Panamera', 'Cayenne', 'Macan', 'Taycan'],
  ford: ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'Puma', 'Kuga', 'Explorer', 'Ranger', 'F-150', 'Mach-E'],
  hyundai: ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Kona', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Ioniq 6'],
  kia: ['Picanto', 'Rio', 'Ceed', 'Forte', 'Stinger', 'Niro', 'Sportage', 'Sorento', 'EV6', 'EV9'],
  mazda: ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5', 'MX-30'],
  volvo: ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40', 'EX30', 'EX90'],
  peugeot: ['208', '308', '408', '508', '2008', '3008', '5008', 'e-208', 'e-2008'],
  renault: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Austral', 'Arkana', 'Scenic', 'Espace', 'Zoe', 'Megane E-Tech']
};
