'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Sparkles, FileText, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export default function BillDetailPage({ params }: { params: { id: string } }) {
  const { language } = useLanguage();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState({ what: '', why: '', impact: '' });
  const [isTranslating, setIsTranslating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Fetch the specific bill from Supabase
  useEffect(() => {
    const fetchBill = async () => {
      const { data } = await supabase.from('bills').select('*').eq('id', params.id).single();
      if (data) setBill(data);
      setLoading(false);
    };
    fetchBill();
  }, [params.id]);

  // 2. Anime.js Entrance Animation
  useEffect(() => {
    if (bill && contentRef.current) {
      anime({
        targets: '.bill-animate',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        easing: 'easeOutExpo',
        duration: 800
      });
    }
  }, [bill]);

  // 3. Live Translation Logic (Translates What, Why, and Impact in parallel)
  useEffect(() => {
    if (!bill) return;

    // If English, just show the original database text
    if (language === 'en') {
      setTranslations({ 
        what: bill.ai_summary_what, 
        why: bill.ai_summary_why, 
        impact: bill.ai_summary_impact 
      });
      return;
    }

    // If another language, send all 3 fields to Qwen AI simultaneously
    const translateAll = async () => {
      setIsTranslating(true);
      try {
        const translateField = async (text: string) => {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLang: language })
          });
          const data = await res.json();
          return data.translatedText || text;
        };

        const [what, why, impact] = await Promise.all([
          translateField(bill.ai_summary_what),
          translateField(bill.ai_summary_why),
          translateField(bill.ai_summary_impact)
        ]);

        setTranslations({ what, why, impact });
      } catch (error) {
        console.error('Translation failed', error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateAll();
  }, [bill, language]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-text-muted animate-pulse">Loading bill details...</div>;
  
  if (!bill) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-text-primary mb-4">Bill Not Found</h2>
      <Link href="/bills" className="text-accent hover:underline inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Bills Archive
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/bills" className="bill-animate inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-8 transition-colors" style={{ opacity: 0 }}>
        <ArrowLeft className="w-4 h-4" /> Back to Bills Archive
      </Link>

      <div ref={contentRef}>
        {/* Header Card */}
        <div className="bill-animate p-8 rounded-2xl bg-bg-elevated border border-border-subtle mb-8" style={{ opacity: 0 }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">{bill.title}</h1>
            <span className={`self-start text-sm px-4 py-1.5 rounded-full font-semibold status-${(bill.status || 'pending').toLowerCase()}`}>
              {bill.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              <span>{bill.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span>{bill.date_introduced ? new Date(bill.date_introduced).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* AI Summaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4 text-accent">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-semibold">What it does</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {isTranslating && language !== 'en' ? <span className="animate-pulse text-text-muted">Translating...</span> : translations.what}
            </p>
          </div>

          <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Why it was introduced</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {isTranslating && language !== 'en' ? <span className="animate-pulse text-text-muted">Translating...</span> : translations.why}
            </p>
          </div>

          <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4 text-accent">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Impact on Citizens</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {isTranslating && language !== 'en' ? <span className="animate-pulse text-text-muted">Translating...</span> : translations.impact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}