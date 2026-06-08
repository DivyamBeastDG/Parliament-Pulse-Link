'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, FileText, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export default function BillDetailPage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage();
  const [bill, setBill] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [translatedSummary, setTranslatedSummary] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: billData } = await supabase.from('bills').select('*').eq('id', params.id).single();
      if (billData) setBill(billData);
      const { data: timelineData } = await supabase.from('bill_timeline').select('*').eq('bill_id', params.id).order('stage_date', { ascending: true });
      if (timelineData) setTimeline(timelineData);
    };
    fetchData();
  }, [params.id]);

  // ANIME.JS TIMELINE ANIMATION
  useEffect(() => {
    if (timeline.length > 0 && timelineRef.current) {
      const line = timelineRef.current.querySelector('.timeline-line');
      if (line) {
        anime({ targets: line, height: ['0%', '100%'], duration: 1200, easing: 'easeInOutQuad' });
      }
      const dots = timelineRef.current.querySelectorAll('.timeline-dot');
      anime({ targets: dots, scale: [0, 1], delay: anime.stagger(200, { start: 800 }), easing: 'easeOutBack' });
      const contents = timelineRef.current.querySelectorAll('.timeline-content');
      anime({ targets: contents, opacity: [0, 1], translateX: [-15, 0], delay: anime.stagger(200, { start: 900 }), easing: 'easeOutExpo' });
    }
  }, [timeline]);

  // Dynamic Translation
  useEffect(() => {
    if (!bill || language === 'en') { setTranslatedSummary(null); return; }
    const translateSummary = async () => {
      setIsTranslating(true);
      try {
        const textToTranslate = `${bill.ai_summary_what}\n\n${bill.ai_summary_why}\n\n${bill.ai_summary_impact}`;
        const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textToTranslate, targetLang: language }) });
        const data = await res.json();
        if (data.translatedText) {
          const parts = data.translatedText.split('\n\n');
          setTranslatedSummary({ what: parts[0], why: parts[1], impact: parts[2] });
        }
      } catch (error) { console.error('Translation failed', error); } finally { setIsTranslating(false); }
    };
    translateSummary();
  }, [bill, language]);

  if (!bill) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-text-muted">Loading bill details...</div>;

  const summary = translatedSummary || { what: bill.ai_summary_what, why: bill.ai_summary_why, impact: bill.ai_summary_impact };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/bills" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('bill.back')}
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-3 py-1 rounded-full font-medium status-${bill.status?.toLowerCase() || 'pending'}`}>{bill.status || 'Pending'}</span>
          <span className="text-sm text-text-muted">{bill.department}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">{bill.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="p-6 rounded-xl bg-bg-elevated border border-border-subtle">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-lg font-semibold">{t('bill.ai_summary')} {isTranslating && <span className="text-xs text-text-muted animate-pulse ml-2">(Translating...)</span>}</h2>
              </div>
              <div className="space-y-4 text-text-secondary">
                <div><strong className="text-text-primary">{t('bill.what')}</strong><br/>{summary.what}</div>
                <div><strong className="text-text-primary">{t('bill.why')}</strong><br/>{summary.why}</div>
                <div><strong className="text-text-primary">{t('bill.impact')}</strong><br/>{summary.impact}</div>
              </div>
            </section>

            {timeline.length > 0 && (
              <section className="p-6 rounded-xl bg-bg-elevated border border-border-subtle">
                <div className="flex items-center gap-2 mb-8 text-accent">
                  <Clock className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">{t('bill.timeline')}</h2>
                </div>
                <div ref={timelineRef} className="relative ml-3 space-y-8">
                  <div className="timeline-line absolute left-0 top-2 w-0.5 bg-border-subtle" style={{ height: '0%' }}></div>
                  {timeline.map((item) => (
                    <div key={item.id} className="relative pl-8 flex gap-4">
                      <div className="timeline-dot absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-bg-elevated" style={{ transform: 'scale(0)' }}></div>
                      <div className="timeline-content" style={{ opacity: 0 }}>
                        <div className="text-sm font-semibold text-text-primary">{item.stage}</div>
                        <div className="text-xs text-text-muted mb-1">{new Date(item.stage_date).toLocaleDateString()}</div>
                        <div className="text-sm text-text-secondary">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-bg-elevated border border-border-subtle">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{t('bill.docs')}</h3>
              {bill.document_url ? (
                <a href={bill.document_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-border-subtle text-text-secondary hover:border-accent hover:text-accent transition-colors">
                  <FileText className="w-4 h-4" /> {t('bill.download')}
                </a>
              ) : (
                <p className="text-sm text-text-muted italic">{t('bill.no_doc')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}