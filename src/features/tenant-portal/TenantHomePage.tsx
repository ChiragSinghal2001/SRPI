import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FileCheck2,
  Calendar,
  DollarSign,
  AlertOctagon,
  Wrench,
  ChevronRight,
  ShieldCheck,
  User,
  Building,
  Key,
  Clock,
  CheckCircle2,
  X,
  Send,
  MapPin,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import { propertyService } from '../../services/propertyService';
import { inspectionService } from '../../services/inspectionService';
import { disputeService } from '../../services/disputeService';
import { rentalService } from '../../services/rentalService';
import { Property, RentalApplication } from '../../types/property';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const TenantHomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Rental application modal state
  const [selectedPropertyForRent, setSelectedPropertyForRent] = useState<Property | null>(null);
  const [applicantName, setApplicantName] = useState(user?.name || 'Anushka Raj Jain');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || 'Anushka.miller@example.com');
  const [applicantPhone, setApplicantPhone] = useState('+1 (555) 876-5432');
  const [moveInDate, setMoveInDate] = useState('2026-12-15');
  const [leaseDuration, setLeaseDuration] = useState('12');
  const [applicationMessage, setApplicationMessage] = useState(
    'I am interested in leasing this unit. I have a stable income, excellent references, and no pets.'
  );
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const { data: properties, loading: propLoading, refetch: refetchProperties } = useFetch(
    () => propertyService.getProperties(),
    []
  );

  const { data: inspections } = useFetch(
    () => inspectionService.getInspections({ tenantId: user?.id || 'usr_tenant_1' }),
    [user]
  );

  const { data: disputes } = useFetch(
    () => disputeService.getDisputes({ tenantId: user?.id || 'usr_tenant_1' }),
    [user]
  );

  const { data: applications, refetch: refetchApps } = useFetch(
    () => rentalService.getApplicationsForTenant(user?.id || user?.email || 'usr_tenant_1'),
    [user]
  );

  // Active leased property: match current tenant by ID, email, or name
  const activeLeasedProperty = properties?.find(
    (p) =>
      p.currentTenant &&
      (p.currentTenant.id === user?.id ||
        p.currentTenant.email.toLowerCase() === (user?.email || '').toLowerCase() ||
        p.currentTenant.name.toLowerCase() === (user?.name || '').toLowerCase() ||
        (user?.role === 'TENANT' && p.currentTenant.id === 'usr_tenant_1'))
  );
  const currentTenantInfo = activeLeasedProperty?.currentTenant;

  // Available vacant properties to rent
  const availableProperties =
    properties?.filter((p) => p.status === 'vacant' || !p.currentTenant) || [];

  const handleOpenRentModal = (property: Property) => {
    setSelectedPropertyForRent(property);
    setApplicantName(user?.name || 'Anushka Raj Jain');
    setApplicantEmail(user?.email || 'Anushka.miller@example.com');
    setMoveInDate(property.availableDate || '2026-12-15');
  };

  const handleSubmitRentalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyForRent) return;

    setIsSubmittingApp(true);
    try {
      await rentalService.createApplication({
        propertyId: selectedPropertyForRent.id,
        propertyName: selectedPropertyForRent.name,
        propertyUnit: selectedPropertyForRent.unit,
        propertyAddress: selectedPropertyForRent.address,
        propertyCity: selectedPropertyForRent.city,
        monthlyRent: selectedPropertyForRent.monthlyRent || 1600,
        depositAmount: selectedPropertyForRent.securityDeposit || 1800,
        tenantId: user?.id || 'usr_tenant_1',
        tenantName: applicantName,
        tenantEmail: applicantEmail,
        tenantPhone: applicantPhone,
        moveInDate,
        leaseDurationMonths: parseInt(leaseDuration, 10) || 12,
        message: applicationMessage,
      });

      await refetchApps();
      setSelectedPropertyForRent(null);
      dispatch(
        addToast({
          type: 'success',
          title: 'Rental Request Sent',
          message: `Your application to rent ${selectedPropertyForRent.name} has been sent to the landlord.`,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to send rental request',
        })
      );
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleWithdrawApplication = async (appId: string) => {
    try {
      await rentalService.cancelApplication(appId);
      await refetchApps();
      dispatch(
        addToast({
          type: 'info',
          title: 'Application Withdrawn',
          message: 'Your rental application has been removed.',
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to withdraw application',
        })
      );
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Tenant Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome home, {user?.name || currentTenantInfo?.name || 'Resident'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Access your verified condition reports, lease records, rental applications, and dispute resolutions.
          </p>
        </div>

        {activeLeasedProperty && (
          <button
            type="button"
            onClick={() => navigate('/tenant/reports/insp_101')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors"
          >
            View Latest Inspection Report &rarr;
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: YOUR CURRENT LEASE (Only if assigned) */}
      {/* ======================================================== */}
      {propLoading ? (
        <CardSkeleton />
      ) : activeLeasedProperty && currentTenantInfo ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
            <img
              src={activeLeasedProperty.imageUrl}
              alt={activeLeasedProperty.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                Active Lease
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                Your Current Lease
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeLeasedProperty.name} {activeLeasedProperty.unit ? `(Unit ${activeLeasedProperty.unit})` : ''}
              </h2>
              <p className="text-xs text-slate-500">
                {activeLeasedProperty.address}, {activeLeasedProperty.city}, {activeLeasedProperty.state} {activeLeasedProperty.zip}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Monthly Rent</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  ${currentTenantInfo.monthlyRent}/mo
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Security Deposit</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                  ${currentTenantInfo.depositAmount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block font-medium">Lease Term</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentTenantInfo.leaseStartDate} to {currentTenantInfo.leaseEndDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase text-slate-400">Lease Status</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Active Leased Property Assigned
            </h3>
            <p className="text-xs text-slate-500 max-w-lg">
              You do not have an active lease on record. Browse the available properties below and click &quot;Request to Rent&quot; to apply.
            </p>
          </div>
          <a
            href="#available-rentals"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors shrink-0"
          >
            Explore Available Rentals ↓
          </a>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MY RENTAL APPLICATIONS (Status Tracking) */}
      {/* ======================================================== */}
      {applications && applications.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" />
              Your Rental Applications &amp; Inquiries ({applications.length})
            </h2>
            <span className="text-xs text-slate-400">Live Status Tracking</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {app.propertyName} {app.propertyUnit ? `(Unit ${app.propertyUnit})` : ''}
                    </h3>
                    <p className="text-xs text-slate-500">{app.propertyAddress}, {app.propertyCity}</p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    }`}
                  >
                    {app.status === 'approved'
                      ? '✓ Approved & Active'
                      : app.status === 'rejected'
                      ? 'Declined'
                      : 'Pending Landlord Review'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Rent</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ${app.monthlyRent}/mo
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Deposit</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ${app.depositAmount}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Move-in</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {app.moveInDate}
                    </span>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">Landlord review in progress</span>
                    <button
                      type="button"
                      onClick={() => handleWithdrawApplication(app.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                    >
                      Withdraw Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: AVAILABLE PROPERTIES FOR RENT */}
      {/* ======================================================== */}
      <div id="available-rentals" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building size={20} className="text-emerald-600" />
              Available Properties to Rent
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse vacant units and send a direct lease request to the landlord
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {availableProperties.length} Units Available
          </span>
        </div>

        {availableProperties.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs">
            No vacant properties currently listed for rent. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProperties.map((prop) => (
              <div
                key={prop.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white backdrop-blur-md shadow-xs">
                        Available Now
                      </span>
                      {prop.unit && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                          Unit {prop.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {prop.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={13} className="shrink-0" />
                        {prop.address}, {prop.city}, {prop.state} {prop.zip}
                      </p>
                    </div>

                    {/* Price and Deposit Bar */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Monthly Rent</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base font-mono">
                          ${prop.monthlyRent || 1600}
                          <span className="text-[11px] font-normal text-slate-400">/mo</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Security Deposit</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs">
                          ${prop.securityDeposit || 1800}
                        </span>
                      </div>
                    </div>

                    {prop.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {prop.description}
                      </p>
                    )}

                    {/* Rooms pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Layers size={13} className="text-slate-400 shrink-0" />
                      {prop.rooms.slice(0, 3).map((r) => (
                        <span
                          key={r}
                          className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleOpenRentModal(prop)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Key size={15} />
                    Request to Rent Unit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 4: REPORTS & CLAIMS GRID (If has active lease) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inspection Reports List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 size={16} className="text-emerald-600" />
              Inspection Certificates
            </h3>
            <span className="text-xs text-slate-400">
              {inspections?.length || 0} Reports Available
            </span>
          </div>

          <div className="space-y-3">
            {inspections?.map((insp) => (
              <div
                key={insp.id}
                onClick={() => navigate(`/tenant/reports/${insp.id}`)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white capitalize">
                    {insp.type.replace('_', ' ')} Inspection
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Conducted: {insp.scheduledDate} • {insp.findings?.length || 0} Items Documented
                  </p>
                </div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  View Report <ChevronRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Claims Tracking */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon size={16} className="text-amber-600" />
              Your Active Disputes
            </h3>
            <button
              type="button"
              onClick={() => navigate('/tenant/disputes')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              All Disputes
            </button>
          </div>

          <div className="space-y-3">
            {disputes?.map((disp) => (
              <div
                key={disp.id}
                className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold capitalize text-slate-900 dark:text-white">
                    {disp.room} — {disp.object}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                    {disp.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  &ldquo;{disp.tenantComment}&rdquo;
                </p>
                <span className="text-red-600 font-bold block pt-1">
                  Disputed Amount: ${disp.assessedAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RENTAL REQUEST APPLICATION MODAL */}
      {/* ======================================================== */}
      {selectedPropertyForRent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Request to Rent Property
                  </h3>
                  <span className="text-xs text-slate-500">
                    {selectedPropertyForRent.name} {selectedPropertyForRent.unit ? `(Unit ${selectedPropertyForRent.unit})` : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPropertyForRent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Property Summary Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Monthly Rent</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono block">
                  ${selectedPropertyForRent.monthlyRent || 1600}/mo
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Security Deposit</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono block">
                  ${selectedPropertyForRent.securityDeposit || 1800}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitRentalRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Applicant Full Name
                </label>
                <input
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Desired Move-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lease Duration
                  </label>
                  <select
                    value={leaseDuration}
                    onChange={(e) => setLeaseDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (Standard)</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message / Cover Note to Landlord
                </label>
                <textarea
                  rows={2}
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the landlord about your employment, rental history, or special requests..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPropertyForRent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  {isSubmittingApp ? 'Sending Request...' : 'Send Rental Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantHomePage;
