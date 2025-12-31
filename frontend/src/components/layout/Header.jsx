import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, Menu, X, Heart, BarChart3, Settings, LogIn, LogOut, User, Globe, FileText, Warehouse, Sparkles, Newspaper, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useTheme } from '../../context/ThemeContext';
import ChristmasLights from './ChristmasLights';
import VehicleWizardModal from '../pages/VehicleWizardModal';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const { t, language, setLanguage, languages } = useLanguage();
  const { isChristmasEnabled } = useTheme();
  const { user, logout } = useAuth();
  const { compareList } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/vehicles', label: t('nav.vehicles'), icon: Car },
    { path: '/compare', label: t('nav.compare'), icon: BarChart3, badge: compareList.length },
    { path: '/garage', label: 'Garaj', icon: Warehouse },
    { path: '/news', label: 'Haberler', icon: Newspaper },
    { path: '/blog', label: 'Blog', icon: FileText },
    { path: '/ai-asistan', label: 'AI Asistan', icon: Sparkles },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/20 py-2' : 'bg-transparent backdrop-blur-sm py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo with Glow Effect */}
          <Link to="/" className="flex items-center gap-3 group logo-hover-glow">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 blur-sm opacity-60 group-hover:opacity-80" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/40 transition-all border border-white/10">
                <Car className="w-6 h-6 text-white transform -rotate-6 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>

            <div className={`hidden sm:flex flex-col ${isChristmasEnabled ? 'logo-text' : ''}`}>
              <span className={`text-lg font-black text-white leading-none tracking-tight group-hover:text-amber-500 transition-colors ${isChristmasEnabled ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-500' : ''}`}>OTORİTE</span>
              <span className="text-[9px] text-amber-500 font-bold tracking-[0.2em] uppercase">AUTO RANK</span>
            </div>
          </Link>

          <ChristmasLights />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-medium overflow-hidden group ${isActive(item.path)
                  ? 'text-white bg-white/10 shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive(item.path) ? 'text-amber-500' : 'group-hover:text-amber-500'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-scale-bounce">
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Line with Animation */}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full mb-1 nav-underline-animate" />
                )}

                {/* Hover Underline Effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-500/50 rounded-full mb-1 group-hover:w-1/2 transition-all duration-300" />
              </Link>
            ))}

            {/* Wizard Button */}
            <button
              onClick={() => setWizardOpen(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-sm font-bold flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              <Wand2 className="w-4 h-4" />
              Sihirbaz
            </button>

          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors icon-bounce-hover">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-200 min-w-[150px] animate-fade-scale-in">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`cursor-pointer ${language === lang.code ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-slate-800'}`}
                  >
                    <span className="mr-3 text-lg">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Actions */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-2 pr-4 py-1.5 h-auto text-slate-300 hover:text-white hover:bg-white/5 gap-3 border border-slate-700/50 rounded-full bg-slate-900/50 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs text-slate-400 leading-none mb-0.5">Hoşgeldin,</div>
                      <div className="text-sm font-bold leading-none">{user.name.split(' ')[0]}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-300 mt-2 animate-fade-scale-in">
                  <div className="px-2 py-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">Hesabım</div>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-slate-800 hover:text-white focus:bg-slate-800">
                    <User className="w-4 h-4 mr-2 text-amber-500" />
                    Profil Ayarları
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer hover:bg-slate-800 hover:text-white focus:bg-slate-800">
                    <Heart className="w-4 h-4 mr-2 text-rose-500" />
                    {t('nav.favorites')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/garage/my')} className="cursor-pointer hover:bg-slate-800 hover:text-white focus:bg-slate-800">
                    <Warehouse className="w-4 h-4 mr-2 text-amber-500" />
                    Garajım
                  </DropdownMenuItem>

                  {user.isAdmin && (
                    <>
                      <div className="border-t border-slate-800 my-1 mx-2"></div>
                      <div className="px-2 py-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">Yönetim</div>
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer hover:bg-slate-800 hover:text-white focus:bg-slate-800">
                        <Settings className="w-4 h-4 mr-2 text-blue-500" />
                        {t('nav.admin')}
                      </DropdownMenuItem>
                    </>
                  )}
                  <div className="border-t border-slate-800 my-1 mx-2"></div>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-500/50 rounded-full px-6 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <span className="font-medium">{t('auth.login')}</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced Slide Animation */}
        <div className={`lg:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 transition-all duration-300 ease-out overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="p-4 flex flex-col gap-2">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${isActive(item.path)
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full ml-auto shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            {user && (
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${isActive('/favorites')
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-500'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                <Heart className="w-5 h-5" />
                <span>{t('nav.favorites')}</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Vehicle Wizard Modal */}
      <VehicleWizardModal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </header>
  );
};

export default Header;
