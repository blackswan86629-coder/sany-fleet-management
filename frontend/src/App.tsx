import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import VehiclesPage from './pages/VehiclesPage';
import AlertsPage from './pages/AlertsPage';
import FuelPage from './pages/FuelPage';
import VideoPage from './pages/VideoPage';
import ReportsPage from './pages/ReportsPage';
import DevicesPage from './pages/DevicesPage';
import SettingsPage from './pages/SettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/fuel" element={<FuelPage />} />
                <Route path="/video" element={<VideoPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
