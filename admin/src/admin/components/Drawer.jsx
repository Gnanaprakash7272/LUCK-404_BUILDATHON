import React, { useEffect } from 'react';

export const Drawer = ({ isOpen, onClose, title, children, width = "max-w-md" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className={`relative w-full ${width} bg-surface-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-left`}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-surface-container-lowest">
          <h2 className="text-[20px] font-semibold text-on-surface">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
