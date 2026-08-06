import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Truck,
  Users,
  Fuel,
  Wrench,
  FileSpreadsheet,
  History,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Menu,
  X,
  ArrowLeftRight,
  MapPin,
  Building2,
  Settings,
} from 'lucide-react';
import { User, Location } from '../types';
import api from '../services/api';

interface LayoutProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  selectedLocationId?: string;
  onLocationChange?: (locationId: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  selectedLocationId = '',
  onLocationChange,
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (user.role === 'SUPER_ADMIN') {
      api.get('/locations?active_only=true')
        .then((res) => setLocations(res.data.data))
        .catch((err) => console.error('Failed to load locations', err));
    }
  }, [user]);

  // Construct Role-Aware Navigation Items per User Directives
  let navItems: { id: string; label: string; icon: any }[] = [];

  if (user.role === 'APPROVER') {
    navItems = [
      { id: 'approvals', label: 'Approvals', icon: CheckSquare },
      { id: 'vehicles', label: 'Fleet Vehicles (View Only)', icon: Truck },
      { id: 'drivers', label: 'Drivers (View Only)', icon: Users },
    ];
  } else if (user.role === 'VEHICLE_ADMIN') {
    navItems = [
      { id: 'vehicles', label: 'Fleet Vehicles', icon: Truck },
      { id: 'drivers', label: 'Drivers', icon: Users },
      { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
      { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    ];
  } else {
    // SUPER_ADMIN (All Menus)
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
      { id: 'approvals', label: 'Approvals', icon: CheckSquare },
      { id: 'vehicles', label: 'Fleet Vehicles', icon: Truck },
      { id: 'drivers', label: 'Drivers', icon: Users },
      { id: 'vehicle-transfers', label: 'Vehicle Transfers', icon: ArrowLeftRight },
      { id: 'driver-transfers', label: 'Driver Transfers', icon: ArrowLeftRight },
      { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
      { id: 'locations', label: 'Location Management', icon: Building2 },
      { id: 'settings', label: 'System Settings', icon: Settings },
      { id: 'audit-logs', label: 'Audit Logs', icon: History },
    ];
  }

  // Ensure activeTab is valid for the current role
  useEffect(() => {
    if (navItems.length > 0 && !navItems.some((item) => item.id === activeTab)) {
      setActiveTab(navItems[0].id);
    }
  }, [user.role]);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF8] text-[#18181B] relative overflow-x-hidden">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-[#E6E6E2] flex flex-col justify-between p-6 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo & Mobile Close Button */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#146C43] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                M
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#18181B]">MineFleet</h1>
                <p className="text-xs text-[#6B7280]">Mining Fleet Operations</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-[#6B7280] hover:text-[#18181B] rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F5F5F3] text-[#146C43] font-semibold'
                      : 'text-[#6B7280] hover:bg-[#F5F5F3] hover:text-[#18181B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#146C43]' : 'text-[#6B7280]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-[#ECECE8] pt-4 mt-6">
          <div className="flex items-center justify-between px-2 gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 shrink-0 rounded-full bg-[#F5F5F3] border border-[#E6E6E2] flex items-center justify-center text-[#146C43]">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#18181B] truncate" title={user.name}>
                  {user.name}
                </div>
                <div className="text-xs text-[#6B7280] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#146C43] shrink-0" />
                  <span className="truncate">{user.role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 text-[#6B7280] hover:text-[#DC2626] hover:bg-[#F5F5F3] rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="h-[72px] bg-white border-b border-[#E6E6E2] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-[#6B7280] hover:text-[#18181B] hover:bg-[#F5F5F3] rounded-lg md:hidden transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#6B7280]">Portal</span>
              <h2 className="text-xl font-bold text-[#18181B] capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
          </div>

          {/* Global Location Selector / Badge */}
          <div className="flex items-center gap-3">
            {user.role === 'SUPER_ADMIN' ? (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#146C43]" />
                <select
                  value={selectedLocationId}
                  onChange={(e) => onLocationChange && onLocationChange(e.target.value)}
                  className="text-xs font-medium bg-[#FAFAF8] text-[#18181B] border border-[#E6E6E2] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                >
                  <option value="">All Mine Sites (Global View)</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-[#146C43] border border-emerald-200 rounded-full flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#146C43]" />
                {user.location?.name || 'Assigned Location'}
              </span>
            )}
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
};
