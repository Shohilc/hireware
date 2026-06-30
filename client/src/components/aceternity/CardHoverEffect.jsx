import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CardHoverEffect({ items, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {hoveredIndex === idx && (
            <motion.span
              className="absolute inset-0 h-full w-full bg-brand-500/10 block rounded-2xl"
              layoutId="hoverBackground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
            />
          )}
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                'bg-gradient-to-br',
                item.gradient || 'from-brand-500/20 to-accent-purple/20',
                'text-brand-600 dark:text-brand-400'
              )}>
                {item.icon}
              </div>
              {item.count && (
                <span className="ml-auto text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-full border border-zinc-200/50 dark:border-transparent">
                  {item.count}
                </span>
              )}
            </div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </div>
      ))}
    </div>
  );
}

function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl h-full w-full p-5 overflow-hidden',
        'bg-card border border-zinc-200 dark:border-zinc-800/80 dark:bg-zinc-900',
        'group-hover:border-brand-500/30 dark:group-hover:border-brand-500/30 transition-all duration-300',
        'relative z-20',
        className
      )}
    >
      <div className="relative z-50">{children}</div>
    </div>
  );
}

function CardTitle({ className, children }) {
  return (
    <h4 className={cn('text-zinc-900 dark:text-white font-bold tracking-tight text-sm mb-1.5', className)}>
      {children}
    </h4>
  );
}

function CardDescription({ className, children }) {
  return (
    <p className={cn('text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed', className)}>
      {children}
    </p>
  );
}
