import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600'
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle2,
    iconColor: 'text-green-600'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600'
  }
};

export default function FormAlert({
  variant = 'error',
  message,
  onClose,
  className,
  showIcon = true,
  title
}) {
  if (!message) return null;

  const config = alertVariants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 px-4 py-3 rounded-lg border animate-in slide-in-from-top-2 duration-300',
        config.container,
        className
      )}
      role="alert"
    >
      {showIcon && (
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      )}

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm">{message}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function ErrorAlert({ message, onClose, className }) {
  return (
    <FormAlert
      variant="error"
      message={message}
      onClose={onClose}
      className={className}
    />
  );
}

export function SuccessAlert({ message, onClose, className }) {
  return (
    <FormAlert
      variant="success"
      message={message}
      onClose={onClose}
      className={className}
    />
  );
}

export function WarningAlert({ message, onClose, className }) {
  return (
    <FormAlert
      variant="warning"
      message={message}
      onClose={onClose}
      className={className}
    />
  );
}

export function InfoAlert({ message, onClose, className }) {
  return (
    <FormAlert
      variant="info"
      message={message}
      onClose={onClose}
      className={className}
    />
  );
}
