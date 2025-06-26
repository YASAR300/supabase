import React from 'react';
import { getPasswordStrength } from '../utils/validation';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PasswordStrengthIndicator({ password, show }) {
  if (!show || !password) return null;

  const { score, feedback } = getPasswordStrength(password);
  
  const getStrengthColor = (score) => {
    if (score <= 2) return 'text-red-600 bg-red-100';
    if (score <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthIcon = (score) => {
    if (score <= 2) return <AlertTriangle className="w-4 h-4" />;
    if (score <= 4) return <Shield className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        {getStrengthIcon(score)}
        <span className={`text-sm font-medium px-2 py-1 rounded ${getStrengthColor(score)}`}>
          Password Strength: {getStrengthText(score)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            score <= 2 ? 'bg-red-500' : score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${(score / 6) * 100}%` }}
        ></div>
      </div>

      {feedback.length > 0 && (
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Suggestions:</p>
          <ul className="list-disc list-inside space-y-1">
            {feedback.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}