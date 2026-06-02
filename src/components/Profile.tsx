import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Calendar, Ruler, Weight, Save, LogOut, LogIn, ShieldCheck, Plus, Trash2, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

import { parseNumber, getBMIStatus } from '../lib/utils';

export default function Profile() {
  const { user, profile: authProfile, login, logout, updateProfile, updateActiveSubProfile, loading, signUpWithEmail, loginWithEmail, activeProfileId, currentProfile, switchProfile, addProfile, deleteProfile } = useAuth();
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    if (currentProfile) {
      if (!localProfile || localProfile.id !== currentProfile.id) {
        setLocalProfile(currentProfile);
      }
    } else if (authProfile && !activeProfileId) {
      if (!localProfile || localProfile.uid !== authProfile.uid) {
        setLocalProfile(authProfile);
      }
    }
  }, [currentProfile, authProfile, activeProfileId, localProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localProfile && activeProfileId) {
      const hRaw = parseNumber(localProfile.initialHeight);
      const wRaw = parseNumber(localProfile.initialWeight);
      
      let hCm = hRaw;
      if (hRaw > 0 && hRaw < 3) hCm = hRaw * 100;

      const profileName = localProfile.name || localProfile.displayName || '';

      await updateActiveSubProfile({
        name: profileName,
        initialHeight: hCm,
        initialWeight: wRaw,
        gender: localProfile.gender,
        birthDate: localProfile.birthDate
      });
      
      setLocalProfile(prev => prev ? {
        ...prev,
        name: profileName,
        initialHeight: hCm,
        initialWeight: wRaw
      } : null);
      
      alert('Profil başarıyla güncellendi!');
    } else if (localProfile) {
      await updateProfile(localProfile);
      alert('Profil başarıyla güncellendi!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      setAuthError('');
      try {
        if (isSignUp) {
          if (!authData.name) {
            setAuthError('Lütfen adınızı girin.');
            setAuthLoading(false);
            return;
          }
          await signUpWithEmail(authData.email, authData.password, authData.name);
        } else {
          await loginWithEmail(authData.email, authData.password);
        }
        
        // Remember this account for quick switching
        const recent = JSON.parse(localStorage.getItem('recent_accounts') || '[]');
        if (!recent.includes(authData.email)) {
          localStorage.setItem('recent_accounts', JSON.stringify([...recent, authData.email].slice(-3)));
        }
      } catch (error: any) {
        if (error.message.includes('operation-not-allowed')) {
          setAuthError('HATA: E-posta ile giriş henüz aktif değil. Firebase Console > Authentication > Sign-in Method kısmından "Email/Password" seçeneğini aktif etmelisiniz. Şimdilik alttaki "Google ile Devam Et" butonunu kullanabilirsiniz.');
        } else {
          setAuthError(error.message || 'Bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
        }
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="max-w-xl mx-auto py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm shadow-slate-100/50 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/30">
              {isSignUp ? <UserIcon className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">
              {isSignUp ? 'Yeni Hesap Oluştur' : 'Tekrar Hoş Geldin'}
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">
              {isSignUp ? 'FitLife topluluğuna katılarak verilerini bulutta sakla.' : 'Hesabına giriş yap ve kaldığın yerden devam et.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">TAM AD</label>
                <input 
                  type="text"
                  required
                  placeholder="Can Demir"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm"
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">E-POSTA</label>
              <input 
                type="email"
                required
                placeholder="ornek@email.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">ŞİFRE</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
              />
            </div>

            {authError && (
              <p className="text-red-600 text-xs font-semibold bg-red-50 p-3.5 rounded-xl border border-red-100">
                {authError}
              </p>
            )}

            <button 
              disabled={authLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? 'İşleniyor...' : (isSignUp ? 'Hesap Oluştur' : 'Giriş Yap')}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {JSON.parse(localStorage.getItem('recent_accounts') || '[]').length > 0 && (
              <div>
                <p className="text-[9px] font-mono font-extrabold text-slate-300 uppercase tracking-widest mb-2.5 ml-1">Son Girişler</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(localStorage.getItem('recent_accounts') || '[]').map((email: string) => (
                    <button 
                      key={email}
                      onClick={() => setAuthData({...authData, email})}
                      className="px-3 py-1.5 bg-indigo-50/60 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100/50 transition-all border border-indigo-100/40 cursor-pointer"
                    >
                      {email}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* No quick test profiles */}
          </div>

          <div className="my-6 flex items-center gap-4">
             <div className="flex-1 h-px bg-slate-100" />
             <span className="text-[9px] font-mono font-extrabold text-slate-300 uppercase tracking-wider">VE YA</span>
             <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button 
            onClick={login}
            className="w-full bg-white text-slate-900 border border-slate-200 p-4 rounded-xl font-display font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Google ile Devam Et
          </button>

          <p className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all"
            >
              {isSignUp ? 'Zaten bir hesabın var mı? Giriş Yap' : 'Henüz bir hesabın yok mu? Kayıt Ol'}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar Switcher */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 shadow-slate-100/45">
            <h3 className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest mb-4 ml-1">PROFiLLERiM</h3>
            <div className="space-y-2">
              {authProfile?.profiles?.map((p) => (
                <div key={p.id} className="relative group/item">
                  <button
                    onClick={() => switchProfile(p.id)}
                    className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                      activeProfileId === p.id 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.01]' 
                      : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs ${
                      activeProfileId === p.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold truncate text-[13px] flex-1 text-left">{p.name}</span>
                  </button>
                  
                  {authProfile?.profiles && authProfile.profiles.length > 1 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {deletingId === p.id ? (
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-md border border-red-100">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await deleteProfile(p.id);
                              setDeletingId(null);
                            }}
                            className="text-[8px] font-mono font-extrabold uppercase px-2 py-1 bg-red-505 text-white rounded-md hover:bg-red-600"
                          >
                            SİL
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="text-[8px] font-mono font-extrabold uppercase px-2 py-1 bg-slate-50 text-slate-500 rounded-md"
                          >
                            İPTAL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingId(p.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeProfileId === p.id 
                            ? 'bg-white/20 text-white hover:bg-white hover:text-red-500' 
                            : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100/50'
                          }`}
                          title="Profili Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowAddProfile(true)}
                className="w-full p-3.5 rounded-xl flex items-center gap-3 border border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-50">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[13px]">Yeni Profil Ekle</span>
              </button>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full p-4 bg-rose-50/60 text-rose-700 rounded-2xl font-mono font-extrabold text-[10px] uppercase tracking-widest hover:bg-rose-100/80 transition-all border border-rose-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Oturumu Kapat
          </button>
        </div>

        {/* Profile Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Header area */}
          <header>
             <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Profil Ayarları</h1>
             <p className="text-slate-400 text-sm mt-0.5">
                Aktif profil: <span className="font-bold text-slate-700">{authProfile?.profiles?.find(p => p.id === activeProfileId)?.name}</span>.
             </p>
          </header>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/40">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">GÖRÜNEN AD</label>
                <input 
                  type="text" 
                  value={localProfile?.name || localProfile?.displayName || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalProfile(prev => {
                      if (!prev) return null;
                      if (activeProfileId) return { ...prev, name: val };
                      return { ...prev, displayName: val };
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">BOY (CM)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 180 veya 1.80"
                    value={localProfile?.initialHeight || ''}
                    onChange={(e) => setLocalProfile(prev => prev ? {...prev, initialHeight: e.target.value} : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">BAŞLANGIÇ KİLOSU (KG)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 75.5"
                    value={localProfile?.initialWeight || ''}
                    onChange={(e) => setLocalProfile(prev => prev ? {...prev, initialWeight: e.target.value} : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-sm text-slate-800"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest flex items-center justify-center shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <Save className="mr-2 h-4.5 w-4.5" />
                Ayarları Kaydet
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.98, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.98, opacity: 0 }}
               className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100"
            >
               <h2 className="text-xl font-display font-black text-slate-900 mb-5 tracking-tight text-center">Yeni Profil Ekle</h2>
               <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 ml-1">PROFİL ADI</label>
                    <input 
                      autoFocus
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-semibold text-sm outline-none focus:bg-white ring-indigo-100 focus:ring-4"
                      placeholder="Örn: Ayşe"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                     <button 
                       onClick={() => { setShowAddProfile(false); setNewProfileName(''); }}
                       className="flex-1 p-3.5 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 text-xs transition-colors cursor-pointer"
                     >
                       İptal
                     </button>
                     <button 
                       disabled={!newProfileName}
                       onClick={async () => {
                         await addProfile(newProfileName);
                         setShowAddProfile(false);
                         setNewProfileName('');
                       }}
                       className="flex-1 p-3.5 rounded-xl bg-indigo-600 text-white font-display font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
                     >
                       Ekle
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
