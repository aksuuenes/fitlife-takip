import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X, CheckCircle2 } from 'lucide-react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker Registered');
    },
    onRegisterError(error) {
      console.log('Service Worker registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-5 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl shadow-2xl flex flex-col gap-3 max-w-sm w-full sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          {needRefresh ? (
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-4 h-4 animate-spin-slow" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
            {offlineReady ? 'Çevrimdışı Mod Hazır' : 'Yeni Sürüm Mevcut!'}
          </h3>
        </div>
        <button 
          onClick={close} 
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-1.5 rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-10 leading-relaxed">
        {offlineReady 
          ? 'Uygulama artık internet bağlantısı olmadan da tam performansla kullanılabilir.' 
          : 'Uygulamanın arayüzünde veya altyapısında yeni güncellemeler yapıldı. Yenilikleri görmek için şimdi yenileyin.'}
      </p>
      
      {needRefresh && (
        <div className="pl-10 mt-1">
          <button 
            onClick={() => updateServiceWorker(true)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Uygulamayı Güncelle
          </button>
        </div>
      )}
    </div>
  );
}
