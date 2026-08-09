import React, { useState, useEffect } from 'react';
import { PageId, Language, GoogleAuthUser } from './types';
import { SpaceflowHeader } from './components/spaceflow/SpaceflowHeader';
import { PublicHomePage } from './components/spaceflow/PublicHomePage';
import { ManagerDashboardView } from './components/spaceflow/ManagerDashboardView';
import { MembersListView } from './components/spaceflow/MembersListView';
import { BookingsCalendarView } from './components/spaceflow/BookingsCalendarView';
import { BillingInvoicesView } from './components/spaceflow/BillingInvoicesView';
import { CheckoutSuccess } from './components/billing/CheckoutSuccess';
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
import { CafmGmaoDashboard } from './components/spaceflow/CafmGmaoDashboard';
import { WpPluginExtensionView } from './components/spaceflow/WpPluginExtensionView';

import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { UsersManagementPage } from './components/admin/UsersManagementPage';
import { EnvironmentsPage } from './components/admin/EnvironmentsPage';
import { CAFMPage } from './components/admin/CAFMPage';

import { ArchitecturePage } from './components/pages/ArchitecturePage';
import { PricingPage } from './components/pages/PricingPage';
import { SupportPage } from './components/pages/SupportPage';
import { LoginPage } from './components/pages/LoginPage';
import { DemoPage } from './components/pages/DemoPage';
import { VisionPage } from './components/pages/VisionPage';
import { SecurityPage } from './components/pages/SecurityPage';
import { TestimonialsPage } from './components/pages/TestimonialsPage';
import { ChangelogPage } from './components/pages/ChangelogPage';
import { BlogPage } from './components/pages/BlogPage';
import { ContactPage } from './components/pages/ContactPage';
import { WorkspacePage } from './components/pages/WorkspacePage';
import { Footer } from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouteGuard, GuardMode } from './components/auth/RouteGuard';

function AppContent() {
  const { user, profile, logout } = useAuth();
  const [activePage, setActivePage] = useState<PageId>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('bizos_lang');
    return (savedLang as Language) || 'EN';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('bizos_lang', lang);
  };
  
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [pendingTargetPage, setPendingTargetPage] = useState<PageId | null>(null);

  // Fallback map to keep Header happy
  const googleUser = user ? {
    email: user.email || 'demo@bizos.com',
    name: user.displayName || 'Utilisateur',
    avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    provider: 'GOOGLE_OAUTH',
    scopesAuthorized: [],
    googleToken: '',
    authenticatedAt: ''
  } as GoogleAuthUser : null;
  const isLoggedIn = !!user;

  const getGuardMode = (page: PageId): GuardMode => {
    const publicPages = ['home', 'pricing', 'architecture', 'support', 'login', 'vision', 'demo', 'contact', 'blog', 'changelog', 'testimonials'];
    const adminPages = ['admin_super', 'admin_users', 'admin_environments', 'admin_cafm'];
    if (publicPages.includes(page)) return 'public';
    if (adminPages.includes(page)) return 'admin-only';
    return 'subscription-required';
  };

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoogleAuthSuccess = (googleUser: GoogleAuthUser) => {
    // Le AuthContext mettra à jour user/profile automatiquement.
    setShowAuthGateModal(false);
    if (pendingTargetPage) {
      setActivePage(pendingTargetPage);
      setPendingTargetPage(null);
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogoutGoogle = () => {
    logout();
    setActivePage('home');
  };

  return (
    <LanguageProvider language={language} onLanguageChange={handleLanguageChange}>
      <div className="min-h-screen transition-colors font-sans selection:bg-[#d946ef] selection:text-white flex flex-col justify-between bizos-bg bizos-honeycomb text-[#e2e8f0]">
        
        {/* BizOS Header Navigation */}
        <SpaceflowHeader
          currentPage={activePage}
          setCurrentPage={handleNavigate}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={() => {}}
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
          <RouteGuard mode={getGuardMode(activePage)} activePage={activePage} onNavigate={handleNavigate}>
            {activePage === 'home' && (
              <PublicHomePage isDarkMode={isDarkMode} setCurrentPage={handleNavigate} />
            )}

          {activePage === 'dashboard' && (
            <ManagerDashboardView isDarkMode={isDarkMode} onNavigate={handleNavigate} />
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
          {activePage === 'billing_success' && (
            <CheckoutSuccess onNavigate={handleNavigate} />
          )}

          {activePage === 'analytics' && (
            <AnalyticsAiView />
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
            <LoginPage onNavigate={handleNavigate} language={language} brand="BizOS GMAO" />
          )}

          {/* ── CAFM / GMAO ── */}
          {activePage === 'cafm_gmao' && (
            <CafmGmaoDashboard />
          )}

          {/* ── ADMIN SUPER ── */}
          {activePage === 'admin_super' && (
            <SuperAdminDashboard setCurrentPage={handleNavigate} />
          )}
          {activePage === 'admin_users' && (
            <UsersManagementPage />
          )}
          {activePage === 'admin_environments' && (
            <EnvironmentsPage />
          )}
          {activePage === 'admin_cafm' && (
            <CAFMPage />
          )}

          {/* ── WP PLUGIN ── */}
          {activePage === 'wp_plugin' && (
            <WpPluginExtensionView />
          )}

          {/* ── PAGES PUBLIQUES ── */}
          {activePage === 'demo' && (
            <DemoPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'vision' && (
            <VisionPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'security' && (
            <SecurityPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'testimonials' && (
            <TestimonialsPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'changelog' && (
            <ChangelogPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'blog' && (
            <BlogPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'contact' && (
            <ContactPage onNavigate={handleNavigate} language={language} />
          )}
          {activePage === 'workspace' && (
            <WorkspacePage onNavigate={handleNavigate} language={language} />
          )}
          </RouteGuard>
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} language={language} brand="BizOS GMAO" />

      </div>
    </LanguageProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

