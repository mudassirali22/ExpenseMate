import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, variant = 'default' }) => {
  React.useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -15 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          className="relative w-full max-w-md bg-surface-bright rounded-3xl shadow-2xl overflow-hidden border border-glass-border flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-surface-lowest px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-lg font-bold text-on-surface tracking-tight">{title}</h2>
              {subtitle ? (
                 <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">{subtitle}</p>
              ) : (
                 <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/60 font-black">System Dialog</p>
              )}
            </div>
            <button
               onClick={onClose}
               className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all"
            >
               <X size={18} />
            </button>
          </div>

          <div className="p-6 text-on-surface text-sm leading-relaxed overflow-y-auto overflow-x-hidden relative">
            {children}
            {footer && (
              <div className="flex gap-3 pt-5 mt-3 shrink-0">
                {footer}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
