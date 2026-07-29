/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ReloadPrompt from './components/ReloadPrompt';

// Kod bölme (Code Splitting) için sayfaları tembel yüklüyoruz (Lazy Load)
const Dashboard = lazy(() => import('./components/Dashboard'));
const HealthForm = lazy(() => import('./components/HealthForm'));
const Analysis = lazy(() => import('./components/Analysis'));
const Profile = lazy(() => import('./components/Profile'));
const History = lazy(() => import('./components/History'));
const Workout = lazy(() => import('./components/Workout'));
const WorkoutSelection = lazy(() => import('./components/WorkoutSelection'));
const Notes = lazy(() => import('./components/Notes'));
const MenstrualCycle = lazy(() => import('./components/MenstrualCycle'));
import AuthGate from './components/AuthGate';

// Sayfa geçişlerinde gösterilecek şık yükleme ekranı
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-40 h-full w-full min-h-[50vh]">
      <Loader2 className="h-10 w-10 text-indigo-600 dark:text-emerald-400 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sayfa Hazırlanıyor...</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('fitlife_guest_mode') === 'true');

  useEffect(() => {
    if (user) {
      setGuestMode(false);
    } else {
      setGuestMode(localStorage.getItem('fitlife_guest_mode') === 'true');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-indigo-600 dark:text-emerald-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest animate-pulse">Sistem Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user && !guestMode) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthGate 
          onEnterGuestMode={() => {
            localStorage.setItem('fitlife_guest_mode', 'true');
            setGuestMode(true);
          }} 
        />
      </Suspense>
    );
  }

  return (
    <>
      <ReloadPrompt />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/workout-active" element={<Workout />} />
          <Route path="*" element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add" element={<HealthForm />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/workout" element={<WorkoutSelection />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/cycle" element={<MenstrualCycle />} />
                </Routes>
              </Suspense>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </>
  );
}
