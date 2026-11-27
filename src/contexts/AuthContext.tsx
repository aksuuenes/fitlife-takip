import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, SubProfile } from '../types/index';
import { sanitizeData } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  activeProfileId: string | null;
  currentProfile: SubProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateActiveSubProfile: (data: Partial<SubProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchProfile: (id: string) => Promise<void>;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentProfile = profile?.profiles?.find(p => p.id === activeProfileId) || null;

  useEffect(() => {
    const savedProfileId = localStorage.getItem('activeProfileId');
    if (savedProfileId) {
      setActiveProfileId(savedProfileId);
    }

    const fallbackTimer = setTimeout(() => {
      console.warn("Firebase Auth timeout. Forcing loading to false.");
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        // Asenkron Firestore isteğini beklemeden UI yükleme ekranını kaldıralım.
        // Böylece Firebase veya internet bağlantısı yavaş olduğunda kullanıcı 6 saniye boş ekranda beklemez.
        setLoading(false);
        clearTimeout(fallbackTimer);

        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const cacheKey = `fitlife_user_profile_${user.uid}`;

          // Profili uygula ve aktif profili seç
          const applyProfile = (data: UserProfile) => {
            setProfile(data);
            try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* yoksay */ }
            const savedId = localStorage.getItem('activeProfileId') || data.activeProfileId;
            const isValidId = !!data.profiles?.some(p => p.id === savedId);
            if (isValidId && savedId) {
              setActiveProfileId(savedId);
            } else if (data.profiles && data.profiles.length > 0) {
              const firstId = data.profiles[0].id;
              setActiveProfileId(firstId);
              localStorage.setItem('activeProfileId', firstId);
            }
          };

          // 1) Telefondaki son bilinen profili hemen göster (yavaş bağlantıda boş ekran olmasın)
          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) applyProfile(JSON.parse(cached) as UserProfile);
          } catch { /* yoksay */ }

          // 2) Sunucudan oku. ÖNEMLİ: okuma başarısız olursa ya da zaman aşımına uğrarsa profil
          //    ASLA yeniden oluşturulmaz/üzerine yazılmaz; sadece tekrar denenir.
          //    (Eskiden 4 sn zaman aşımında boş profil yazılıyor, kullanıcının bilgileri sıfırlanıyordu.)
          const loadRemote = async (attempt = 0): Promise<void> => {
            try {
              const snap = await getDoc(docRef);
              const fromServer = !snap.metadata.fromCache;
              if (snap.exists()) {
                const data = snap.data() as UserProfile;
                if (!data.profiles || data.profiles.length === 0) {
                  data.profiles = [{
                    id: 'main',
                    name: data.displayName || 'Asıl Profil',
                    createdAt: new Date().toISOString(),
                    initialHeight: data.initialHeight,
                    initialWeight: data.initialWeight,
                  }];
                  data.activeProfileId = 'main';
                  setDoc(docRef, { profiles: data.profiles, activeProfileId: 'main' }, { merge: true }).catch(e => console.error('setDoc error:', e));
                }
                applyProfile(data);
              } else if (fromServer) {
                // Sunucu kesin olarak "yok" dedi: yeni kullanıcı. merge ile, var olan hiçbir alanı silmeden oluştur.
                const initialProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || '',
                  profiles: [{ id: 'main', name: user.displayName || 'Asıl Profil', createdAt: new Date().toISOString() }],
                };
                await setDoc(docRef, initialProfile, { merge: true });
                applyProfile(initialProfile);
              } else if (attempt < 5) {
                setTimeout(() => { loadRemote(attempt + 1); }, 3000);
              }
            } catch (err) {
              console.error('Profil okunamadı, tekrar denenecek:', err);
              if (attempt < 5) setTimeout(() => { loadRemote(attempt + 1); }, 2000 * (attempt + 1));
            }
          };
          loadRemote();
        } else {
          // Handle Local Multi-Profile
          const savedData = localStorage.getItem('fitlife_profile');
          if (savedData) {
            try {
              const data = JSON.parse(savedData) as UserProfile;
              setProfile(data);
              
              const savedId = localStorage.getItem('activeProfileId');
              const isValidId = data.profiles?.some(p => p.id === savedId);
              if (isValidId && savedId) {
                setActiveProfileId(savedId);
              } else if (data.profiles && data.profiles.length > 0) {
                const firstId = data.profiles[0].id;
                setActiveProfileId(firstId);
                localStorage.setItem('activeProfileId', firstId);
              } else {
                setActiveProfileId('local');
              }
            } catch (e) {
              console.error("Local data parsing error", e);
              localStorage.removeItem('fitlife_profile');
              throw e; // will be caught by outer catch
            }
          } else {
            const initialLocal: UserProfile = {
              uid: 'local',
              email: '',
              displayName: 'Misafir',
              profiles: [{
                id: 'local',
                name: 'Misafir',
                createdAt: new Date().toISOString()
              }]
            };
            setProfile(initialLocal);
            setActiveProfileId('local');
            localStorage.setItem('fitlife_profile', JSON.stringify(initialLocal));
            localStorage.setItem('activeProfileId', 'local');
          }
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged:", error);
      } finally {
        clearTimeout(fallbackTimer);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const { createUserWithEmailAndPassword, updateProfile: updateAuthProfile } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateAuthProfile(userCredential.user, { displayName: name });
    
    const initialProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: email,
      displayName: name,
      profiles: [{
        id: 'main',
        name: name,
        createdAt: new Date().toISOString()
      }]
    };
    const sanitizedProfile = sanitizeData(initialProfile);
    await setDoc(doc(db, 'users', userCredential.user.uid), sanitizedProfile);
    setProfile(sanitizedProfile);
    setActiveProfileId('main');
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('activeProfileId');
    localStorage.removeItem('fitlife_guest_mode');
  };

  const resetPassword = async (email: string) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const sanitizedData = sanitizeData(data);
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, sanitizedData, { merge: true });
    } else {
      const updated = profile ? { ...profile, ...sanitizedData } : sanitizedData as UserProfile;
      localStorage.setItem('fitlife_profile', JSON.stringify(updated));
    }
    setProfile(prev => {
      const next = prev ? { ...prev, ...sanitizedData } : (sanitizedData as UserProfile);
      if (user) { try { localStorage.setItem(`fitlife_user_profile_${user.uid}`, JSON.stringify(next)); } catch { /* yoksay */ } }
      return next;
    });
  };

  const switchProfile = async (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem('activeProfileId', id);
    if (user) {
      await updateProfile({ activeProfileId: id });
    }
  };

  const addProfile = async (name: string) => {
    if (!profile) return;
    const newProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: new Date().toISOString()
    };
    const updatedProfiles = [...(profile.profiles || []), newProfile];
    await updateProfile({ profiles: updatedProfiles });
    setActiveProfileId(newProfile.id);
    localStorage.setItem('activeProfileId', newProfile.id);
  };

  const deleteProfile = async (id: string) => {
    if (!profile) return;
    if (profile.profiles && profile.profiles.length <= 1) {
      alert("En az bir profil kalmalıdır.");
      return;
    }
    
    const updatedProfiles = profile.profiles?.filter(p => p.id !== id) || [];
    const updateData: Partial<UserProfile> = { profiles: updatedProfiles };

    if (activeProfileId === id) {
      const nextId = updatedProfiles[0].id;
      setActiveProfileId(nextId);
      localStorage.setItem('activeProfileId', nextId);
      updateData.activeProfileId = nextId;
    }

    await updateProfile(updateData);
  };

  const updateActiveSubProfile = async (data: Partial<SubProfile>) => {
    if (!profile || !activeProfileId) return;
    const updatedProfiles = profile.profiles?.map(p => 
      p.id === activeProfileId ? { ...p, ...data } : p
    ) || [];
    await updateProfile({ profiles: updatedProfiles });
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, activeProfileId, currentProfile, loading, login, logout, 
      updateProfile, updateActiveSubProfile, signUpWithEmail, loginWithEmail, switchProfile, addProfile, deleteProfile, resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
