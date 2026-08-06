import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['APPROVED', 'AVAILABLE', 'ACTIVE', 'COMPANY'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (['PENDING', 'RESERVED', 'ASSIGNED', 'RENTAL'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (['REJECTED', 'INACTIVE', 'CANCELLED'].includes(normalized)) {
    styles = 'bg-red-50 text-red-800 border-red-200';
  } else if (['MAINTENANCE', 'COMPLETED', 'IN_TRANSFER', 'TRANSFERRED', 'ON_LEAVE'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-800 border-blue-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles} ${className}`}
    >
      {status}
    </span>
  );
};
