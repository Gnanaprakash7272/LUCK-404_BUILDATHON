import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className={`relative bg-surface-white rounded-xl shadow-xl w-full ${maxWidth} flex flex-col max-h-[90vh] overflow-hidden transform transition-all`}>
        <div className="flex justify-between items-center p-6 border-b border-border-subtle">
          <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface">{title}</h3>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmStyle = 'danger' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-on-surface-variant font-body-md text-[14px] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-on-surface text-[14px] font-medium hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-lg text-[14px] font-medium text-white transition-colors ${
            confirmStyle === 'danger' ? 'bg-risk-high hover:bg-red-700' : 'bg-primary hover:bg-primary-fixed-variant'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
