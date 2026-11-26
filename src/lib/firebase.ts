import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { app } from '../firebase';

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  // Otomatik algılama: normal ağlarda hızlı WebChannel, gerekirse long-polling
  experimentalAutoDetectLongPolling: true
});
export const auth = getAuth(app);
