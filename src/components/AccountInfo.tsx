import React, { useState } from 'react';
import { terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

/** Hangi hesap/profilde olunduğunu ve profil okunamıyorsa hatayı gösteren küçük bilgi satırı. */
export default function AccountInfo({ className = '' }: { className?: string }) {
  const { user, currentProfile, profileLoadError } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <p className={`text-[11px] font-semibold text-slate-500 dark:text-slate-400 ${className}`}>Misafir · veriler sadece bu cihazda</p>;
  }

  const providers = user.providerData.map(p => (p.providerId === 'google.com' ? 'Google' : p.providerId === 'password' ? 'E-posta' : p.providerId)).join(', ') || 'bilinmiyor';
  const email = user.email || user.providerData.find(p => p.email)?.email || 'e-posta yok';

  const resetCache = async () => {
    setBusy(true);
    try {
      await terminate(db);
      await clearIndexedDbPersistence(db);
    } catch (e) {
      console.error('Önbellek temizlenemedi:', e);
    }
    window.location.reload();
  };

  return (
    <div className={`text-center space-y-0.5 ${className}`}>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 break-all">{email}</p>
      <p className="text-[10px] font-medium text-slate-400">
        Giriş: {providers} · Hesap no: {user.uid.slice(0, 6)} · Profil: {currentProfile?.name || 'yükleniyor…'}
      </p>
      {profileLoadError && !currentProfile && (
        <div className="pt-1 space-y-1.5">
          <p className="text-[10px] font-semibold text-rose-500 break-words">Profil okunamadı: {profileLoadError}</p>
          <button onClick={resetCache} disabled={busy}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50">
            {busy ? 'Yenileniyor…' : 'Verileri yeniden yükle'}
          </button>
        </div>
      )}
    </div>
  );
}
