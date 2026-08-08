'use client';

import { useEffect, useState } from 'react';
import Background from './Background.jsx';
import LoginScreen from './LoginScreen.jsx';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import ScreenHeader from './ScreenHeader.jsx';
import Dashboard from './screens/Dashboard.jsx';
import NightAudit from './screens/NightAudit.jsx';
import FraudDetection from './screens/FraudDetection.jsx';
import RevenueLeakage from './screens/RevenueLeakage.jsx';
import AlertsCenter from './screens/AlertsCenter.jsx';
import Transactions from './screens/Transactions.jsx';
import Employees from './screens/Employees.jsx';
import Reports from './screens/Reports.jsx';
import Settings from './screens/Settings.jsx';
import { LanguageProvider, useLanguage } from '../lib/i18n/LanguageContext.jsx';

const SCREENS = {
  dashboard: Dashboard,
  audit: NightAudit,
  fraud: FraudDetection,
  leakage: RevenueLeakage,
  alerts: AlertsCenter,
  transactions: Transactions,
  employees: Employees,
  reports: Reports,
  settings: Settings,
};

export default function AuraApp() {
  return (
    <LanguageProvider>
      <AuraAppInner />
    </LanguageProvider>
  );
}

function AuraAppInner() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [screen, setScreen] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => setUser(json.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/properties')
      .then((res) => res.json())
      .then((json) => setProperties(json.rows ?? []))
      .catch(() => setProperties([]));
  }, [user]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setScreen('dashboard');
    setProperties([]);
    setActivePropertyId(null);
  }

  const title = t(`titles.${screen}.title`);
  const sub = t(`titles.${screen}.sub`);
  const Screen = SCREENS[screen] || Dashboard;

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#f2f4fc 0%,#eef1fa 30%,#eaf2f5 62%,#eef8f2 100%)' }}
    >
      <Background />

      {!checkingSession && !user && <LoginScreen onLoginSuccess={setUser} />}

      {user && (
        <div className="relative flex h-screen gap-4 p-4 max-[860px]:gap-2.5 max-[860px]:p-2.5">
          <Sidebar
            screen={screen}
            setScreen={setScreen}
            collapsed={collapsed}
            toggleCollapsed={() => setCollapsed((c) => !c)}
            mobileOpen={mobileNavOpen}
            closeMobile={() => setMobileNavOpen(false)}
          />

          <main className="flex min-w-0 flex-1 flex-col gap-4">
            <Header
              user={user}
              onLogout={handleLogout}
              onMenuClick={() => setMobileNavOpen((o) => !o)}
              properties={properties}
              activePropertyId={activePropertyId}
              onPropertyChange={setActivePropertyId}
              onNavigate={setScreen}
            />

            <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-7.5 pt-0.5">
              <ScreenHeader title={title} sub={sub} />
              <Screen
                goAlerts={() => setScreen('alerts')}
                activePropertyId={activePropertyId}
                properties={properties}
                onPropertyChange={setActivePropertyId}
              />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
