import React, { useState } from 'react';
import AccountInfo from './AccountInfo';
import { Link, useLocation } from 'react-router-dom';
import { Activity, User as UserIcon, ClipboardList, BarChart3, Settings, Calendar, Users, Loader2, Trash2, Sun, Moon, StickyNote, LogOut, Droplets, Salad, Plus, Menu, X, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  // Sayfa değişince içerik en üstten başlasın
  const mainRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  const { user, profile, activeProfileId, switchProfile, logout, loginWithEmail, signUpWithEmail, deleteProfile, currentProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [switching, setSwitching] = useState(false);

  const handleTestSwitch = async (profileId: string) => {
    setSwitching(true);
    try {
      await switchProfile(profileId);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSwitching(false), 500);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  // Döngü (adet takibi) erkek profillerde gizli
  const isMale = (currentProfile?.gender || profile?.gender) === 'male';
  const hideMale = (i: { path: string }) => !(isMale && i.path === '/cycle');

  const navItems = [
    { name: 'Kontrol Paneli', path: '/', icon: Activity },
    { name: 'Kayıt Ekle', path: '/add', icon: ClipboardList },
    { name: 'Beslenme', path: '/nutrition', icon: Salad },
    { name: 'Notlar', path: '/notes', icon: StickyNote },
    { name: 'Döngü', path: '/cycle', icon: Droplets },
    { name: 'Geçmiş', path: '/history', icon: Calendar },
    { name: 'Analizler', path: '/analysis', icon: BarChart3 },
    { name: 'Profil', path: '/profile', icon: UserIcon },
  ].filter(hideMale);

  // Mobil alt sekme çubuğu: 4 sekme + ortada büyük "+" butonu
  const mobileTabs = [
    { name: 'Ana Sayfa', path: '/', icon: Home },
    { name: 'Beslenme', path: '/nutrition', icon: Salad },
    { name: 'Analiz', path: '/analysis', icon: BarChart3 },
  ];
  const moreItems = [
    { name: 'Notlar', path: '/notes', icon: StickyNote },
    { name: 'Döngü', path: '/cycle', icon: Droplets },
    { name: 'Geçmiş', path: '/history', icon: Calendar },
    { name: 'Profil', path: '/profile', icon: UserIcon },
  ].filter(hideMale);
  const pageTitles: Record<string, string> = {
    '/': 'FitLife', '/add': 'Kayıt Ekle', '/nutrition': 'Beslenme', '/notes': 'Notlar', '/cycle': 'Döngü',
    '/history': 'Geçmiş', '/analysis': 'Analizler', '/profile': 'Profil', '/workout': 'Antrenman',
  };
  const pageTitle = pageTitles[location.pathname] || 'FitLife';
  const isMoreActive = moreItems.some(i => i.path === location.pathname);

  return (
    <div className="h-[100dvh] flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col shrink-0 transition-colors duration-200 relative">
        {/* Subtle decorative futuristic edge lights */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-indigo-500/20 via-transparent to-emerald-500/10 pointer-events-none" />

        <div className="p-8 flex flex-col flex-1 overflow-y-auto">
          {/* Brand Logo Header with Theme Toggle */}
          <div className="flex items-center justify-between gap-3 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-display font-black italic shadow-md shadow-indigo-100 dark:shadow-none ring-4 ring-indigo-50 dark:ring-indigo-950/20">
                F
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">FitLife</span>
                <span className="text-[10px] font-mono tracking-widest text-[#10b981] dark:text-emerald-400 font-black block -mt-1 uppercase">Sağlık Takibi</span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-auto rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200 shadow-sm shrink-0"
              title={theme === 'light' ? 'Koyu Moda Geç' : 'Açık Moda Geç'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-emerald-400" />}
            </button>
          </div>

          {/* Sub-Profiles Container if more than 1 */}
          {user && profile && profile.profiles && profile.profiles.length > 1 && (
            <div className="mb-8 p-1.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-2xl flex gap-1 transition-colors duration-200">
              {profile.profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => switchProfile(p.id)}
                  className={`flex-1 py-2.5 px-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                    activeProfileId === p.id
                      ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-700/60'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <div className="truncate">{p.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Items with Sliding Active Pill */}
          <nav className="space-y-2 relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl font-semibold text-sm transition-all duration-250 relative overflow-hidden ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/20 font-medium'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 bg-slate-50 dark:bg-slate-800/40 border-l-[3px] border-indigo-600 dark:border-emerald-500 rounded-r-xl rounded-l-sm -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'text-indigo-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Profile Switching List */}
          {profile?.profiles && profile.profiles.length > 0 && (
            <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-extrabold text-[9px] uppercase tracking-widest mb-4 px-1">
                <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-emerald-500" />
                <span>HIZLI ERİŞİM DEFTERİ</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {profile.profiles.map(p => (
                  <div key={p.id} className="relative group/profile">
                    <button
                      onClick={() => handleTestSwitch(p.id)}
                      disabled={switching || (activeProfileId === p.id)}
                      className={`w-full py-2.5 px-3 text-[10px] font-black rounded-xl border transition-all text-center uppercase tracking-wider truncate pr-6 cursor-pointer ${
                        activeProfileId === p.id 
                          ? 'bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-transparent shadow-lg shadow-indigo-100 dark:shadow-none' 
                          : 'bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50'
                      }`}
                      title={p.name}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                    {profile.profiles.length > 1 && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                        {deletingId === p.id ? (
                          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-850 p-0.5 rounded-lg shadow-xl border border-red-100 dark:border-red-900/30 z-10 scale-90 -translate-x-full">
                             <button
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 await deleteProfile(p.id);
                                 setDeletingId(null);
                               }}
                               className="text-[6px] font-black uppercase px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                             >
                               Evet
                             </button>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setDeletingId(null);
                               }}
                               className="text-[6px] font-black uppercase px-1.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded cursor-pointer"
                             >
                               İptal
                             </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeletingId(p.id);
                            }}
                            className={`opacity-0 group-hover/profile:opacity-100 transition-opacity p-1.5 rounded-lg cursor-pointer ${
                              activeProfileId === p.id ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                            }`}
                            title="Sil"
                          >
                            <Trash2 className="w-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {switching && (
                <div className="mt-3 flex items-center justify-center gap-2 text-indigo-600 dark:text-emerald-400 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest">ROM EŞLENİYOR...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Card Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 transition-colors duration-200">
          <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover animate-fade-in" />
                ) : (
                  <span className="text-slate-600 dark:text-emerald-400 font-display font-extrabold text-sm">{user?.displayName?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <div className="text-sm font-black text-slate-850 dark:text-slate-100 truncate">
                  {currentProfile?.name || profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Misafir'}
                </div>
                <div className="text-[9px] text-[#10b981] dark:text-emerald-400 font-bold uppercase tracking-widest truncate">
                  {user ? 'ÜYE' : 'MİSAFİR'}
                </div>
              </div>
              
              {user && (
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                  title="Hesap Değiştir / Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            <AccountInfo className="mt-2 px-1" />

            {!user && (
              <button
                onClick={() => {
                  localStorage.removeItem('fitlife_guest_mode');
                  window.location.reload();
                }}
                className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-display font-black text-[9px] uppercase tracking-widest rounded-xl hover:opacity-95 active:scale-98 transition-all cursor-pointer shadow-sm shadow-indigo-150"
              >
                Giriş Yap / Kayıt Ol
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobil üst çubuk: durum çubuğunun altında kalır */}
        <header
          className="md:hidden shrink-0 z-40 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-100/80 dark:border-slate-900"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="h-12 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 shrink-0 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-display font-black italic">
                F
              </div>
              <span className="font-display font-black text-[17px] tracking-tight text-slate-900 dark:text-white truncate">{pageTitle}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="app-icon-btn w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 active:bg-slate-200/60 dark:active:bg-slate-800"
              aria-label="Tema değiştir"
            >
              {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px] text-emerald-400" />}
            </button>
          </div>
        </header>

        <main ref={mainRef} className="app-main flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              // Sadece opaklık: transform kullanmak içerideki açılır pencereleri (fixed) alt menünün altına hapsediyordu
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="max-w-[1400px] mx-auto w-full md:pb-0"
              style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom))' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobil alt sekme çubuğu */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="h-[60px] grid grid-cols-5 items-center">
          <TabLink item={mobileTabs[0]} active={location.pathname === mobileTabs[0].path} />
          <TabLink item={mobileTabs[1]} active={location.pathname === mobileTabs[1].path} />
          <div className="flex justify-center">
            <Link
              to="/add"
              aria-label="Kayıt Ekle"
              className={`app-icon-btn w-12 h-12 -mt-5 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 bg-gradient-to-tr from-emerald-500 to-teal-400 active:scale-95 transition-transform ${location.pathname === '/add' ? 'ring-4 ring-emerald-500/25' : ''}`}
            >
              <Plus className="w-6 h-6" strokeWidth={2.75} />
            </Link>
          </div>
          <TabLink item={mobileTabs[2]} active={location.pathname === mobileTabs[2].path} />
          <button
            onClick={() => setMoreOpen(true)}
            className={`app-icon-btn flex flex-col items-center justify-center gap-0.5 h-full ${isMoreActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
          >
            <Menu className="w-[22px] h-[22px]" strokeWidth={isMoreActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Daha Fazla</span>
          </button>
        </div>
      </nav>

      {/* "Daha Fazla" alt sayfası */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div className="md:hidden fixed inset-0 z-[60] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMoreOpen(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className="relative w-full max-h-[88dvh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-[28px] px-4 pt-3"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
            >
              <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3" />
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="font-display font-black text-lg text-slate-900 dark:text-white">Daha Fazla</h2>
                <button onClick={() => setMoreOpen(false)} className="app-icon-btn w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500" aria-label="Kapat">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {moreItems.map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-100 dark:active:bg-slate-800">
                    <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="flex-1 text-[15px] font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>
              {user && (
                <button onClick={() => { setMoreOpen(false); logout(); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[15px]">
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              )}
              <AccountInfo className="mt-3" />
              <p className="mt-1 text-center text-[10px] font-medium text-slate-400">Sürüm {__APP_VERSION__}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabLink({ item, active }: { item: { name: string; path: string; icon: React.ElementType }; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link to={item.path} className={`app-icon-btn flex flex-col items-center justify-center gap-0.5 h-full ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
      <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-bold">{item.name}</span>
    </Link>
  );
}
