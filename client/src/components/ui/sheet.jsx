import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function Sheet({ open, onOpenChange, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {createPortal(
            <div className="fixed inset-0 z-50">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => onOpenChange?.(false)}
              />
              {/* Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-lg border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-2xl overflow-y-auto transition-all duration-500 ease-smooth"
              >
                <button
                  type="button"
                  onClick={() => onOpenChange?.(false)}
                  className="absolute right-4 top-4 z-10 rounded-lg p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="p-6 pt-14">
                  {children}
                </div>
              </motion.div>
            </div>,
            document.body
          )}
        </>
      )}
    </AnimatePresence>
  );
}

function SheetHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-2 mb-6", className)} {...props} />;
}

function SheetTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-bold text-zinc-900 dark:text-white", className)} {...props} />;
}

function SheetDescription({ className, ...props }) {
  return <p className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)} {...props} />;
}

export { Sheet, SheetHeader, SheetTitle, SheetDescription };
