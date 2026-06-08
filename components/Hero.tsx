'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export function Hero() {
  const { t } = useLanguage();

  useEffect(() => {
    anime.timeline({ easing: 'easeOutExpo', duration: 1000 })
      .add({ targets: '.hero-emblem', opacity: [0, 1], scale: [0.8, 1] })
      .add({ targets: '.hero-badge', opacity: [0, 1], translateY: [10, 0] }, '-=800')
      .add({ targets: '.hero-title', opacity: [0, 1], translateY: [20, 0] }, '-=700')
      .add({ targets: '.hero-desc', opacity: [0, 1], translateY: [20, 0] }, '-=600')
      .add({ targets: '.hero-btns', opacity: [0, 1], translateY: [20, 0] }, '-=500');
  }, []);

  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <div className="flex flex-col items-center">
        <div className="hero-emblem mb-8 flex flex-col items-center" style={{ opacity: 0 }}>
          <img src="/emblem.png" alt="State Emblem of India" className="w-20 h-20 object-contain mb-3 brightness-0 invert" />
          <span className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-semibold">Satyameva Jayate</span>
        </div>

        <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs text-accent mb-6" style={{ opacity: 0 }}>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          {t('hero.badge')}
        </div>

        <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight gradient-text mb-6" style={{ opacity: 0 }}>
          {t('hero.title1')} <br className="hidden sm:block" />
          <span className="text-accent">{t('hero.title2')}</span>
        </h1>

        <p className="hero-desc text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed" style={{ opacity: 0 }}>
          {t('hero.desc')}
        </p>

        <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: 0 }}>
          <Link href="/search" className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-3 transition-all shadow-lg shadow-accent/20">
            {t('hero.btn_search')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/bills" className="px-6 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-text-primary font-medium hover:border-border-hover transition-all">
            {t('hero.btn_browse')}
          </Link>
        </div>
      </div>
    </section>
  );
}