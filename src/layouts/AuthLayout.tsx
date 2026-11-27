import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <div className="flex justify-center mb-4">
          <AppLogo size={64} className="shadow-2xl ring-2 ring-emerald-500/40" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Smart<span className="text-emerald-500">Inspector</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          AI-Powered Property Condition & Damage Verification Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700">
          <Outlet />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Tamper-evident verification with SHA-256 audit trails</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
