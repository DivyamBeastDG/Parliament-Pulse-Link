'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';

export function NavbarAuthButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    window.location.reload(); // Refresh page to hide admin features
  };

  if (isAdmin) {
    return (
      <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    );
  }

  return (
    <Link href="/login" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-elevated border border-border-subtle hover:border-accent hover:text-accent transition-colors text-sm text-text-secondary">
      <LogIn className="w-4 h-4" /> Admin Login
    </Link>
  );
}