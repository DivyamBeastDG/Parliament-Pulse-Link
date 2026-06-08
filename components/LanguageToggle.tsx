'use client';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'gar', name: 'गढ़वाली' },
    { code: 'kum', name: 'कुमाऊंनी' },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-elevated border border-border-subtle hover:border-border-hover transition-all text-sm text-text-secondary">
        <Globe className="w-4 h-4" />
        <span className="uppercase">{language}</span>
      </button>
      <div className="absolute right-0 top-full mt-2 w-32 bg-bg-elevated border border-border-subtle rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-hover first:rounded-t-lg last:rounded-b-lg ${language === lang.code ? 'text-accent' : 'text-text-secondary'}`}>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}