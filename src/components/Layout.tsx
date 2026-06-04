import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, User as UserIcon, ClipboardList, BarChart3, Settings, Calendar, Users, Loader2, Trash2, Sun, Moon, StickyNote, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
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

  const navItems = [
    { name: 'Kontrol Paneli', path: '/', icon: Activity },
    { name: 'Kayıt Ekle', path: '/add', icon: ClipboardList },
    { name: 'Notlar', path: '/notes', icon: StickyNote },
    { name: 'Geçmiş', path: '/history', icon: Calendar },
    { name: 'Analizler', path: '/analysis', icon: BarChart3 },
    { name: 'Profil', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
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
                <span className="text-[10px] font-mono tracking-widest text-[#10b981] dark:text-emerald-400 font-black block -mt-1 uppercase">Wellness AI</span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-auto rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-slate-850 cursor-pointer transition-all duration-200 shadow-sm shrink-0"
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
                  {user ? 'KİNETİK PRO' : 'MİSAFİR SEVİYE'}
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
      <main className="flex-1 flex flex-col p-5 md:p-10 overflow-y-auto">
        {/* Mobile Top Header (Visible only on mobile) */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-900 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-display font-black italic shadow-md">
              F
            </div>
            <div>
              <span className="font-display font-black text-base tracking-tight text-slate-900 dark:text-white">FitLife</span>
              <span className="text-[8px] font-mono tracking-widest text-[#10b981] dark:text-emerald-400 font-extrabold block -mt-1 uppercase animate-pulse">Wellness AI</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-emerald-400 transition-all duration-200 cursor-pointer"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1400px] mx-auto w-full pb-24 md:pb-0"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Nav - Re-designed to be an ultra-sleek, luxurious floating dynamic pill menu */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-950/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[24px] px-4 py-2 flex justify-around items-center border border-white/10 dark:border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all relative ${
                isActive ? 'text-emerald-400 scale-105 font-bold' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActivePill"
                  className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-500/10"
                  transition={{ type: "spring", stiffness: 380, damping: 25 }}
                />
              )}
              <item.icon className="h-5 w-5 z-10" />
              <span className="text-[9px] mt-1 font-bold tracking-tight z-10">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
