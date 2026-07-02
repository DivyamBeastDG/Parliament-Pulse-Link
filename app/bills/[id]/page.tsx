'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Sparkles, FileText, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import anime from 'animejs';

export default function BillDetailPage({ params }: { params: { id: string } }) {
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBill = async () => {
      const { data } = await supabase.from('bills').select('*').eq('id', params.id).single();
      if (data) setBill(data);
      setLoading(false);
    };
    fetchBill();
  }, [params.id]);

  useEffect(() => {
    if (bill && contentRef.current) {
      anime({ targets: '.bill-animate', opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(100), easing: 'easeOutExpo', duration: 800 });
    }
  }, [bill]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-text-muted animate-pulse">Loading comprehensive analysis...</div>;
  if (!bill) return <div className="max-w-5xl mx-auto px-4 py-20 text-center"><Link href="/bills" className="text-accent">← Back to Bills</Link></div>;

  // Helper to render bullet points from the AI string
  const renderBullets = (text: string) => {
    if (!text) return <p className="text-text-muted italic">No provisions extracted.</p>;
    return (
      <ul className="space-y-3 text-text-secondary leading-relaxed">
        {text.split('\n').map((line, i) => {
          const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
          if (!cleanLine) return null;
          return (
            <li key={i} className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <span>{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/bills" className="bill-animate inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-8 transition-colors" style={{ opacity: 0 }}>
        <ArrowLeft className="w-4 h-4" /> Back to Bills Archive
      </Link>

      <div ref={contentRef}>
        {/* Header & PDF Download */}
        <div className="bill-animate p-8 rounded-2xl bg-bg-elevated border border-border-subtle mb-8" style={{ opacity: 0 }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">{bill.title}</h1>
            <span className={`self-start text-sm px-4 py-1.5 rounded-full font-semibold status-${(bill.status || 'pending').toLowerCase()}`}>{bill.status}</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-text-secondary mb-6">
            <span>{bill.department}</span>
            <span>{bill.date_introduced ? new Date(bill.date_introduced).toLocaleDateString() : 'N/A'}</span>
          </div>
          
          {bill.pdf_url && (
            <a href={bill.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-hover border border-border-subtle text-text-primary hover:border-accent transition-colors">
              <Download className="w-4 h-4 text-accent" /> Download Original PDF Document
            </a>
          )}
        </div>

        {/* Comprehensive Analysis Grid */}
        <div className="space-y-6">
          <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4 text-accent"><FileText className="w-5 h-5" /><h2 className="text-xl font-semibold">Legislative Objective</h2></div>
            <p className="text-text-secondary leading-relaxed text-lg">{bill.summary_objective || bill.ai_summary_what}</p>
          </div>

          <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4 text-accent"><Sparkles className="w-5 h-5" /><h2 className="text-xl font-semibold">Key Provisions & Clauses</h2></div>
            {renderBullets(bill.key_provisions)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4 text-red-500"><AlertTriangle className="w-5 h-5" /><h2 className="text-xl font-semibold">Penalties & Enforcement</h2></div>
              <p className="text-text-secondary leading-relaxed">{bill.penalties || 'No specific penalties detailed.'}</p>
            </div>
            <div className="bill-animate p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4 text-success"><CheckCircle2 className="w-5 h-5" /><h2 className="text-xl font-semibold">Impact on Citizens</h2></div>
              <p className="text-text-secondary leading-relaxed">{bill.citizen_impact || bill.ai_summary_why}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}