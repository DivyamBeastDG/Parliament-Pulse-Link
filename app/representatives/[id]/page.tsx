'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, MapPin, Users, FileText, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export default function RepresentativeDetailPage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage();
  const [rep, setRep] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [translatedBio, setTranslatedBio] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('representatives').select('*').eq('id', params.id).single();
      if (data && !error) setRep(data);
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  useEffect(() => {
    if (rep && contentRef.current) {
      anime({
        targets: '.profile-animate',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        easing: 'easeOutExpo',
        duration: 800
      });
    }
  }, [rep]);

  useEffect(() => {
    if (!rep || language === 'en') { setTranslatedBio(''); return; }
    const translateBio = async () => {
      setIsTranslating(true);
      try {
        const bioText = `${rep.name} is a ${rep.role} representing ${rep.constituency} in the ${rep.district} district of Uttarakhand. They belong to the ${rep.party} party.`;
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: bioText, targetLang: language })
        });
        const data = await res.json();
        if (data.translatedText) setTranslatedBio(data.translatedText);
      } catch (error) { console.error('Translation failed', error); } finally { setIsTranslating(false); }
    };
    translateBio();
  }, [rep, language]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-text-muted animate-pulse">Loading representative profile...</div>;
  if (!rep) return <div className="max-w-5xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-text-primary mb-4">Representative Not Found</h2><Link href="/representatives" className="text-accent hover:underline inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Representatives</Link></div>;

  const displayBio = translatedBio || `${rep.name} is a ${rep.role} representing ${rep.constituency} in the ${rep.district} district of Uttarakhand. They belong to the ${rep.party} party.`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/representatives" className="profile-animate inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-8 transition-colors" style={{ opacity: 0 }}>
        <ArrowLeft className="w-4 h-4" /> Back to Representatives
      </Link>

      <div ref={contentRef}>
        <div className="profile-animate flex flex-col md:flex-row md:items-center gap-8 mb-8 p-8 rounded-2xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
          {rep.photo_url ? (
            <img src={rep.photo_url} alt={rep.name} className="w-32 h-32 rounded-full object-cover border-4 border-bg-hover shadow-xl" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-bg-hover border-4 border-border-subtle flex items-center justify-center text-4xl font-bold text-accent shadow-xl">
              {rep.name ? rep.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'NA'}
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">{rep.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
              <span className="px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold">{rep.party}</span>
              <span className="px-4 py-1.5 rounded-full bg-bg-hover border border-border-subtle text-text-secondary font-medium">{rep.role}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="profile-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-6">Constituency Details</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-bg-hover border border-border-subtle"><MapPin className="w-5 h-5 text-accent" /></div>
                  <div><div className="text-xs text-text-muted uppercase tracking-wide mb-1">Constituency</div><div className="text-text-primary font-semibold text-lg">{rep.constituency || 'N/A'}</div></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-bg-hover border border-border-subtle"><Building2 className="w-5 h-5 text-accent" /></div>
                  <div><div className="text-xs text-text-muted uppercase tracking-wide mb-1">District</div><div className="text-text-primary font-semibold text-lg">{rep.district || 'Uttarakhand'}</div></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-bg-hover border border-border-subtle"><Users className="w-5 h-5 text-accent" /></div>
                  <div><div className="text-xs text-text-muted uppercase tracking-wide mb-1">Attendance Rate</div><div className="text-success font-semibold text-lg">{rep.attendance_rate ? rep.attendance_rate + '%' : 'Pending'}</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="profile-animate p-8 rounded-xl bg-bg-elevated border border-border-subtle h-full" style={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6 text-accent">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Representative Overview {isTranslating && <span className="text-xs text-text-muted animate-pulse ml-2 font-normal">(Translating...)</span>}</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-text-secondary leading-relaxed text-lg mb-8">{displayBio}</p>
                <div className="p-5 rounded-lg bg-bg-hover/50 border border-border-subtle">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> Note on Data Accuracy</h4>
                  <p className="text-sm text-text-muted leading-relaxed">This profile is dynamically generated from live, verified election data. Attendance and legislative activity metrics are currently being synchronized with official databases.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}