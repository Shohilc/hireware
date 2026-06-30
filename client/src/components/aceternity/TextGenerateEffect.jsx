import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function TextGenerateEffect({ words, className, speed = 0.05 }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const wordArray = words.split(' ');

  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= wordArray.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [words, wordArray.length]);

  return (
    <div className={cn('font-display', className)}>
      {wordArray.slice(0, visibleCount).map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
