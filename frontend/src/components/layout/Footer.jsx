import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Gauge, Award, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 overflow-hidden">
      {/* Animated Wave Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform rotate-180">
        <svg className="relative block w-[200%] h-16 animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="rgba(15, 23, 42, 0.8)"
            opacity=".25"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            fill="rgba(15, 23, 42, 0.5)"
            opacity=".5"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,googol172.46-45.71,248.8-84.81V0Z"
            fill="rgba(15, 23, 42, 1)"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-none tracking-tight group-hover:text-amber-500 transition-colors">OTORİTE</span>
                <span className="text-[9px] text-amber-500 font-bold tracking-[0.2em] uppercase">AUTO RANK</span>
              </div>
            </Link>
            <p className="text-slate-400 max-w-md leading-relaxed mb-8">
              Profesyonel, kanıta dayalı ve tutarlı araç değerlendirmeleri.
              10 boyutlu puanlama sistemi ile doğru karar verin.
            </p>

            {/* Social Icons with Bounce */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all icon-bounce-hover"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Özellikler</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer group">
                <div className="w-8 h-8 bg-slate-800 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                  <Shield className="w-4 h-4 text-amber-500" />
                </div>
                <span>Güvenilirlik Analizi</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer group">
                <div className="w-8 h-8 bg-slate-800 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                  <Gauge className="w-4 h-4 text-amber-500" />
                </div>
                <span>Performans Değerlendirmesi</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer group">
                <div className="w-8 h-8 bg-slate-800 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <span>Karşılaştırmalı Analiz</span>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Desteklenen Diller</h4>
            <div className="flex flex-wrap gap-2">
              {['TR', 'EN', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'AR'].map((lang, i) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 text-sm rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all cursor-default"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} <span className="text-amber-500 font-semibold">Otorite</span>. {t('footer.rights')}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-amber-500 text-sm transition-colors relative group">
              {t('footer.privacy')}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="text-slate-500 hover:text-amber-500 text-sm transition-colors relative group">
              {t('footer.terms')}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Orbs */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
};

export default Footer;
