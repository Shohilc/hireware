import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn, timeAgo, formatSalary } from '@/lib/utils';

const sourceColors = {
  naukri: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
  indeed: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20',
  linkedin: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20',
  internshala: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20',
  glassdoor: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
};

export default function JobCard({ job, onBookmark, isBookmarked, onClick }) {
  const isSaved = isBookmarked || job.isBookmarked;

  return (
    <div
      onClick={() => onClick?.(job)}
      className="job-card group bg-card dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-card p-6 transition-all duration-300 ease-smooth cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700/80 relative"
    >
      {/* Top row: logo + save button */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-lg font-bold text-zinc-600 dark:text-zinc-300">
                {job.company?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          {job.source && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
              sourceColors[job.source.toLowerCase()] || "bg-zinc-50 dark:bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-500/20"
            )}>
              {job.source}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(job._id);
          }}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-pill border transition-colors',
            isSaved
              ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          )}
        >
          {isSaved ? (
            <BookmarkCheck size={13} className="fill-current" />
          ) : (
            <Bookmark size={13} />
          )}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Company + posted date */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-semibold text-base text-zinc-800 dark:text-zinc-200">{job.company}</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{timeAgo(job.postedAt)}</span>
      </div>

      {/* Role title */}
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 leading-snug group-hover:text-brand-500 transition-colors duration-300">
        {job.title}
      </h3>

      {/* Description snippet */}
      {job.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {job.tags && job.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-3 py-1.5 rounded-pill bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          >
            {tag}
          </span>
        ))}
        {job.remote && (
          <span className="text-xs font-medium px-3 py-1.5 rounded-pill bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
            Remote
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-end justify-between">
        <div>
          <p className="font-bold text-base text-zinc-900 dark:text-white">
            {formatSalary(job.salary) || 'Salary N/A'}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{job.location}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(job);
          }}
          className="px-5 py-2.5 rounded-btn bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:opacity-85 transition-opacity"
        >
          Apply now
        </button>
      </div>
    </div>
  );
}
