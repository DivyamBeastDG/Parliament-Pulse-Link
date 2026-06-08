'use client';
import { Hero } from '@/components/Hero';
import { TrendingBills } from '@/components/TrendingBills';
import { Stats } from '@/components/Stats';

export default function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <TrendingBills />
    </div>
  );
}