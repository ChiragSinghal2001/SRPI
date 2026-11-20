import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  Home,
  FileCheck2,
  AlertOctagon,
  Wrench,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleTheme } from '../store/slices/uiSlice';
import { switchDemoRole, logout } from '../store/slices/authSlice';
import { cn } from '../utils/cn';

export const TenantLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, role } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);

  const navItems = [
    { label: 'My Property', to: '/tenant', icon: Home },
    { label: 'Inspection Reports', to: '/tenant/reports/insp_101', icon: FileCheck2 },
    { label: 'Disputes & Claims', to: '/tenant/disputes', icon: AlertOctagon },
    { label: 'Maintenance Status', to: '/tenant/maintenance', icon: Wrench },
  ];

  const handleRoleSwitch = () => {
    dispatch(switchDemoRole('LANDLORD'));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <NavLink to="/tenant" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Building2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-slate-900 dark:text-white font-extrabold text-base">
                Smart<span className="text-emerald-600 dark:text-emerald-400">Inspector</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                Tenant Portal
              </span>
            </div>
          </NavLink>
        </div>

        {/* Tenant Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/tenant'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                )
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleRoleSwitch}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 transition-colors shadow-2xs"
            title="Switch back to Landlord view"
          >
            <UserCheck size={14} />
            <span>Role: {role} (Switch to Landlord)</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle light/dark theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-900 dark:text-slate-100">
              {user?.name || 'Sarah Miller'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-sm">Tenant Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleRoleSwitch();
              }}
              className="w-full text-left mb-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold"
            >
              Switch to Landlord Role
            </button>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Tenant Viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default TenantLayout;
