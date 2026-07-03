import { motion } from 'framer-motion';
import { Bookmark, MapPin, Clock, Briefcase, Building2, DollarSign, Eye, Users, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn, timeAgo, formatSalary } from '@/lib/utils';

const sourceColors = {
  naukri: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  indeed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  linkedin: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  internshala: 'bg-green-500/10 text-green-400 border-green-500/20',
  glassdoor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function JobDetail({ job, open, onClose, onBookmark }) {
  if (!job) return null;

  const handleApply = () => {
    window.open(job.sourceUrl, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* Header */}
      <SheetHeader>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-2xl font-bold text-brand-500 shrink-0">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
            ) : (
              job.company?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-xl leading-tight mb-1 text-zinc-900 dark:text-white font-bold">{job.title}</SheetTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Building2 size={14} />
                {job.company}
              </span>
              <Badge variant="outline" className={cn('text-xs', sourceColors[job.source])}>
                {job.source}
              </Badge>
              {job.remote && (
                <Badge variant="outline" className="text-xs bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20">
                  Remote
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* Meta cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: MapPin, label: 'Location', value: job.location || 'Not specified', color: 'text-brand-500 dark:text-brand-400' },
          { icon: Briefcase, label: 'Type', value: job.type, color: 'text-accent-purple' },
          { icon: DollarSign, label: 'Salary', value: formatSalary(job.salary) || 'Not disclosed', color: 'text-accent-emerald' },
          { icon: Clock, label: 'Posted', value: timeAgo(job.postedAt), color: 'text-accent-cyan' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
            <div className={cn('flex items-center gap-1.5 text-xs mb-1 font-semibold', color)}>
              <Icon size={12} />
              {label}
            </div>
            <p className="text-sm text-zinc-900 dark:text-zinc-100 font-bold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
        {job.views > 0 && (
          <span className="flex items-center gap-1">
            <Eye size={12} /> {job.views} views
          </span>
        )}
        {job.applicants > 0 && (
          <span className="flex items-center gap-1">
            <Users size={12} /> {job.applicants} applicants
          </span>
        )}
        {job.experience && (
          <span className="flex items-center gap-1">
            <Briefcase size={12} /> {job.experience}
          </span>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Description</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Requirements</h4>
          <ul className="space-y-1.5">
            {job.requirements.map((req, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Skills & Tags</h4>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-zinc-100 border border-zinc-200 text-zinc-600 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          variant="glow"
          size="lg"
          className="flex-1"
          onClick={handleApply}
        >
          Apply Now
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => onBookmark?.(job._id)}
          className={cn(
            job.isBookmarked && 'text-brand-500 border-brand-500/30 bg-brand-500/5'
          )}
        >
          <Bookmark size={18} fill={job.isBookmarked ? 'currentColor' : 'none'} />
        </Button>
      </div>
    </Sheet>
  );
}
