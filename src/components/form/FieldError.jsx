import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FieldError({ error, className }) {
  if (!error) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-1.5 mt-1.5 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span className="font-medium">{error}</span>
    </div>
  );
}
