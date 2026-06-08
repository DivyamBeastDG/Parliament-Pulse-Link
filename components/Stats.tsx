'use client';
import { motion } from 'framer-motion';

export function Stats() {
  const stats = [
    { label: 'Bills Tracked', value: '142+' },
    { label: 'Representatives', value: '70 MLAs, 5 MPs' },
    { label: 'AI Summaries', value: '100%' },
    { label: 'Languages', value: '4' },
  ];
  return (
    <section className="border-y border-border-subtle bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-text-muted uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}