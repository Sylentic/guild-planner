'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Basic skeleton placeholder for loading states
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-700/50',
        className
      )}
    />
  );
}

/**
 * Skeleton for a text line
 */
export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

/**
 * Skeleton for an avatar/profile image
 */
export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
}

/**
 * Skeleton for a card component
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-slate-800/50 rounded-xl p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-3/4" />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <SkeletonText className="w-full" />
      <SkeletonText className="w-2/3" />
    </div>
  );
}

/**
 * Skeleton for list items (e.g., member list)
 */
export function SkeletonListItem({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3', className)}>
      <SkeletonAvatar className="h-8 w-8" />
      <div className="flex-1 space-y-1">
        <SkeletonText className="w-1/3" />
        <SkeletonText className="w-1/4 h-3" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

/**
 * Skeleton for table rows
 */
export function SkeletonTableRow({ columns = 4, className }: SkeletonProps & { columns?: number }) {
  return (
    <div className={cn('flex items-center gap-4 p-3', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === 0 ? 'w-1/4' : 'flex-1'}`} 
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for profession/stat grid cells
 */
export function SkeletonGridCell({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-8 w-8', className)} />;
}

/**
 * Skeleton for a full page loading state
 */
export function SkeletonPage({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-in fade-in duration-500', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Content grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* List */}
      <div className="bg-slate-800/50 rounded-xl divide-y divide-slate-700">
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </div>
    </div>
  );
}

