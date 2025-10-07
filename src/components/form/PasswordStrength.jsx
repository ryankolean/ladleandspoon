import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function PasswordStrength({ strength, password }) {
  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength) {
      case 'strong':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'strong':
        return 'Strong password';
      case 'medium':
        return 'Medium strength';
      default:
        return 'Weak password';
    }
  };

  const getStrengthIcon = () => {
    switch (strength) {
      case 'strong':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex items-center gap-1 mt-1 text-sm ${getStrengthColor()}`}>
      {getStrengthIcon()}
      <span className="font-medium">{getStrengthText()}</span>
    </div>
  );
}
