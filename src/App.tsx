/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import HealthForm from './components/HealthForm';
import Analysis from './components/Analysis';
import Profile from './components/Profile';
import History from './components/History';
import Workout from './components/Workout';
import WorkoutSelection from './components/WorkoutSelection';
import Notes from './components/Notes';
import AuthGate from './components/AuthGate';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ReloadPrompt from './components/ReloadPrompt';

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
      <AuthGate 
        onEnterGuestMode={() => {
          localStorage.setItem('fitlife_guest_mode', 'true');
          setGuestMode(true);
        }} 
      />
    );
  }

  return (
    <>
      <ReloadPrompt />
      <Routes>
        <Route path="/workout-active" element={<Workout />} />
      <Route path="*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<HealthForm />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/workout" element={<WorkoutSelection />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </Layout>
      } />
      </Routes>
    </>
  );
}
