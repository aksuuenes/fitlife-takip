import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, ShieldCheck, Activity, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { app } from '../firebase';

interface AuthGateProps {
  onEnterGuestMode: () => void;
}

export default function AuthGate({ onEnterGuestMode }: AuthGateProps) {
  const { login, signUpWithEmail, loginWithEmail, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<React.ReactNode | string>('');
  const [resetMessage, setResetMessage] = useState('');

  const handleResetPassword = async () => {
    if (!authData.email) {
      setAuthError('Şifre sıfırlama bağlantısı için lütfen yukarıya e-posta adresinizi girin.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    setResetMessage('');
    try {
      await resetPassword(authData.email);
      setResetMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setAuthError('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
      } else {
        setAuthError(error.message || 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.');
      }
    } finally {
      setAuthLoading(false);
    }
  };
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
    } catch (error: any) {
      if (error.message.includes('operation-not-allowed')) {
        setAuthError(
          <div className="space-y-3 text-left">
            <p className="font-bold text-red-600 dark:text-red-400">
              E-posta/Şifre sağlayıcısı Firebase projenizde henüz aktif değil!
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Firebase Console üzerinde bu özelliği tek tıkla aktif etmelisiniz:
            </p>
            <ol className="list-decimal list-inside text-[11px] text-slate-550 dark:text-slate-400 space-y-1 font-semibold pl-1">
              <li>Aşağıdaki butona tıklayarak Firebase Konsolunu yeni sekmede açın.</li>
              <li>"Giriş yöntemi ekle" (Add provider) butonuna basın.</li>
              <li>"E-posta/Şifre" (Email/Password) seçeneğini seçin, aktif edin ("Etkinleştir" seçeneğini açın) ve "Kaydet" butonuna tıklayın.</li>
            </ol>
            <a 
              href={`https://console.firebase.google.com/project/${app.options.projectId}/authentication/providers`} 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="inline-flex items-center justify-center gap-2 w-full mt-2 py-2.5 px-4 bg-red-650 hover:bg-red-700 text-white font-display font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-sm"
            >
              <span>Firebase Konsolunu Aç ↗</span>
            </a>
          </div>
        );
      } else if (error.message.includes('auth/invalid-credential') || error.message.includes('auth/wrong-password') || error.message.includes('auth/user-not-found')) {
        setAuthError('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
      } else {
        setAuthError(error.message || 'Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await login();
    } catch (error: any) {
      const errMessage = error.message || String(error);
      if (errMessage.includes('auth/unauthorized-domain') || (error.code && error.code.includes('unauthorized-domain'))) {
        setAuthError(
          <div className="space-y-3 text-left">
            <p className="font-bold text-red-600 dark:text-red-400">
              Yetkisiz Etki Alanı Hatası (auth/unauthorized-domain)!
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Google ile giriş yapabilmek için, bu uygulamaya eriştiğiniz adresi (örneğin <strong>localhost</strong>) Firebase projenizin Yetkilendirilmiş Etki Alanları listesine eklemeniz gerekir:
            </p>
            <ol className="list-decimal list-inside text-[11px] text-slate-550 dark:text-slate-400 space-y-1 font-semibold pl-1">
              <li>Aşağıdaki butona tıklayarak Firebase Konsolunu açın.</li>
              <li>"Yetkilendirilmiş etki alanları" (Authorized domains) bölümüne gelin.</li>
              <li>"Etki alanı ekle" (Add domain) butonuna basıp <strong>localhost</strong> veya <strong>vercel</strong> domaininizi yazın ve kaydedin.</li>
            </ol>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a 
                href={`https://console.firebase.google.com/project/${app.options.projectId}/authentication/settings`} 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-display font-black text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-sm"
              >
                <span>Firebase Ayarlarını Aç ↗</span>
              </a>
              <button
                type="button"
                onClick={onEnterGuestMode}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-display font-black text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Misafir Moduna Geç
              </button>
            </div>
          </div>
        );
      } else {
        setAuthError(errMessage || 'Google ile giriş başarısız oldu.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-[#030712] transition-colors duration-300 overflow-x-hidden">
      
      {/* LEFT SIDE: Decorative Brand Panel */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white overflow-hidden">
        {/* Abstract background blobs for a super modern tech feel */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-display font-black italic shadow-lg shadow-indigo-900/40 border border-white/10">
            F
          </div>
          <div>
            <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-emerald-300 bg-clip-text text-transparent">FitLife</span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-black block -mt-1 uppercase">Wellness AI Studio</span>
          </div>
        </div>

        {/* Testimonial / Features slider */}
        <div className="z-10 max-w-lg mb-12">
          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/5 border border-white/10 text-emerald-400 font-mono text-[10px] uppercase tracking-widest font-black mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Yapay Zekâ Destekli Sağlık Takibi
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-[1.05] text-white">
            Sağlığınıza <strong className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-300 font-black">Bilimsel</strong> Bir Yaklaşım.
          </h1>
          
          <p className="text-slate-400 text-sm mt-5 leading-relaxed font-medium">
            Kişisel egzersiz günlüğü, yapay zekâ analizleri, interaktif yoga poster asistanı, ağırlık, beslenme ve yaşamsal metrik takipleri tek bir güvenli çatı altında.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 pt-8 border-t border-white/5 text-xs text-slate-350">
            <div>
              <div className="font-display font-black text-white text-lg">100% Güvenli</div>
              <div className="mt-1 font-medium text-slate-400">Firebase ile şifrelenmiş bulut senkronizasyonu.</div>
            </div>
            <div>
              <div className="font-display font-black text-white text-lg">Çoklu Profil</div>
              <div className="mt-1 font-medium text-slate-400">Tek hesaptan tüm aile için alt profiller yönetimi.</div>
            </div>
          </div>
        </div>

        {/* Footer credits */}
        <div className="text-[10px] font-mono text-slate-500 z-10">
          © {new Date().getFullYear()} FitLife Wellness. Tüm hakları saklıdır.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login/Register Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:p-20 relative">
        {/* Design details in right side background for mobile */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none lg:hidden" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Mobile Header (Hidden on Large Screen) */}
          <div className="text-center lg:hidden flex flex-col items-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-display font-black italic shadow-md mb-3">
              F
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">FitLife Wellness</h2>
            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Yapay Zekâ Egzersiz & Sağlık Platformu</p>
          </div>

          <div className="text-center hidden lg:block">
            <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              {isSignUp ? 'FitLife\'a Katılın' : 'Tekrar Hoş Geldiniz'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
              {isSignUp ? 'Bilgilerinizi girerek yeni bir hesap oluşturun' : 'Lütfen hesabınıza giriş yapın'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup' : 'login'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-10 rounded-[32px] shadow-xl shadow-slate-150/10 dark:shadow-none"
            >
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ml-1">AD SOYAD</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text"
                        required
                        placeholder="Can Demir"
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-150/60 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/20 focus:border-indigo-500 dark:focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-slate-800 dark:text-white"
                        value={authData.name}
                        onChange={(e) => setAuthData({...authData, name: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ml-1">E-POSTA</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-150/60 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/20 focus:border-indigo-500 dark:focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-slate-800 dark:text-white"
                      value={authData.email}
                      onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500 ml-1">ŞİFRE</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-150/60 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/20 focus:border-indigo-500 dark:focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-slate-800 dark:text-white"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                    />
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex justify-end pt-1">
                    <button 
                      type="button" 
                      onClick={handleResetPassword}
                      disabled={authLoading}
                      className="text-[10px] font-bold text-indigo-600 dark:text-emerald-400 hover:text-indigo-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      Şifremi Unuttum
                    </button>
                  </div>
                )}

                {resetMessage && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 leading-relaxed"
                  >
                    {resetMessage}
                  </motion.p>
                )}

                {authError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 dark:text-red-400 text-xs font-semibold bg-red-50 dark:bg-red-950/20 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 leading-relaxed"
                  >
                    {authError}
                  </motion.p>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 text-white py-4 px-6 rounded-2xl font-display font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-md shadow-slate-900/10 dark:shadow-none"
                >
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white dark:text-slate-950" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Alternatives Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-[10px] font-mono font-extrabold text-slate-350 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Veya Bununla Bağlan</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="space-y-3">
                {/* Google sign-in */}
                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={authLoading}
                  className="w-full bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 py-3.5 px-6 rounded-2xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  <span>Google HESABI İLE BAĞLAN</span>
                </button>

                {/* Continue as Guest option */}
                <button 
                  type="button"
                  onClick={onEnterGuestMode}
                  disabled={authLoading}
                  className="w-full bg-slate-50 dark:bg-slate-950/30 text-slate-550 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-emerald-400 border border-transparent hover:border-indigo-100 dark:hover:border-slate-800 py-3.5 px-6 rounded-2xl font-display font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Misafir Olarak Giriş Yap</span>
                </button>
              </div>

              {/* Toggle Sign Up / Login */}
              <p className="mt-8 text-center text-xs text-slate-500">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError('');
                  }}
                  className="font-bold text-indigo-600 dark:text-emerald-400 hover:text-indigo-700 dark:hover:text-emerald-300 transition-all cursor-pointer underline underline-offset-4 decoration-indigo-200 dark:decoration-emerald-500/20"
                >
                  {isSignUp ? 'Zaten bir hesabınız var mı? Giriş Yapın' : 'Henüz bir hesabınız yok mu? Şimdi Kayıt Olun'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
