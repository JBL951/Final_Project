import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const notify = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { ...toast, id };
  toasts = [...toasts, newToast];
  
  listeners.forEach(listener => listener(toasts));
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 5000);
};

const removeToast = (id: string) => {
  toasts = toasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(toasts));
};

export const toast = {
  success: (message: string, duration?: number) => notify({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => notify({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) => notify({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) => notify({ message, type: 'info', duration }),
};

export const Toaster: React.FC = () => {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-secondary-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-error-50 border-error-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'info':
        return 'bg-secondary-50 border-secondary-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg border shadow-lg animate-slide-up ${getBackgroundColor(toast.type)}`}
        >
          {getIcon(toast.type)}
          <p className="ml-3 text-sm font-medium text-gray-900">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
};