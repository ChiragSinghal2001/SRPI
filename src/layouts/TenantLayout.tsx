import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileCheck2,
  AlertOctagon,
  Wrench,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  UserCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useFetch } from '../hooks/useFetch';
import { propertyService } from '../services/propertyService';
import { inspectionService } from '../services/inspectionService';
import { disputeService } from '../services/disputeService';
import { toggleTheme } from '../store/slices/uiSlice';
import { switchDemoRole, logout } from '../store/slices/authSlice';
import { cn } from '../utils/cn';

export const TenantLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, role } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);

  const { data: properties } = useFetch(() => propertyService.getProperties(), []);
  const activeLeasedProperty = properties?.find(
    (p) =>
      p.currentTenant &&
      (p.currentTenant.id === user?.id ||
        (user?.email && p.currentTenant.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.id === 'usr_tenant_1' && p.currentTenant.id === 'usr_tenant_1'))
  );

  const { data: inspections } = useFetch(
    () =>
      activeLeasedProperty
        ? inspectionService.getInspections({ propertyId: activeLeasedProperty.id })
        : Promise.resolve([]),
    [activeLeasedProperty?.id]
  );

  const { data: disputes } = useFetch(
    () =>
      user?.id
        ? disputeService.getDisputes({ tenantId: user.id })
        : Promise.resolve([]),
    [user?.id]
  );

  const activeInspectionId = inspections?.[0]?.id;
  const openDisputesCount = disputes?.filter((d) => d.status === 'open').length || 0;

  const navItems = [
    { label: 'My Property', to: '/tenant', icon: Home },
    {
      label: 'Inspection Reports',
      to: activeInspectionId ? `/tenant/reports/${activeInspectionId}` : '/tenant',
      icon: FileCheck2,
    },
    {
      label: 'Disputes & Claims',
      to: '/tenant/disputes',
      icon: AlertOctagon,
      badge: openDisputesCount > 0 ? String(openDisputesCount) : undefined,
    },
    { label: 'Maintenance Status', to: '/tenant/maintenance', icon: Wrench },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (item.label === 'My Property') return location.pathname === '/tenant';
    if (item.label === 'Inspection Reports') return location.pathname.startsWith('/tenant/reports');
    return location.pathname.startsWith(item.to);
  };

  const handleRoleSwitch = () => {
    dispatch(switchDemoRole('LANDLORD'));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ======================================================== */}
      {/* DESKTOP FULL-HEIGHT SIDEBAR (Matches Landlord portal) */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-30 select-none">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/tenant" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
            <AppLogo size="md" />
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

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              RESIDENT WORKSPACE
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.2 shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Current Leased Unit & Latest Inspection Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                Active Unit Report
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Verified
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight">
              Pinecrest Unit 4B: Move-out inspection report available for review.
            </p>
            <NavLink
              to="/tenant/reports/insp_101"
              className="mt-1 inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:underline"
            >
              View Condition Report <ChevronRight size={13} />
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer: Role Switcher, Profile, Theme Toggle */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Demo Role Switcher Button */}
          <button
            type="button"
            onClick={handleRoleSwitch}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors shadow-2xs"
            title="Click to switch into Landlord view"
          >
            <UserCheck size={14} />
            <span>Role: {role} (Switch to Landlord)</span>
          </button>

          {/* User Profile Pill & Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'SM'}
                </div>
              )}
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">
                  {user?.name || 'Resident'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.assignedPropertyId ? 'Verified Resident' : 'Prospective Resident'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => dispatch(toggleTheme())}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE TOP BAR (Only visible on screens < md) */}
      {/* ======================================================== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <NavLink to="/tenant" className="flex items-center gap-2 font-bold text-base">
          <AppLogo size="sm" />
          <span className="text-slate-900 dark:text-white font-extrabold text-sm">
            Smart<span className="text-emerald-600 dark:text-emerald-400">Inspector</span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Tenant Navigation
                </span>
              </div>
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
              className="w-full text-center mb-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
            >
              Switch to Landlord Role
            </button>

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
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

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN CONTENT VIEWPORT (Takes up the rest of the screen) */}
      {/* ======================================================== */}
      <div className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TenantLayout;
