import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, MapPin, Clock, Briefcase, ExternalLink, Building2, DollarSign, Eye, Users, ArrowUpRight, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobStore } from '@/store/jobStore';
import { useAuth } from '@/hooks/useAuth';
import { cn, timeAgo, formatSalary } from '@/lib/utils';
import toast from 'react-hot-toast';

const sourceColors = {
  naukri: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  indeed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  linkedin: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  internshala: 'bg-green-500/10 text-green-400 border-green-500/20',
  glassdoor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function JobDetailPage() {
  const { slug } = useParams();
  const { selectedJob: job, fetchJobBySlug, toggleBookmark } = useJobStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (slug) fetchJobBySlug(slug);
  }, [slug]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark jobs');
      return;
    }
    try {
      const result = await toggleBookmark(job._id);
      toast.success(result.bookmarked ? 'Job bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (!job) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-3xl font-bold text-brand-500 dark:text-brand-400 shrink-0">
              {job.logo ? <img src={job.logo} alt="" className="w-full h-full rounded-2xl object-cover" /> : job.company?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-2">{job.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 size={14} /> {job.company}
                </span>
                <Badge variant="outline" className={cn('text-xs', sourceColors[job.source])}>
                  via {job.source}
                </Badge>
                {job.remote && (
                  <Badge variant="outline" className="text-xs bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20">Remote</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: MapPin, label: 'Location', value: job.location || 'Not specified', color: 'text-brand-400' },
              { icon: Briefcase, label: 'Type', value: job.type, color: 'text-accent-purple' },
              { icon: DollarSign, label: 'Salary', value: formatSalary(job.salary) || 'Not disclosed', color: 'text-accent-emerald' },
              { icon: Clock, label: 'Posted', value: timeAgo(job.postedAt), color: 'text-accent-cyan' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-4 rounded-xl bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className={cn('flex items-center gap-1.5 text-xs mb-1.5', color)}>
                  <Icon size={12} /> {label}
                </div>
                <p className="text-sm text-zinc-900 dark:text-white font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-8">
            <Button variant="glow" size="lg" className="flex-1" onClick={() => window.open(job.sourceUrl, '_blank')}>
              Apply Now <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleBookmark}>
              <Bookmark size={18} fill={job.isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 size={18} />
            </Button>
          </div>

          {/* Description */}
          {job.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">About the Role</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Skills & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full border border-zinc-200 dark:border-zinc-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {job.views > 0 && <span className="flex items-center gap-1"><Eye size={12} /> {job.views} views</span>}
            {job.applicants > 0 && <span className="flex items-center gap-1"><Users size={12} /> {job.applicants} applicants</span>}
            {job.experience && <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience}</span>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
