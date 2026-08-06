import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral',
}) => {
  return (
    <div className="card-enterprise flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          {title}
        </span>
        <div className="w-10 h-10 rounded-lg bg-[#F5F5F3] flex items-center justify-center text-[#146C43]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold text-[#18181B] tracking-tight">{value}</div>
        {subtitle && (
          <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={`font-semibold ${
                  trendType === 'positive'
                    ? 'text-[#2E7D32]'
                    : trendType === 'negative'
                    ? 'text-[#DC2626]'
                    : 'text-[#6B7280]'
                }`}
              >
                {trend}
              </span>
            )}
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};
