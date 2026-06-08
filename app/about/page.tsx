'use client';
import { motion } from 'framer-motion';
import { Brain, Shield, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  const features = [
    { icon: Brain, title: 'AI-Powered Summaries', desc: 'Complex legal jargon translated into simple, actionable insights for every citizen.' },
    { icon: Shield, title: 'Radical Transparency', desc: 'Every bill, amendment, and representative vote is tracked and made publicly accessible.' },
    { icon: Globe, title: 'Multilingual Access', desc: 'Breaking language barriers with full support for English, Hindi, Garhwali, and Kumaoni.' },
    { icon: Zap, title: 'Semantic Search', desc: 'Powered by pgvector, find legislation by meaning and intent, not just exact keyword matches.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-4xl font-bold gradient-text mb-6">About Parliament Pulse Link</h1>
        <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
          Parliament Pulse Link is a civic technology initiative designed to democratize access to legislative information in Uttarakhand. 
          We believe that an informed citizenry is the foundation of a strong democracy. By leveraging modern AI and semantic search, 
          we transform opaque government portals into intuitive, premium digital experiences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl bg-bg-elevated border border-border-subtle card-hover">
            <div className="w-12 h-12 rounded-lg bg-bg-hover border border-border-subtle flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{f.title}</h3>
            <p className="text-text-secondary">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-xl bg-bg-elevated border border-border-subtle text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Our Technology Stack</h2>
        <p className="text-text-secondary mb-6">Built for performance, security, and scalability.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Next.js 14', 'Tailwind CSS', 'Supabase (PostgreSQL + pgvector)', 'Python (FastAPI)', 'OpenRouter AI', 'Anime.js'].map(tech => (
            <span key={tech} className="px-4 py-2 rounded-full bg-bg-hover border border-border-subtle text-sm text-text-secondary">{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}