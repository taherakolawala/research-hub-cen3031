import type { ApplicationStatus } from '../types';

const statusColors: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  reviewing: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-100 text-slate-500',
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        statusColors[status] || 'bg-slate-100 text-slate-800'
      }`}
    >
      {status}
    </span>
  );
}
