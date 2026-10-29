import React from 'react';
import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const LoadingSpinner = ({
  size = 'md',
  message = null,
  fullScreen = false,
  className = '',
}) => {
  const spinnerSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${spinnerSize} animate-spin text-teal-700`} />
      {message && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-6 shadow-xl flex flex-col items-center">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-12">
      {content}
    </div>
  );
};

export default LoadingSpinner;
