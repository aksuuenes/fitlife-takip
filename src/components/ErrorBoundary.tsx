// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Bilinmeyen bir uygulama hatası (Error Boundary):', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl shadow-xl max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Beklenmeyen Bir Hata Oluştu
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Sistemi çalıştırırken geçici bir sorunla karşılaştık. Çevrimdışıysanız veya bağlantınız yavaşsa bu durum normal olabilir.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 dark:hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Sayfayı Yenile ve Kurtar
            </button>
            
            {this.state.error && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-auto border border-slate-100 dark:border-slate-800">
                 <p className="text-[10px] font-mono text-slate-400 text-left truncate">
                    {this.state.error.message}
                 </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
