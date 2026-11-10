import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardPage } from './pages/BoardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { LearningCenterModal } from './components/LearningCenterModal';
import { AppsDownloadModal } from './components/AppsDownloadModal';
import { DeveloperHubModal } from './components/DeveloperHubModal';
import { MarketplaceModal } from './components/MarketplaceModal';
import { SplashScreen } from './components/SplashScreen';
import StickyBannerDemo from './components/sticky-banner-demo';
import SidebarDemo from './components/sidebar-demo';

export const App: React.FC = () => {
  const { token } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'board' | 'profile_settings' | 'landing' | 'demo_banner' | 'demo_sidebar'>('dashboard');
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'home' | 'starred' | 'projects' | 'templates' | 'shared' | 'trash'>('home');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [initialObjects, setInitialObjects] = useState<any[] | undefined>(undefined);

  // Sync board ID and demo view from URL query parameters (e.g. ?board=board-123, ?demo=banner, ?demo=sidebar, ?view=landing)
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const demoParam = params.get('demo');
      if (demoParam === 'banner') {
        setCurrentView('demo_banner');
        return;
      }
      if (demoParam === 'sidebar') {
        setCurrentView('demo_sidebar');
        return;
      }
      const viewParam = params.get('view');
      if (viewParam === 'landing') {
        setCurrentView('landing');
        return;
      }
      const boardParam = params.get('board');
      if (boardParam) {
        setActiveBoardId(boardParam);
        setCurrentView('board');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleSelectBoard = (id: string, templateObjs?: any[]) => {
    setActiveBoardId(id);
    setInitialObjects(templateObjs);
    setCurrentView('board');
    const url = new URL(window.location.href);
    url.searchParams.set('board', id);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToDashboard = () => {
    setActiveBoardId(null);
    setInitialObjects(undefined);
    setCurrentView('dashboard');
    const url = new URL(window.location.href);
    url.searchParams.delete('board');
    window.history.pushState({}, '', url.toString());
  };

  // Global Modal States
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [isLearningCenterOpen, setIsLearningCenterOpen] = useState(false);
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [isDeveloperHubOpen, setIsDeveloperHubOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

  const handleSplashFinished = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  if (!token) {
    return <LandingPage onEnterApp={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'demo_banner') {
    return (
      <div className="h-screen w-full bg-slate-50 dark:bg-neutral-900 flex flex-col overflow-hidden">
        <div className="p-3 bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 flex items-center justify-between shrink-0 z-50">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Aceternity UI &bull; Sticky Banner Demo
          </span>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('demo');
              window.history.pushState({}, '', url.toString());
              setCurrentView('dashboard');
            }}
            className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>
        <StickyBannerDemo />
      </div>
    );
  }

  if (currentView === 'demo_sidebar') {
    return (
      <div className="h-screen w-full bg-slate-100 dark:bg-neutral-900 flex flex-col overflow-hidden">
        <div className="p-3 bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 flex items-center justify-between shrink-0 z-50">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Aceternity UI &bull; Sidebar Demo
          </span>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('demo');
              window.history.pushState({}, '', url.toString());
              setCurrentView('dashboard');
            }}
            className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto">
          <SidebarDemo />
        </div>
      </div>
    );
  }

  if (currentView === 'profile_settings') {
    return (
      <>
        <ProfileSettingsPage
          onBackToBoards={() => setCurrentView('dashboard')}
          onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
          onOpenTrash={() => {
            setDashboardInitialTab('trash');
            setCurrentView('dashboard');
          }}
          onOpenLearningCenter={() => setIsLearningCenterOpen(true)}
          onOpenAppsModal={() => setIsAppsModalOpen(true)}
          onOpenDeveloperHub={() => setIsDeveloperHubOpen(true)}
          onOpenMarketplace={() => setIsMarketplaceOpen(true)}
          onOpenUpgrade={() => {}}
        />
        <AdminConsoleModal isOpen={isAdminConsoleOpen} onClose={() => setIsAdminConsoleOpen(false)} />
        <LearningCenterModal isOpen={isLearningCenterOpen} onClose={() => setIsLearningCenterOpen(false)} />
        <AppsDownloadModal isOpen={isAppsModalOpen} onClose={() => setIsAppsModalOpen(false)} />
        <DeveloperHubModal isOpen={isDeveloperHubOpen} onClose={() => setIsDeveloperHubOpen(false)} />
        <MarketplaceModal isOpen={isMarketplaceOpen} onClose={() => setIsMarketplaceOpen(false)} />
      </>
    );
  }

  if (currentView === 'board' && activeBoardId) {
    return (
      <>
        <BoardPage
          boardId={activeBoardId}
          initialObjects={initialObjects}
          onBackToDashboard={handleBackToDashboard}
          onOpenProfileSettings={() => setCurrentView('profile_settings')}
          onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
          onOpenTrash={() => {
            setDashboardInitialTab('trash');
            setCurrentView('dashboard');
          }}
          onOpenLearningCenter={() => setIsLearningCenterOpen(true)}
          onOpenAppsModal={() => setIsAppsModalOpen(true)}
          onOpenDeveloperHub={() => setIsDeveloperHubOpen(true)}
          onOpenMarketplace={() => setIsMarketplaceOpen(true)}
        />
        <AdminConsoleModal isOpen={isAdminConsoleOpen} onClose={() => setIsAdminConsoleOpen(false)} />
        <LearningCenterModal isOpen={isLearningCenterOpen} onClose={() => setIsLearningCenterOpen(false)} />
        <AppsDownloadModal isOpen={isAppsModalOpen} onClose={() => setIsAppsModalOpen(false)} />
        <DeveloperHubModal isOpen={isDeveloperHubOpen} onClose={() => setIsDeveloperHubOpen(false)} />
        <MarketplaceModal isOpen={isMarketplaceOpen} onClose={() => setIsMarketplaceOpen(false)} />
      </>
    );
  }

  return (
    <>
      <DashboardPage
        initialTab={dashboardInitialTab}
        onSelectBoard={handleSelectBoard}
        onOpenProfileSettings={() => setCurrentView('profile_settings')}
        onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
        onOpenTrash={() => setDashboardInitialTab('trash')}
        onOpenLearningCenter={() => setIsLearningCenterOpen(true)}
        onOpenAppsModal={() => setIsAppsModalOpen(true)}
        onOpenDeveloperHub={() => setIsDeveloperHubOpen(true)}
        onOpenMarketplace={() => setIsMarketplaceOpen(true)}
        onOpenLanding={() => setCurrentView('landing')}
      />
      <AdminConsoleModal isOpen={isAdminConsoleOpen} onClose={() => setIsAdminConsoleOpen(false)} />
      <LearningCenterModal isOpen={isLearningCenterOpen} onClose={() => setIsLearningCenterOpen(false)} />
      <AppsDownloadModal isOpen={isAppsModalOpen} onClose={() => setIsAppsModalOpen(false)} />
      <DeveloperHubModal isOpen={isDeveloperHubOpen} onClose={() => setIsDeveloperHubOpen(false)} />
      <MarketplaceModal isOpen={isMarketplaceOpen} onClose={() => setIsMarketplaceOpen(false)} />
    </>
  );
};
