import React from 'react';
import { XCircle } from 'lucide-react';

export default function FieldError({ error }) {
  if (!error) return null;

  return (
    <div className="flex items-start gap-1 mt-1 text-red-600 text-sm">
      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}
