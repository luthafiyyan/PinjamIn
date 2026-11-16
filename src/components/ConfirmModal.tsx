import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  icon?: string;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  initialInputValue?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  icon,
  showInput = false,
  inputLabel,
  inputPlaceholder = 'Ketik keterangan di sini...',
  inputRequired = false,
  initialInputValue = '',
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState(initialInputValue);
  const [inputError, setInputError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialInputValue);
      setInputError(null);
      if (showInput) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, initialInputValue, showInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isLoading) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showInput && inputRequired && !inputValue.trim()) {
      setInputError(inputLabel ? `${inputLabel} wajib diisi.` : 'Keterangan wajib diisi.');
      return;
    }
    onConfirm(showInput ? inputValue.trim() : undefined);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs',
          defaultIcon: 'Trash',
          confirmBtn:
            'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-200',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-200 shadow-xs',
          defaultIcon: 'ExclamationTriangle',
          confirmBtn:
            'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm shadow-amber-200',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs',
          defaultIcon: 'CheckCircle',
          confirmBtn:
            'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-200',
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs',
          defaultIcon: 'InfoCircle',
          confirmBtn:
            'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200',
        };
    }
  };

  const styles = getVariantStyles();
  const iconName = icon || styles.defaultIcon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconBg}`}
            >
              <Icon name={iconName} size={24} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                id="confirm-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
              >
                {title}
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed break-words whitespace-pre-line">
                {message}
              </div>
            </div>
          </div>

          {showInput && (
            <div className="pt-2">
              {inputLabel && (
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {inputLabel} {inputRequired && <span className="text-rose-500">*</span>}
                </label>
              )}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder={inputPlaceholder}
                rows={3}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-base sm:text-xs leading-relaxed text-slate-800 placeholder-slate-400 bg-slate-50/50"
              />
              {inputError && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{inputError}</p>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 safe-area-pb">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto min-h-[44px] px-5 py-2.5 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${styles.confirmBtn}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>{confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
