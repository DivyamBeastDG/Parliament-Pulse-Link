'use client';
import { Globe } from 'lucide-react';
// 1. Import the Language type from your hook
import { useLanguage, Language } from '@/hooks/useLanguage'; 

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  // 2. Explicitly type the array so TypeScript knows 'code' is of type Language
  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'gar', name: 'Garhwali' },
    { code: 'kum', name: 'Kumaoni' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-elevated border border-border-subtle hover:border-border-hover transition-all text-sm text-text-secondary">
        <Globe className="w-4 h-4" />
        <span>{languages.find(l => l.code === language)?.name || 'English'}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-32 bg-bg-elevated border border-border-subtle rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button 
            key={lang.code} 
            // 3. Now TypeScript is perfectly happy because lang.code is typed as Language
            onClick={() => setLanguage(lang.code)} 
            className={`w-full text-left px-4 py-2 text-sm hover:bg-bg-hover first:rounded-t-lg last:rounded-b-lg ${language === lang.code ? 'text-accent' : 'text-text-secondary'}`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}