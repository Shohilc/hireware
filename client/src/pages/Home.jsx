import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Building2, Globe, Code, Brain, Shield, Palette, Database, Cloud, Zap, TrendingUp, Users } from 'lucide-react';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect';
import { CardHoverEffect } from '@/components/aceternity/CardHoverEffect';
import { SparklesCore } from '@/components/aceternity/SparklesCore';
import { MovingBorder } from '@/components/aceternity/MovingBorder';
import SearchBar from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { useJobStore } from '@/store/jobStore';
import { useFilterStore } from '@/store/filterStore';
import api from '@/lib/axios';

const categories = [
  { icon: <Code className="w-6 h-6" />, title: 'Full Stack', description: 'React, Node, Django, and more', gradient: 'from-brand-500/20 to-brand-700/20', count: '2.4K+' },
  { icon: <Cloud className="w-6 h-6" />, title: 'DevOps', description: 'AWS, Docker, K8s, CI/CD', gradient: 'from-accent-cyan/20 to-blue-700/20', count: '1.8K+' },
  { icon: <Brain className="w-6 h-6" />, title: 'AI / ML', description: 'Deep Learning, NLP, Data', gradient: 'from-accent-purple/20 to-pink-700/20', count: '1.2K+' },
  { icon: <Palette className="w-6 h-6" />, title: 'UI/UX', description: 'Figma, Design Systems', gradient: 'from-accent-pink/20 to-rose-700/20', count: '980+' },
  { icon: <Database className="w-6 h-6" />, title: 'Data Science', description: 'Python, SQL, Analytics', gradient: 'from-accent-emerald/20 to-green-700/20', count: '1.5K+' },
  { icon: <Shield className="w-6 h-6" />, title: 'Cybersecurity', description: 'Pentesting, Cloud Security', gradient: 'from-red-500/20 to-orange-700/20', count: '650+' },
];

const steps = [
  { icon: '🔍', title: 'Search', description: 'Enter your desired role, skills, or company name across 6+ job platforms' },
  { icon: '🎯', title: 'Match', description: 'Our scrapers aggregate and deduplicate jobs from Naukri, Indeed, Internshala & more' },
  { icon: '🚀', title: 'Apply', description: 'Bookmark the best matches, track applications, and apply with one click' },
];

export default function Home() {
  const navigate = useNavigate();
  const { setFilter } = useFilterStore();
  const [stats, setStats] = useState({ totalJobs: 12400, totalCompanies: 340, platforms: 6 });

  useEffect(() => {
    api.get('/jobs/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const handleSearch = (query, location) => {
    setFilter('search', query);
    if (location) setFilter('location', location);
    navigate('/jobs');
  };

  return (
    <div className="min-h-screen">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <BackgroundBeams />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-400 text-xs font-medium mb-8"
          >
            <Zap className="w-3 h-3" />
            Aggregating from 6+ platforms in real-time
          </motion.div>

          {/* Headline */}
          <TextGenerateEffect
            words="Find Your Next Role, Instantly"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-white leading-tight mb-6"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            HireWave scrapes and aggregates thousands of jobs from LinkedIn, Naukri, Indeed, Internshala & Glassdoor — all in one beautiful interface.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <SearchBar onSearch={handleSearch} size="large" />
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <span>Trending:</span>
            {['React Developer', 'Data Scientist', 'DevOps', 'Full Stack'].map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term, '')}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-brand-500/10 hover:text-brand-400 border border-zinc-200 dark:border-white/5 hover:border-brand-500/20 transition-all text-zinc-600 dark:text-zinc-300"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ LIVE STATS BAR ═══════════════ */}
      <section className="py-8 border-y border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: `${(stats.totalJobs || 12400).toLocaleString()}+`, label: 'Jobs Aggregated', icon: Briefcase },
              { value: `${(stats.totalCompanies || 340).toLocaleString()}+`, label: 'Companies', icon: Building2 },
              { value: `${stats.platforms || 6}`, label: 'Platforms', icon: Globe },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-brand-400" />
                  <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white font-display">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ JOB CATEGORIES ═══════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-zinc-900 dark:text-white mb-3">
              Explore by Category
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Browse jobs across the most in-demand tech categories
            </p>
          </motion.div>

          <CardHoverEffect items={categories} />
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-20 px-4 bg-zinc-100/50 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-zinc-900 dark:text-white mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">Three simple steps to your dream job</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />
                )}

                <div className="w-20 h-20 rounded-2xl bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl mx-auto mb-4 card-glow text-zinc-900 dark:text-white">
                  {step.icon}
                </div>
                <div className="text-xs text-brand-400 font-medium mb-2">Step {i + 1}</div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <SparklesCore particleDensity={60} particleColor="#4F6EF7" speed={0.5} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            <Users className="w-5 h-5 text-brand-400" />
            <span className="text-sm text-muted-foreground">Trusted by developers worldwide</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-4">
            Join <span className="gradient-text">10,000+</span> developers finding their next role
          </h2>
          <p className="text-muted-foreground mb-8">
            Stop browsing 10 different job portals. HireWave brings them all together.
          </p>

          <MovingBorder as="div" containerClassName="inline-block" duration={4000}>
            <Link
              to="/jobs"
              className="flex items-center gap-2 px-8 py-4 text-white font-semibold"
            >
              Browse All Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </MovingBorder>
        </motion.div>
      </section>
    </div>
  );
}
