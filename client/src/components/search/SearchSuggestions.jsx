import { cn } from '@/lib/utils';

export default function SearchSuggestions({ suggestions, onSelect, visible }) {
  if (!visible || !suggestions?.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-surface-border bg-surface-card shadow-2xl z-50 overflow-hidden">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onMouseDown={() => onSelect(suggestion)}
          className={cn(
            'w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors',
            'border-b border-surface-border last:border-0'
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
