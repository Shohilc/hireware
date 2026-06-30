import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MovingBorder({
  children,
  duration = 3000,
  className,
  containerClassName,
  borderClassName,
  as: Component = 'button',
  ...props
}) {
  return (
    <Component
      className={cn(
        'relative p-[1px] overflow-hidden rounded-xl bg-transparent',
        containerClassName
      )}
      {...props}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{ padding: '1.5px' }}
      >
        <motion.div
          className={cn(
            'absolute inset-[-100%] rounded-xl',
            borderClassName
          )}
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, #4F6EF7 10%, #A855F7 20%, #EC4899 30%, transparent 40%)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div
        className={cn(
          'relative rounded-[11px] bg-surface-card z-10',
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
}
