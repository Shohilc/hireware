import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, BookmarkCheck, Eye, TrendingUp, Clock, Terminal, Search, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const [stats, setStats] = useState({ totalJobs: 0, totalCompanies: 0, platforms: 0 });
  const [scraping, setScraping] = useState(false);
  const [query, setQuery] = useState('react');
  const [location, setLocation] = useState('Bangalore');

  const fetchStats = () => {
    api.get('/jobs/stats').then(({ data }) => setStats(data)).catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!query || !location) {
      toast.error('Query and Location are required');
      return;
    }
    setScraping(true);
    const toastId = toast.loading(`Scraping "${query}" jobs in "${location}"...`);
    try {
      const { data } = await api.post('/jobs/scrape', { query, location });
      toast.success(data.message || 'Scrape completed!', { id: toastId });
      fetchStats(); // Update stats cards dynamically
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger scraper', { id: toastId });
    } finally {
      setScraping(false);
    }
  };

  const statCards = [
    { icon: Briefcase, label: 'Total Jobs', value: stats.totalJobs?.toLocaleString() || '0', color: 'text-brand-400', bg: 'from-brand-500/10 to-brand-700/10' },
    { icon: BookmarkCheck, label: 'Bookmarked', value: bookmarks?.length || 0, color: 'text-accent-purple', bg: 'from-accent-purple/10 to-pink-700/10' },
    { icon: Eye, label: 'Companies', value: stats.totalCompanies?.toLocaleString() || '0', color: 'text-accent-cyan', bg: 'from-accent-cyan/10 to-blue-700/10' },
    { icon: TrendingUp, label: 'Platforms', value: stats.platforms || '0', color: 'text-accent-emerald', bg: 'from-accent-emerald/10 to-green-700/10' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-1">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-muted-foreground text-sm">Here's your job search overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 card-glow"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white font-display">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent bookmarks */}
          <div className="lg:col-span-2 bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-brand-400" />
                Recent Bookmarks
              </h2>
              <Link to="/bookmarks" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
            </div>

            {bookmarks?.length > 0 ? (
              <div className="space-y-3">
                {bookmarks.slice(0, 5).map((job) => (
                  <Link
                    key={job._id}
                    to={`/jobs/${job.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-brand-400">
                      {job.company?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-900 dark:text-white font-medium truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company} • {job.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {job.type}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">No bookmarks yet</p>
                <Link to="/jobs" className="text-sm text-brand-400 hover:text-brand-300">
                  Browse jobs to start bookmarking →
                </Link>
              </div>
            )}
          </div>

          {/* Scraper Dashboard Panel */}
          <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-accent-emerald" />
                Live Job Scraper
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Run background web crawlers to discover fresh jobs and add them to the portal.
              </p>

              <form onSubmit={handleScrape} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                    <Search size={11} /> Job Title / Keyword
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Node Developer"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                    <MapPin size={11} /> Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={scraping}
                  className="w-full mt-2 bg-gradient-to-r from-brand-500 to-accent-purple hover:from-brand-600 hover:to-accent-pink disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                >
                  {scraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scraping Platforms...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4" />
                      Trigger Live Scrape
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Active Crawlers: Naukri, Indeed, Internshala</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
