import React, { useState, useEffect } from 'react';
import { User } from './types';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { VehicleTransfersPage } from './pages/VehicleTransfersPage';
import { DriverTransfersPage } from './pages/DriverTransfersPage';
import { LocationsPage } from './pages/LocationsPage';
import { FuelPage } from './pages/FuelPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import api from './services/api';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('minefleet_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch (err) {
      console.error('Session expired', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: User, authToken: string) => {
    localStorage.setItem('minefleet_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore errors on logout
    }
    localStorage.removeItem('minefleet_token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#6B7280]">
        Loading MineFleet Application...
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
          />
        );
      case 'reservations':
        return <ReservationsPage currentUser={user} />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'vehicles':
        return <VehiclesPage currentUser={user} />;
      case 'drivers':
        return <DriversPage currentUser={user} />;
      case 'vehicle-transfers':
        return (
          <VehicleTransfersPage
            currentUser={user}
            selectedLocationId={selectedLocationId}
          />
        );
      case 'driver-transfers':
        return (
          <DriverTransfersPage
            currentUser={user}
            selectedLocationId={selectedLocationId}
          />
        );
      case 'locations':
        return <LocationsPage />;
      case 'fuel':
        return <FuelPage currentUser={user} />;
      case 'maintenance':
        return <MaintenancePage currentUser={user} />;
      case 'reports':
        return <ReportsPage />;
      case 'audit-logs':
        return <AuditLogPage />;
      default:
        return (
          <DashboardPage
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
          />
        );
    }
  };

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      selectedLocationId={selectedLocationId}
      onLocationChange={setSelectedLocationId}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
