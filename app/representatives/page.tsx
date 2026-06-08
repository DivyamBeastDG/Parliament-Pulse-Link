'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, MapPin, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import anime from 'animejs';

export default function RepresentativesPage() {
  const { t } = useLanguage();
  const [reps, setReps] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReps(); }, []);

  const fetchReps = async () => {
    setLoading(true);
    const { data } = await supabase.from('representatives').select('*').order('name', { ascending: true });
    if (data) setReps(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && reps.length > 0) {
      anime({
        targets: '.rep-card',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80),
        easing: 'easeOutExpo',
        duration: 600
      });
    }
  }, [loading, reps, searchTerm]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/ingest/real-data`, { method: 'POST' });
      await res.json();
      alert(`✅ Success! Synced real representative data.`);
      fetchReps();
    } catch (error) { 
      alert('❌ Failed to sync. Is the backend running?'); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const filteredReps = reps.filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.party?.toLowerCase().includes(searchTerm.toLowerCase()) || r.constituency?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">{t('reps.title')}</h1>
        <p className="text-text-secondary max-w-2xl">{t('reps.subtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button onClick={handleSync} disabled={isSyncing} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-3 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? t('bills.syncing') : t('reps.sync')}
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('reps.search_placeholder')} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:border-accent transition-colors" />
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-text-muted">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReps.map((rep) => (
            <Link href={`/representatives/${rep.id}`} key={rep.id} className="block group">
              <div className="rep-card card-hover p-6 rounded-xl bg-bg-elevated border border-border-subtle h-full flex flex-col" style={{ opacity: 0 }}>
                <div className="flex items-center gap-4 mb-4">
                  {rep.photo_url ? (
                    <img src={rep.photo_url} alt={rep.name} className="w-14 h-14 rounded-full object-cover border-2 border-border-subtle group-hover:border-accent transition-colors bg-bg-elevated" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-bg-hover border border-border-subtle flex items-center justify-center text-xl font-bold text-accent group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                      {rep.name ? rep.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'NA'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">{rep.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                      <span className="px-2 py-0.5 rounded bg-bg-hover border border-border-subtle text-xs text-text-secondary">{rep.party}</span>
                      <span>•</span>
                      <span>{rep.role}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-text-secondary mb-6 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    <span>{rep.constituency || 'N/A'}, {rep.district || 'Uttarakhand'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span>Attendance: <span className="text-success font-medium">{rep.attendance_rate ? rep.attendance_rate + '%' : 'N/A'}</span></span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border-subtle">
                  <span className="text-sm text-accent font-medium group-hover:underline">View Profile & Activity →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}