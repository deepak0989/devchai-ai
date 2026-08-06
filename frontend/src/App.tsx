import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import GoogleCallback from './pages/GoogleCallback';
import MaintenanceScreen from './components/MaintenanceScreen';
import { api } from './api/client';
import { useAppSettings } from './lib/settings';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function MaintenanceGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState<{
    enabled: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    api
      .getPublicSettings()
      .then((settings) => setMaintenance(settings.maintenance))
      .catch(() => setMaintenance({ enabled: false, message: '' }));
  }, []);

  if (maintenance && maintenance.enabled && user?.role !== 'admin') {
    return <MaintenanceScreen message={maintenance.message} />;
  }

  return <>{children}</>;
}

export default function App() {
  const { branding } = useAppSettings();

  useEffect(() => {
    document.title = branding.appName;

    let icon: string;
    if (branding.logoUrl) {
      icon = branding.logoUrl;
    } else {
      const char = (branding.logo || 'M').slice(0, 1);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#10a37f"/><text x="32" y="42" font-size="34" font-weight="800" text-anchor="middle" fill="#ffffff" font-family="Arial">${char}</text></svg>`;
      icon = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    }

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = icon;
  }, [branding.appName, branding.logo, branding.logoUrl]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MaintenanceGate>
                  <ChatPage />
                </MaintenanceGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
