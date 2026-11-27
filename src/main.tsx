import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import './firebase';

// Teşhis için son hata/uyarı mesajlarını sakla (Daha Fazla → Bağlantı testi'nde gösterilir)
(() => {
  const w = window as any;
  w.__fitlifeLog = w.__fitlifeLog || [];
  const push = (level: string, args: unknown[]) => {
    try {
      const text = args.map(a => (a instanceof Error ? `${(a as any).code || ''} ${a.message}` : typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      w.__fitlifeLog.push(`${new Date().toLocaleTimeString('tr-TR')} ${level}: ${text}`.slice(0, 220));
      if (w.__fitlifeLog.length > 12) w.__fitlifeLog.shift();
    } catch { /* yoksay */ }
  };
  const origErr = console.error.bind(console);
  const origWarn = console.warn.bind(console);
  console.error = (...a: unknown[]) => { push('hata', a); origErr(...a); };
  console.warn = (...a: unknown[]) => { push('uyarı', a); origWarn(...a); };
  window.addEventListener('unhandledrejection', e => push('hata', [e.reason]));
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
