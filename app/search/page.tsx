'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Sparkles } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // In production: call Supabase RPC for pgvector similarity search
    // const { data } = await supabase.rpc('match_bills', { query_embedding: await getEmbedding(query), match_count: 10 });
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Semantic Legislative Search</h1>
        <p className="text-text-secondary">Ask questions in plain English, Hindi, Garhwali, or Kumaoni. Our AI understands intent, not just keywords.</p>
      </motion.div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Show me bills related to forest conservation in Dehradun' or 'गढ़वाल में पर्यटन नीति'" 
          className="w-full pl-12 pr-32 py-4 rounded-xl bg-bg-elevated border border-border-subtle text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-lg shadow-accent/5"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted" />
        <button type="submit" disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-3 transition-colors disabled:opacity-50">
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {isSearching && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
          <Sparkles className="w-8 h-8 text-accent animate-pulse mb-4" />
          <p className="text-text-secondary">Analyzing legislative database with AI...</p>
        </motion.div>
      )}
    </div>
  );
}