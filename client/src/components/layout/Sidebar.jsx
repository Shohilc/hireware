import { motion } from 'framer-motion';
import { X, RotateCcw, MapPin, Briefcase, Globe, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const sources = ['naukri', 'indeed', 'internshala', 'linkedin', 'glassdoor'];
const experiences = ['Fresher', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Remote'];

export default function Sidebar({ isOpen, onClose }) {
  const filters = useFilterStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <motion.aside
        className={cn(
          'w-72 bg-white dark:bg-zinc-950 overflow-y-auto transition-all duration-500 ease-smooth',
          'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:border-r lg:border-zinc-200 lg:dark:border-zinc-800 lg:z-0 lg:translate-x-0 lg:shadow-none',
          'fixed top-0 left-0 h-full z-50 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-500" />
              Filters
              {filters.getActiveCount() > 0 && (
                <span className="bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {filters.getActiveCount()}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1">
              {filters.getActiveCount() > 0 && (
                <button
                  type="button"
                  onClick={filters.clearFilters}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Location */}
          <FilterSection title="Location" icon={MapPin}>
            <div className="space-y-1.5">
              {locations.map((loc) => (
                <FilterChip
                  key={loc}
                  label={loc}
                  active={filters.location === loc}
                  onClick={() => filters.setFilter('location', filters.location === loc ? '' : loc)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Job Type */}
          <FilterSection title="Job Type" icon={Briefcase}>
            <div className="space-y-1.5">
              {jobTypes.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  active={filters.type === type}
                  onClick={() => filters.setFilter('type', filters.type === type ? '' : type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Source Platform */}
          <FilterSection title="Source" icon={Globe}>
            <div className="space-y-1.5">
              {sources.map((src) => (
                <FilterChip
                  key={src}
                  label={src.charAt(0).toUpperCase() + src.slice(1)}
                  active={filters.source === src}
                  onClick={() => filters.setFilter('source', filters.source === src ? '' : src)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Experience */}
          <FilterSection title="Experience" icon={Clock}>
            <div className="space-y-1.5">
              {experiences.map((exp) => (
                <FilterChip
                  key={exp}
                  label={exp}
                  active={filters.experience === exp}
                  onClick={() => filters.setFilter('experience', filters.experience === exp ? '' : exp)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Remote Toggle */}
          <div className="mt-6 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-brand-500/20 transition-all duration-300">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Remote Only</span>
              <div
                onClick={() => filters.setFilter('remote', !filters.remote)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors cursor-pointer relative',
                  filters.remote ? 'bg-brand-500' : 'bg-zinc-200 dark:bg-zinc-800'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
                    filters.remote ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </label>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function FilterSection({ title, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
        active
          ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500/30 font-semibold'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent'
      )}
    >
      {label}
    </button>
  );
}
