import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import GoogleCallback from './pages/GoogleCallback';
import MaintenanceScreen from './components/MaintenanceScreen';
import { api } from './api/client';

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
