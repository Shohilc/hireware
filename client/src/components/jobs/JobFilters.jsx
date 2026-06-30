import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: '-postedAt', label: 'Newest' },
  { value: 'postedAt', label: 'Oldest' },
  { value: '-views', label: 'Most Viewed' },
];

const sourceFilters = [
  { value: '', label: 'All' },
  { value: 'naukri', label: 'Naukri' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'internshala', label: 'Internshala' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export default function JobFilters({ total }) {
  const { sort, source, setFilter } = useFilterStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Result count */}
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {total != null ? (
            <>
              Showing <span className="text-zinc-900 dark:text-white font-semibold">{total.toLocaleString()}</span> jobs
            </>
          ) : (
            'Loading jobs...'
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Source tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 transition-all duration-300">
          {sourceFilters.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter('source', opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
                source === opt.value
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-brand-500/15 dark:text-brand-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => setFilter('sort', e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer transition-all duration-300"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
