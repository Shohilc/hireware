import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const popularSearches = [
  'React Developer', 'Full Stack', 'Data Scientist', 'DevOps Engineer',
  'UI/UX Designer', 'Machine Learning', 'Python Developer', 'Cloud Engineer',
];

export default function SearchBar({ onSearch, className, size = 'default' }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim(), location.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch?.(suggestion, location.trim());
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isLarge = size === 'large';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-2xl border transition-all duration-300',
            'bg-white dark:bg-zinc-900',
            focused
              ? 'border-brand-500/50 shadow-lg shadow-brand-500/10'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
            isLarge ? 'p-2' : 'p-1.5'
          )}
        >
          {/* Search icon */}
          <div className={cn('flex items-center gap-2 flex-1', isLarge ? 'pl-4' : 'pl-3')}>
            <Search className={cn('text-zinc-400 dark:text-zinc-500 shrink-0', isLarge ? 'w-5 h-5' : 'w-4 h-4')} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { setFocused(true); setShowSuggestions(true); }}
              onBlur={() => setFocused(false)}
              placeholder="Job title, skills, or company..."
              className={cn(
                'w-full bg-transparent border-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                isLarge ? 'text-base py-2' : 'text-sm py-1.5'
              )}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className={cn('w-px bg-zinc-200 dark:bg-zinc-800 shrink-0', isLarge ? 'h-8' : 'h-6')} />

          {/* Location */}
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <MapPin className={cn('text-zinc-400 dark:text-zinc-500 shrink-0', isLarge ? 'w-5 h-5' : 'w-4 h-4')} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className={cn(
                'w-full bg-transparent border-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                isLarge ? 'text-base py-2' : 'text-sm py-1.5'
              )}
            />
          </div>

          {/* Search button */}
          <button
            type="submit"
            className={cn(
              'shrink-0 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all duration-200',
              'shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-95',
              isLarge ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'
            )}
          >
            Search Jobs
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && !query && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50"
          >
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/5 hover:border-brand-500/30 hover:text-brand-500 hover:bg-brand-500/5 dark:hover:text-brand-400 dark:hover:bg-brand-500/10 transition-all rounded-full"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
