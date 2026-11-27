import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { app } from '../firebase';

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  // iPhone Safari / ana ekran uygulamasında WebChannel bağlantısı takılabiliyor; long-polling her yerde güvenilir çalışıyor.
  // (Otomatik algılamaya geçince telefonda profil hiç yüklenmedi — geri alındı.)
  experimentalForceLongPolling: true
});
export const auth = getAuth(app);
