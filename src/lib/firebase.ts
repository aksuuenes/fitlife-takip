import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from 'firebase/firestore';
import { app } from '../firebase';

// iPhone ana ekran uygulamasında Firestore'un yerel veritabanı (IndexedDB) kilitli kalabiliyor;
// o zaman bütün okumalar sessizce bekliyor (telefonda profil/veriler hiç gelmiyordu).
// Bu yüzden orada yerel veritabanı kullanılmıyor, veriler her zaman sunucudan okunuyor.
const isStandalone = typeof window !== 'undefined' && (
  window.matchMedia?.('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
);
const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

export const firestoreCacheMode = isStandalone || isIOS ? 'memory' : 'persistent';

export const db = initializeFirestore(app, {
  localCache: firestoreCacheMode === 'memory'
    ? memoryLocalCache()
    // Masaüstünde birden fazla sekme açıkken de kilitlenmesin
    : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  // iPhone Safari'de WebChannel bağlantısı takılabiliyor; long-polling her yerde güvenilir çalışıyor.
  experimentalForceLongPolling: true,
});
export const auth = getAuth(app);
