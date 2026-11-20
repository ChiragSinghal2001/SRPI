import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  Camera,
  Eye,
  FileCheck2,
  AlertOctagon,
  Wrench,
  History,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleTheme } from '../store/slices/uiSlice';
import { switchDemoRole, logout } from '../store/slices/authSlice';
import { cn } from '../utils/cn';

export const LandlordLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, role } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Properties', to: '/properties', icon: Home },
    { label: 'Tenants', to: '/tenants', icon: Users },
    {
      label: 'New Inspection',
      to: '/inspections/new',
      icon: Camera,
      highlight: true,
    },
    { label: 'AI Review', to: '/inspections/insp_101/review', icon: Eye },
    { label: 'Reports', to: '/reports/insp_101', icon: FileCheck2 },
    { label: 'Disputes', to: '/disputes', icon: AlertOctagon, badge: '1' },
    { label: 'Maintenance', to: '/maintenance', icon: Wrench },
    { label: 'Audit Log', to: '/audit-logs', icon: History },
  ];

  const handleRoleSwitch = () => {
    dispatch(switchDemoRole('TENANT'));
    navigate('/tenant');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-slate-900 dark:text-white font-extrabold text-base">
                Smart<span className="text-blue-600 dark:text-blue-400">Inspector</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                Landlord Portal
              </span>
            </div>
          </NavLink>
        </div>

        {/* Header Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Role Switcher Button */}
          <button
            type="button"
            onClick={handleRoleSwitch}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition-colors shadow-2xs"
            title="Click to switch into Tenant view"
          >
            <UserCheck size={14} />
            <span>Role: {role} (Switch to Tenant)</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle light/dark theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            )}
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || 'Property Manager'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {user?.company || 'Pacific Realty'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-1"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Operations
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60',
                    item.highlight &&
                      !isActive &&
                      'bg-blue-600/5 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.2">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Status Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Active Unit In Triage
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight">
              Pinecrest Unit 4B: Move-out AI review ready for final sign-off.
            </p>
            <NavLink
              to="/inspections/insp_101/review"
              className="mt-2 inline-flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline"
            >
              Resume Review <ChevronRight size={13} />
            </NavLink>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Navigation Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                className="w-full text-left mb-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold"
              >
                Switch to Tenant Role
              </button>

              <nav className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LandlordLayout;
