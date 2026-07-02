'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/bills'); // Redirect to bills page after login
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="p-8 rounded-2xl bg-bg-elevated border border-border-subtle shadow-xl">
        <h1 className="text-2xl font-bold text-text-primary mb-6 text-center flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6 text-accent" /> Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg bg-bg-hover border border-border-subtle text-text-primary focus:outline-none focus:border-accent" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-bg-hover border border-border-subtle text-text-primary focus:outline-none focus:border-accent" required />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-3 transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-text-muted text-center mt-4">*Ensure you have created a user in the Supabase Authentication tab first.</p>
      </div>
    </div>
  );
}