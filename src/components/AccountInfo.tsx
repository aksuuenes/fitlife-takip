import React, { useState } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db, firestoreCacheMode } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${ms / 1000} sn içinde yanıt yok`)), ms))]);

/** Hangi hesap/profilde olunduğunu gösteren satır + bağlantı testi. */
export default function AccountInfo({ className = '' }: { className?: string }) {
  const { user, currentProfile, profileLoadError } = useAuth();
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);

  if (!user) {
    return <p className={`text-[11px] font-semibold text-slate-500 dark:text-slate-400 ${className}`}>Misafir · veriler sadece bu cihazda</p>;
  }

  const providers = user.providerData.map(p => (p.providerId === 'google.com' ? 'Google' : p.providerId === 'password' ? 'E-posta' : p.providerId)).join(', ') || 'bilinmiyor';
  const email = user.email || user.providerData.find(p => p.email)?.email || 'e-posta yok';

  const runTest = async () => {
    setBusy(true);
    const out: string[] = [`Önbellek: ${firestoreCacheMode === 'memory' ? 'kapalı (telefon)' : 'açık'} · Çevrimiçi: ${navigator.onLine ? 'evet' : 'hayır'}`];
    // 1) Giriş anahtarı
    let token = '';
    try {
      const t0 = performance.now();
      token = await withTimeout(user.getIdToken(), 10000);
      out.push(`Giriş anahtarı: tamam (${Math.round(performance.now() - t0)} ms)`);
    } catch (e: any) {
      out.push(`Giriş anahtarı: HATA ${e?.code || ''} ${e?.message || e}`);
    }
    // 2) Doğrudan sunucu (Firebase kütüphanesi olmadan)
    if (token) {
      try {
        const t0 = performance.now();
        const r = await withTimeout(fetch(`https://firestore.googleapis.com/v1/projects/fitlife-5cc6c/databases/(default)/documents/users/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
        }), 10000);
        out.push(`Sunucu (doğrudan): ${r.status === 200 ? 'tamam' : 'HATA ' + r.status} (${Math.round(performance.now() - t0)} ms)`);
      } catch (e: any) {
        out.push(`Sunucu (doğrudan): HATA ${e?.message || e}`);
      }
    }
    // 3) Firebase kütüphanesi ile
    try {
      const t0 = performance.now();
      const snap = await withTimeout(getDocFromServer(doc(db, 'users', user.uid)), 12000);
      out.push(`Sunucu (uygulama): ${snap.exists() ? 'tamam' : 'belge yok'} (${Math.round(performance.now() - t0)} ms)`);
    } catch (e: any) {
      out.push(`Sunucu (uygulama): HATA ${e?.code || ''} ${e?.message || e}`);
    }
    const log: string[] = (window as any).__fitlifeLog || [];
    if (log.length) out.push('— Son mesajlar —', ...log.slice(-6));
    setResults(out);
    setBusy(false);
  };

  return (
    <div className={`text-center space-y-0.5 ${className}`}>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 break-all">{email}</p>
      <p className="text-[10px] font-medium text-slate-400">
        Giriş: {providers} · Hesap no: {user.uid.slice(0, 6)} · Profil: {currentProfile?.name || 'yükleniyor…'}
      </p>
      {profileLoadError && !currentProfile && (
        <p className="pt-1 text-[10px] font-semibold text-rose-500 break-words">Profil okunamadı: {profileLoadError}</p>
      )}
      <div className="pt-1.5 flex justify-center gap-2">
        <button onClick={runTest} disabled={busy}
          className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50">
          {busy ? 'Deneniyor…' : 'Bağlantı testi'}
        </button>
      </div>
      {results && (
        <div className="mt-2 text-left text-[10px] font-mono leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 rounded-lg p-2 break-words">
          {results.map((r, i) => <div key={i}>{r}</div>)}
        </div>
      )}
    </div>
  );
}
