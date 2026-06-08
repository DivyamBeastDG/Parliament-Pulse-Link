'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/lib/translations';

type Language = 'en' | 'hi' | 'gar' | 'kum';
interface LanguageContextType { 
  language: Language; 
  setLanguage: (lang: Language) => void; 
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('ppl-language') as Language;
    if (saved && translations[saved]) setLanguageState(saved);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ppl-language', lang);
    document.body.className = document.body.className.replace(/lang-\w+/g, '').trim();
    if (lang !== 'en') document.body.classList.add(`lang-${lang}`);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};