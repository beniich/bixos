import React, { useState, useEffect } from 'react';
import { PageId, Language, GoogleAuthUser } from './types';
import { SpaceflowHeader } from './components/spaceflow/SpaceflowHeader';
import { PublicHomePage } from './components/spaceflow/PublicHomePage';
import { ManagerDashboardView } from './components/spaceflow/ManagerDashboardView';
import { MembersListView } from './components/spaceflow/MembersListView';
import { BookingsCalendarView } from './components/spaceflow/BookingsCalendarView';
import { BillingInvoicesView } from './components/spaceflow/BillingInvoicesView';
import { AnalyticsAiView } from './components/spaceflow/AnalyticsAiView';
import { CoworkerMobilePwaView } from './components/spaceflow/CoworkerMobilePwaView';
import { VisitorsView } from './components/spaceflow/VisitorsView';
import { SettingsView } from './components/spaceflow/SettingsView';
import { MeetAiView } from './components/spaceflow/MeetAiView';
import { InboxAiView } from './components/spaceflow/InboxAiView';
import { TodayDashboardView } from './components/spaceflow/TodayDashboardView';
import { ExitReadyView } from './components/spaceflow/ExitReadyView';
import { CallCopilotView } from './components/spaceflow/CallCopilotView';
import { SchemaView } from './components/spaceflow/SchemaView';
import { GoogleAuthGateModal } from './components/spaceflow/GoogleAuthGateModal';

import { ArchitecturePage } from './components/pages/ArchitecturePage';
import { PricingPage } from './components/pages/PricingPage';
import { SupportPage } from './components/pages/SupportPage';
import { LoginPage } from './components/pages/LoginPage';
import { Footer } from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { SubscriptionPlan } from './components/auth/SubscriptionPlan';
import { useAuth } from './context/AuthContext';

export function App() {
  const { user: firebaseUser, loading: authLoading, logout: firebaseLogout } = useAuth();
  const [activePage, setActivePage] = useState<PageId>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('bizos_lang');
    return (savedLang as Language) || 'EN';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('bizos_lang', lang);
  };
  const [googleUser, setGoogleUser] = useState<GoogleAuthUser | null>(null);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [pendingTargetPage, setPendingTargetPage] = useState<PageId | null>(null);

  useEffect(() => {
    document.title = 'BizOS — Coworking Management Platform';
  }, []);

  useEffect(() => {
    // Check local storage for existing Google OAuth session
    const saved = localStorage.getItem('spaceflow_google_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.email) {
          setGoogleUser(user);
          setIsLoggedIn(true);
        }
      } catch {
        // ignore
      }
    } else {
      // Default demo Google user connected automatically
      // NOTE: With Firebase integration, this fallback is kept for Demo purposes.
      const demoUser: GoogleAuthUser = {
        email: 'albertomodo.cc@gmail.com',
        name: 'Alberto Modo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        provider: 'GOOGLE_OAUTH',
        scopesAuthorized: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/gmail.readonly',
        ],
        googleToken: 'google_oauth_active_token_2026',
        authenticatedAt: new Date().toISOString(),
      };
      setGoogleUser(demoUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Sync Firebase user with app state
  useEffect(() => {
    if (firebaseUser) {
      setIsLoggedIn(true);
      setGoogleUser({
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'BizOS User',
        avatar: firebaseUser.photoURL || '',
        provider: 'GOOGLE_OAUTH',
        authenticatedAt: new Date().toISOString(),
      });
      if (activePage === 'login' || activePage === 'register') {
        setActivePage('dashboard');
      }
    }
  }, [firebaseUser]);

  const handleNavigate = (page: PageId) => {
    const protectedPages: PageId[] = [
      'dashboard',
      'members',
      'bookings',
      'billing',
      'analytics',
      'visitors',
      'settings',
    ];

    if (protectedPages.includes(page) && !googleUser && !isLoggedIn) {
      setPendingTargetPage(page);
      setShowAuthGateModal(true);
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoogleAuthSuccess = (user: GoogleAuthUser) => {
    setGoogleUser(user);
    setIsLoggedIn(true);
    setShowAuthGateModal(false);
    if (pendingTargetPage) {
      setActivePage(pendingTargetPage);
      setPendingTargetPage(null);
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogoutGoogle = async () => {
    localStorage.removeItem('spaceflow_google_user');
    setGoogleUser(null);
    setIsLoggedIn(false);
    try {
      await firebaseLogout();
    } catch (err) {
      console.error(err);
    }
    setActivePage('home');
  };

  return (
    <LanguageProvider language={language} onLanguageChange={handleLanguageChange}>
      <div className="min-h-screen transition-colors font-sans selection:bg-[#d946ef] selection:text-white flex flex-col justify-between bizos-bg bizos-honeycomb text-[#e2e8f0]">
        
        {/* SPACEFLOW Header Navigation */}
        <SpaceflowHeader
          currentPage={activePage}
          setCurrentPage={handleNavigate}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          googleUser={googleUser}
          onLogoutGoogle={handleLogoutGoogle}
        />

        {/* Auth Gate Modal when accessing protected routes unauthenticated */}
        {showAuthGateModal && (
          <GoogleAuthGateModal
            isDarkMode={isDarkMode}
            onLoginSuccess={handleGoogleAuthSuccess}
            onCancel={() => {
              setShowAuthGateModal(false);
              setPendingTargetPage(null);
            }}
            targetPageLabel={pendingTargetPage || 'Dashboard Manager'}
          />
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {activePage === 'home' && (
            <PublicHomePage isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'dashboard' && (
            <ManagerDashboardView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'members' && (
            <MembersListView isDarkMode={isDarkMode} />
          )}

          {activePage === 'bookings' && (
            <BookingsCalendarView isDarkMode={isDarkMode} />
          )}

          {activePage === 'billing' && (
            <BillingInvoicesView isDarkMode={isDarkMode} />
          )}

          {activePage === 'analytics' && (
            <AnalyticsAiView isDarkMode={isDarkMode} />
          )}

          {activePage === 'mobile_pwa' && (
            <CoworkerMobilePwaView isDarkMode={isDarkMode} />
          )}

          {activePage === 'visitors' && (
            <VisitorsView isDarkMode={isDarkMode} />
          )}

          {activePage === 'settings' && (
            <SettingsView isDarkMode={isDarkMode} />
          )}

          {activePage === 'meet_ai' && (
            <MeetAiView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'inbox_ai' && (
            <InboxAiView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'today' && (
            <TodayDashboardView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'exit_ready' && (
            <ExitReadyView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'call_copilot' && (
            <CallCopilotView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'schema' && (
            <SchemaView isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
          )}

          {activePage === 'pricing' && (
            <PricingPage onNavigate={handleNavigate} language={language} />
          )}

          {activePage === 'architecture' && (
            <ArchitecturePage onNavigate={handleNavigate} language={language} />
          )}

          {activePage === 'support' && (
            <SupportPage onNavigate={handleNavigate} language={language} />
          )}

          {activePage === 'login' && (
            <LoginForm onNavigateToRegister={() => handleNavigate('register')} />
          )}
          {activePage === 'register' && (
            <RegisterForm onNavigateToLogin={() => handleNavigate('login')} />
          )}
          {activePage === 'subscription' && (
            <SubscriptionPlan onNavigate={handleNavigate} />
          )}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} language={language} brand="BizOS" />

      </div>
    </LanguageProvider>
  );
}

export default App;

