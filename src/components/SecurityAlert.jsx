import React from 'react';
import { AlertTriangle, Shield, Clock, X } from 'lucide-react';

export default function SecurityAlert({ 
  type, 
  title, 
  message, 
  countdown, 
  onClose, 
  actions 
}) {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Shield className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Shield className="w-5 h-5 text-blue-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getAlertStyles()} mb-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm mt-1">{message}</p>
          
          {countdown !== undefined && countdown > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>Try again in {countdown} seconds</span>
            </div>
          )}
          
          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}