import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../data/mock';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    const lang = languages.find(l => l.code === language);
    if (lang?.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language] || translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const getLocalizedText = (obj) => {
    if (!obj) return '';
    return obj[language] || obj.en || Object.values(obj)[0] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedText, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
