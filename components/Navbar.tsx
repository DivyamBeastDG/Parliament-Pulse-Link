'use client';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';
import { NavbarAuthButton } from '@/components/NavbarAuthButton';
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      anime({ targets: '.mobile-menu', opacity: [0, 1], translateY: [-10, 0], easing: 'easeOutExpo', duration: 400 });
    }
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/emblem.png" alt="State Emblem of India" className="w-8 h-8 object-contain brightness-0 invert" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-text-primary group-hover:text-accent transition-colors">Parliament Pulse Link</span>
              <span className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-medium">Satyameva Jayate</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t('nav.home')}</Link>
            <Link href="/bills" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t('nav.bills')}</Link>
            <Link href="/representatives" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t('nav.reps')}</Link>
            <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t('nav.about')}</Link>
            <LanguageToggle />
            <Link href="/search" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-elevated border border-border-subtle hover:border-border-hover transition-all text-sm text-text-secondary">
              <Search className="w-4 h-4" /> <span>{t('nav.search')}</span>
            </Link>
            <NavbarAuthButton />
          </div>

          <button className="md:hidden text-text-secondary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mobile-menu md:hidden bg-bg-secondary border-b border-border-subtle p-4 space-y-4" style={{ opacity: 0 }}>
          <Link href="/" className="block text-sm text-text-secondary">{t('nav.home')}</Link>
          <Link href="/bills" className="block text-sm text-text-secondary">{t('nav.bills')}</Link>
          <Link href="/representatives" className="block text-sm text-text-secondary">{t('nav.reps')}</Link>
          <Link href="/about" className="block text-sm text-text-secondary">{t('nav.about')}</Link>
          <Link href="/search" className="block text-sm text-text-secondary">{t('nav.search')}</Link>
          <LanguageToggle />
        </div>
      )}
    </nav>
  );
}