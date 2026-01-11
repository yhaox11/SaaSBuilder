import React, { useState, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { MacDock } from './components/MacDock';
import { Dashboard } from './components/Dashboard';
import { AiInsights } from './components/AiInsights';
import { SearchBar } from './components/SearchBar';
import { ChatWidget } from './components/ChatWidget';
import { Prospecting } from './components/Prospecting';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { DashboardMetrics } from './types';
import { fetchDashboardMetrics } from './services/dataService';
import { Loader2 } from 'lucide-react';

// Context for data sharing
type ContextType = {
  metrics: DashboardMetrics | null;
  loadingMetrics: boolean;
  tenantId: string;
};

export const DashboardContext = React.createContext<ContextType>({
  metrics: null,
  loadingMetrics: true,
  tenantId: '',
});

// Layout Component for Protected Routes
const ProtectedLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const loadData = async () => {
        setLoadingMetrics(true);
        try {
          const data = await fetchDashboardMetrics(session.user.id);
          setMetrics(data);
        } catch (error) {
          console.error("Failed to load metrics", error);
        } finally {
          setLoadingMetrics(false);
        }
      };
      loadData();
    }
  }, [session]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const tenantId = session.user.id;
  const safeMetrics = metrics || {
    totalRevenue: 0,
    revenueGrowth: 0,
    averageTicket: 0,
    ticketGrowth: 0,
    newCustomers: 0,
    customerGrowth: 0,
    revenueHistory: []
  };

  return (
    <DashboardContext.Provider value={{ metrics: safeMetrics, loadingMetrics, tenantId }}>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-primary-100 font-sans">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <SearchBar />
        <ChatWidget metrics={safeMetrics} />

        <main className="relative z-10 min-h-screen pt-16">
          <Outlet />
        </main>

        <MacDock />
      </div>
    </DashboardContext.Provider>
  );
};

// Wrapper components to consume context
const DashboardWrapper = () => {
  const { metrics, loadingMetrics } = useContext(DashboardContext);
  return <Dashboard data={metrics!} isLoading={loadingMetrics} />;
};

const InsightsWrapper = () => {
  const { metrics } = useContext(DashboardContext);
  return <AiInsights data={metrics!} />;
};

const BillingWrapper = () => {
  const { tenantId } = useContext(DashboardContext);
  return <Billing tenantId={tenantId} />;
};

const ProspectingWrapper = () => <Prospecting />;
const SettingsWrapper = () => <Settings />;

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/prospecting" element={<ProspectingWrapper />} />
          <Route path="/ai-insights" element={<InsightsWrapper />} />
          <Route path="/billing" element={<BillingWrapper />} />
          <Route path="/settings" element={<SettingsWrapper />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;