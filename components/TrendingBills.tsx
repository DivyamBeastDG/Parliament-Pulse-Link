'use client';
import Link from 'next/link';
import { FileText, ArrowRight, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export function TrendingBills() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data } = await supabase.from('bills').select('id, title, status, date_introduced, ai_summary_what').order('date_introduced', { ascending: false }).limit(3);
      if (data) setBills(data);
      setLoading(false);
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!loading && bills.length > 0) {
      anime({
        targets: '.trending-card',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(150),
        easing: 'easeOutExpo',
        duration: 800
      });
    }
  }, [loading, bills]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-text-primary">Recent Legislation</h2>
        <Link href="/bills" className="text-sm text-accent hover:text-accent-3 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-bg-elevated border border-border-subtle animate-pulse">
              <div className="flex justify-between mb-4"><div className="w-10 h-10 bg-bg-hover rounded-lg"></div><div className="w-16 h-5 bg-bg-hover rounded-full"></div></div>
              <div className="h-5 bg-bg-hover rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-bg-hover rounded w-full mb-2"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && bills.length === 0 && (
        <div className="p-12 rounded-xl bg-bg-elevated/50 border border-dashed border-border-strong flex flex-col items-center justify-center text-center">
          <Database className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Live Data Yet</h3>
          
        </div>
      )}

      {!loading && bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bills.map((bill) => (
            <div key={bill.id} className="trending-card card-hover p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-bg-hover border border-border-subtle"><FileText className="w-5 h-5 text-accent" /></div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium status-${(bill.status || 'pending').toLowerCase()}`}>{bill.status || 'Pending'}</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">{bill.title}</h3>
              <p className="text-sm text-text-secondary mb-4 line-clamp-3">{bill.ai_summary_what || 'AI summary pending...'}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{bill.date_introduced ? new Date(bill.date_introduced).toLocaleDateString() : 'Recent'}</span>
                <Link href={`/bills/${bill.id}`} className="text-accent hover:underline">Read AI Summary</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}