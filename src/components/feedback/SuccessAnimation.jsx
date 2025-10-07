import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuccessAnimation({ message, subMessage, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center animate-in zoom-in duration-500',
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping" />
        <CheckCircle2 className="relative w-16 h-16 text-green-600 animate-in zoom-in duration-300" />
      </div>

      {message && (
        <h3 className="mt-4 text-xl font-bold text-gray-900 animate-in slide-in-from-bottom-2 duration-500 delay-150">
          {message}
        </h3>
      )}

      {subMessage && (
        <p className="mt-2 text-gray-600 animate-in slide-in-from-bottom-2 duration-500 delay-300">
          {subMessage}
        </p>
      )}
    </div>
  );
}

export function InlineSuccess({ message, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-green-700 animate-in slide-in-from-left duration-300',
        className
      )}
    >
      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function SuccessCard({ title, message, actions, className }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg p-6 border border-green-100 animate-in zoom-in duration-500',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping" />
          <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {title && (
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {title}
          </h2>
        )}

        {message && (
          <p className="mt-2 text-gray-600">
            {message}
          </p>
        )}

        {actions && (
          <div className="mt-6 flex gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
