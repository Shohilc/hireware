import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Cpu,
  Layers,
  Users,
  Activity,
  Terminal,
  Loader2,
  Clock,
  Database,
  HardDrive,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { useAuth } from '@/hooks/useAuth';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    diagnostics,
    scraperMetrics,
    users,
    isLoading,
    fetchDiagnostics,
    fetchScraperMetrics,
    fetchUsersList,
  } = useAdminStore();

  // Route security guard: only allow admin users
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    } else {
      fetchDiagnostics();
      fetchScraperMetrics();
      fetchUsersList();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-page dark:bg-page-dark transition-colors duration-500 ease-smooth">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            System Control Center
          </h1>
          <p className="text-muted-foreground text-sm">Monitor system performance, scrapers activity, and database users</p>
        </div>

        {/* Diagnostics & Stats Loader */}
        {isLoading && !diagnostics ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* System Diagnostics Card */}
              <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 card-glow">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-400" />
                  Node Server Status
                </h3>
                {diagnostics && (
                  <div className="space-y-3.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Server Uptime</span>
                      <span className="text-zinc-900 dark:text-white font-medium flex items-center gap-1">
                        <Clock size={11} /> {formatUptime(diagnostics.uptime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>RAM Utilization</span>
                      <span className="text-zinc-900 dark:text-white font-medium flex items-center gap-1">
                        <HardDrive size={11} /> {diagnostics.processMemory} MB / {diagnostics.totalMemory} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Platform</span>
                      <span className="text-zinc-900 dark:text-white font-medium capitalize">{diagnostics.platform} ({diagnostics.nodeVersion})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Engine</span>
                      <span className="text-accent-cyan font-semibold flex items-center gap-1">
                        <Database size={11} /> {diagnostics.dbMode}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scraper Performance Card */}
              <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 card-glow">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent-emerald" />
                  Crawler Metrics
                </h3>
                {scraperMetrics && (
                  <div className="space-y-3.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Active Listings</span>
                      <span className="text-zinc-900 dark:text-white font-medium">{scraperMetrics.totalJobs} jobs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Crawler Trigger</span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {scraperMetrics.lastScraped && new Date(scraperMetrics.lastScraped).getTime() > 0
                          ? new Date(scraperMetrics.lastScraped).toLocaleTimeString()
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scraped Platforms</span>
                      <div className="flex gap-1.5">
                        {scraperMetrics.sources?.map((s) => (
                          <span key={s.name} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-[9px] uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-200">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Crawler Loaders</span>
                      <span className="text-accent-emerald font-semibold flex items-center gap-1">
                        <Activity size={11} className="animate-pulse" /> Live & Online
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* User Overview Stats Card */}
              <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 card-glow">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent-purple" />
                  Database Registrations
                </h3>
                <div className="space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Total Members</span>
                    <span className="text-zinc-900 dark:text-white font-medium">{users.length} registered</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Administrators</span>
                    <span className="text-red-400 font-semibold">{users.filter((u) => u.role === 'admin').length} active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bookmarks Count</span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {users.reduce((sum, u) => sum + (u.bookmarksCount || 0), 0)} saved
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Verification</span>
                    <span className="text-accent-purple font-semibold flex items-center gap-1">
                      <UserCheck size={11} /> Passport OAuth
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Users Table */}
            <div className="bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 overflow-hidden">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                Registered User Management
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-muted-foreground pb-2 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Bookmarks</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">{item.name}</td>
                        <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                          <Mail size={11} className="text-zinc-400 dark:text-white/40" />
                          {item.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.role === 'admin' ? 'bg-red-400/10 text-red-400' : 'bg-zinc-100 dark:bg-white/5 text-muted-foreground text-zinc-600 dark:text-muted-foreground'
                            }`}
                          >
                            {item.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-zinc-900 dark:text-white">{item.bookmarksCount}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
