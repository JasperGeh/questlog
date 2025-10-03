'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'loading':
        return '⏳';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-[#3f5a45] border-[#4f7259]';
      case 'error':
        return 'bg-[#5a3f3f] border-[#724f4f]';
      case 'loading':
        return 'bg-[#3d3554] border-[#4d4467]';
      case 'info':
      default:
        return 'bg-[#2a233c] border-[#3d3554]';
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-md border-2 ${getStyles()} text-[#e6e1f0] shadow-lg animate-slide-up max-w-md`}
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <p className="font-serif italic">{message}</p>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="ml-auto text-xl hover:text-gray-400 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
