import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200/70 shadow-xs">
              <Icon name="ExclamationTriangle" size={32} />
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Terjadi Kendala Teknis
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Aplikasi mengalami masalah saat memproses tampilan. Silakan muat ulang halaman atau hubungi petugas laboratorium jika kendala berlanjut.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left mb-6 overflow-hidden">
                <p className="font-mono text-[11px] text-slate-700 truncate">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full min-h-[44px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Icon name="ArrowClockwise" size={16} />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              >
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
