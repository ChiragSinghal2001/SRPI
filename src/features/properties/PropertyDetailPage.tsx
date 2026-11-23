import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Camera,
  FileCheck2,
  ChevronLeft,
  Layers,
  History,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { propertyService } from '../../services/propertyService';
import { inspectionService } from '../../services/inspectionService';
import { useAppDispatch } from '../../hooks/useRedux';
import { setSelectedProperty, setStep } from '../../store/slices/inspectionWizardSlice';
import Timeline, { TimelineEvent } from '../../components/common/Timeline';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const PropertyDetailPage: React.FC = () => {
  const { id = 'prop_1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: property, loading: propLoading } = useFetch(
    () => propertyService.getPropertyById(id),
    [id]
  );

  const { data: inspections, loading: inspLoading } = useFetch(
    () => inspectionService.getInspections({ propertyId: id }),
    [id]
  );

  const handleStartInspectionForProperty = () => {
    dispatch(setSelectedProperty(id));
    dispatch(setStep(1));
    navigate('/inspections/new');
  };

  if (propLoading || !property) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  // Construct inspection history events for timeline
  const timelineEvents: TimelineEvent[] = (inspections || []).map((insp) => ({
    id: insp.id,
    title: `${insp.type === 'move_out' ? 'Move-Out Inspection (AI Review)' : 'Move-In Baseline'} — ${insp.status.toUpperCase()}`,
    description: `Conducted by ${insp.inspectorName}. ${insp.findings.length > 0 ? `${insp.findings.length} findings reviewed.` : 'Baseline photos verified.'
      }`,
    timestamp: insp.scheduledDate,
    icon: insp.status === 'finalized' ? CheckCircle2 : FileCheck2,
    badge: insp.status,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/properties')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ChevronLeft size={16} /> Back to Properties
      </button>

      {/* Property Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 shrink-0">
          <img
            src={property.imageUrl}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Unit {property.unit || 'A'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {property.status}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {property.name}
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={14} className="shrink-0" />
              {property.address}, {property.city}, {property.state} {property.zip}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartInspectionForProperty}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Camera size={15} /> Start Inspection For This Unit
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Tenant Lease Info + Room Definitions + Inspection History Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Tenant & Rooms */}
        <div className="md:col-span-5 space-y-6">
          {/* Tenant Information Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              Current Tenant & Lease
            </h2>

            {property.currentTenant ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {property.currentTenant.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail size={14} className="text-slate-400" />
                  <span>{property.currentTenant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone size={14} className="text-slate-400" />
                  <span>{property.currentTenant.phone}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block font-medium">Monthly Rent</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ${property.currentTenant.monthlyRent}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Security Deposit</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ${property.currentTenant.depositAmount}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 block font-medium">Lease Term</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} />
                    {property.currentTenant.leaseStartDate} &rarr;{' '}
                    {property.currentTenant.leaseEndDate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs py-1">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                  <span className="font-bold block">Status: Vacant / Available for Rent</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">
                    Tenants can view this listing and submit lease requests from the Tenant Portal.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block font-medium">Monthly Rent</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      ${property.monthlyRent || 0}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Deposit Required</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      ${property.securityDeposit || 0}
                    </span>
                  </div>
                </div>

                {property.availableDate && (
                  <div>
                    <span className="text-slate-400 block font-medium">Available From</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {property.availableDate}
                    </span>
                  </div>
                )}

                {property.description && (
                  <div>
                    <span className="text-slate-400 block font-medium">Description</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rooms Configured */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-emerald-600" />
              Inspection Rooms ({property.rooms.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {property.rooms.map((room) => (
                <span
                  key={room}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {room}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Historical Inspection Timeline */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History size={16} className="text-emerald-600" />
              Inspection History & Certificates
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {timelineEvents.length} Recorded
            </span>
          </div>

          {timelineEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No previous inspection records for this property.
            </p>
          ) : (
            <Timeline events={timelineEvents} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
