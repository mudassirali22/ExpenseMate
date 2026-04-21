import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, setCurrentPage, count, total }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-3 items-center bg-surface-lowest p-3 px-5 rounded-xl border border-glass-border mt-4 gap-4">
      <p className="text-[11px] font-semibold text-on-surface-variant text-center sm:text-left">
        Showing {count} Results
      </p>
      
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high disabled:opacity-30 border border-glass-border transition-all">
          <ChevronLeft size={15} />
        </button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            let pageNum = currentPage <= 3 ? idx + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + idx : currentPage - 2 + idx;
            if (pageNum < 1 || pageNum > totalPages) return null;
            return (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-md' : 'bg-surface-container hover:bg-surface-high text-on-surface'}`}>
                {pageNum}
              </button>
            );
          })}
        </div>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high disabled:opacity-30 border border-glass-border transition-all">
          <ChevronRight size={15} />
        </button>
      </div>

      <p className="text-[11px] font-semibold text-on-surface-variant text-center sm:text-right">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
};

export default Pagination;
