import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable StatCard component for dashboard metrics.
 */
const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendIcon: TrendIcon, 
  trendColorClass = 'text-success bg-success/10',
  className = '',
  children
}) => {
  return (
    <div className={`stat-card relative overflow-hidden flex flex-col justify-between transition-colors !p-5 ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="stat-label mb-0">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center opacity-80`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-3 mt-1">
        <h4 className="text-xl sm:text-2xl font-bold text-on-surface">{value}</h4>
        {trend && (
          <div className={`flex items-center font-bold text-[10px] px-2 py-1 rounded-md mb-1 ${trendColorClass}`}>
            {TrendIcon && <TrendIcon size={12} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

export default StatCard;
