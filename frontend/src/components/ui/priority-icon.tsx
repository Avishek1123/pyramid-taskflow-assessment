'use client';

import { cn } from '../../lib/utils';

export type PriorityLevel = 'NONE' | 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;

function barsFilled(priority: PriorityLevel): number {
  switch (priority) {
    case 'URGENT':
      return 4;
    case 'HIGH':
      return 3;
    case 'MEDIUM':
      return 2;
    case 'LOW':
      return 1;
    default:
      return 0;
  }
}

function priorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'URGENT':
      return '#ef4444';
    case 'HIGH':
      return '#ef4444';
    case 'MEDIUM':
      return '#f97316';
    case 'LOW':
      return '#9ca3af';
    default:
      return '#d4d4d8';
  }
}

export function priorityLabel(priority: PriorityLevel): string {
  switch (priority) {
    case 'URGENT':
      return 'Urgent';
    case 'HIGH':
      return 'High';
    case 'MEDIUM':
      return 'Medium';
    case 'LOW':
      return 'Low';
    default:
      return 'No Priority';
  }
}

export function priorityTextClass(priority: PriorityLevel): string {
  switch (priority) {
    case 'URGENT':
      return 'text-[#ef4444]';
    case 'HIGH':
      return 'text-[#ef4444]';
    case 'MEDIUM':
      return 'text-[#f97316]';
    case 'LOW':
      return 'text-[#9ca3af]';
    default:
      return 'text-muted-foreground';
  }
}

interface PriorityIconProps {
  priority: PriorityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

/** Signal bars: Urgent 4, High 3, Medium 2, Low 1 — matches the design. */
export function PriorityIcon({ priority, className, size = 'sm' }: PriorityIconProps) {
  const filled = barsFilled(priority);
  const color = priorityColor(priority);
  const heights = size === 'sm' ? [5, 7, 9, 11] : [6, 9, 12, 15];
  const width = size === 'sm' ? 2 : 2.5;
  const gap = size === 'sm' ? 1.5 : 2;
  const bars = filled === 0 ? 0 : 4;

  if (filled === 0) {
    return (
      <span className={cn('inline-flex h-3.5 w-3.5 items-center justify-center', className)} aria-hidden>
        <span className="block h-[7px] w-[7px] rounded-full bg-[#d4d4d8] dark:bg-zinc-600" />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-end', className)} style={{ gap }} aria-hidden>
      {heights.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className="rounded-[1px]"
          style={{
            width,
            height: h,
            backgroundColor: i < filled ? color : 'var(--border)',
          }}
        />
      ))}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  showLabel?: boolean;
}

export function PriorityBadge({ priority, className, showLabel = true }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold',
        priorityTextClass(priority),
        className
      )}
    >
      <PriorityIcon priority={priority} />
      {showLabel && <span>{priorityLabel(priority)}</span>}
    </span>
  );
}
