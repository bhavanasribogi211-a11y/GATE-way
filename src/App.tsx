import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VirtualCalculator } from './components/VirtualCalculator';
import { AIChatbot } from './components/AIChatbot';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { TimetablePage } from './pages/TimetablePage';
import { SyllabusPage } from './pages/SyllabusPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MockTestPage } from './pages/MockTestPage';
import { ProgressPage } from './pages/ProgressPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';

const MainContent: React.FC = () => {
  const { activeTab, isCalculatorOpen, setIsCalculatorOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'timetable' && <TimetablePage />}
        {activeTab === 'syllabus' && <SyllabusPage />}
        {activeTab === 'notifications' && <NotificationsPage />}
        {activeTab === 'mock-tests' && <MockTestPage />}
        {activeTab === 'progress' && <ProgressPage />}
        {activeTab === 'resources' && <ResourcesPage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'admin' && <AdminPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      <VirtualCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <AIChatbot />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
