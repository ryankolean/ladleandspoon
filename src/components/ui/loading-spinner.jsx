import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ size = 'default', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-current',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function FormLoadingSpinner({ message = 'Processing...' }) {
  return (
    <div className="flex items-center justify-center gap-2 text-gray-600">
      <LoadingSpinner size="default" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function InlineSpinner({ className }) {
  return (
    <LoadingSpinner
      size="sm"
      className={cn('inline-block', className)}
    />
  );
}

export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4 text-orange-600" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
