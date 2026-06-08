'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export default function BillsPage() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    setLoading(true);
    const { data } = await supabase.from('bills').select('id, title, status, department, date_introduced, ai_summary_what').order('date_introduced', { ascending: false });
    if (data) setBills(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && bills.length > 0) {
      anime({
        targets: '.bill-row',
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(80),
        easing: 'easeOutExpo',
        duration: 600
      });
    }
  }, [loading, bills, searchTerm]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/ingest/real-data`, { method: 'POST' });
      const data = await res.json();
      alert(`✅ Success! Synced real legislative data.`);
      fetchBills();
    } catch (error) { 
      alert('❌ Failed to sync. Is the backend running?'); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const filteredBills = bills.filter(b => b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || b.department?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">{t('bills.title')}</h1>
        <p className="text-text-secondary max-w-2xl">{t('bills.subtitle')}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button onClick={handleSync} disabled={isSyncing} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-3 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? t('bills.syncing') : t('bills.sync')}
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('bills.search_placeholder')} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:border-accent transition-colors" />
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-text-muted">Loading...</div> : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bill-row card-hover p-6 rounded-xl bg-bg-elevated border border-border-subtle" style={{ opacity: 0 }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{bill.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{bill.department || 'Unknown'} • {bill.date_introduced ? new Date(bill.date_introduced).toLocaleDateString() : 'N/A'}</p>
                </div>
                <span className={`self-start text-xs px-3 py-1 rounded-full font-medium status-${(bill.status || 'pending').toLowerCase()}`}>{bill.status || 'Pending'}</span>
              </div>
              <p className="text-sm text-text-secondary mb-4">{bill.ai_summary_what || 'Summary generating...'}</p>
              <Link href={`/bills/${bill.id}`} className="inline-flex items-center text-sm text-accent hover:text-accent-3 font-medium">View Details & AI Summary →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}