import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Camera,
  Layers,
  ClipboardCheck,
  Send,
  Building,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  setStep,
  nextStep,
  prevStep,
  setSelectedProperty,
  setInspectionType,
  setActiveRoom,
  saveCapturedImage,
  removeCapturedImage,
  resetWizard,
} from '../../store/slices/inspectionWizardSlice';
import { addToast } from '../../store/slices/uiSlice';
import { propertyService } from '../../services/propertyService';
import { useFetch } from '../../hooks/useFetch';
import { ObjectType, CapturedImageItem } from '../../types/inspection';
import ImageUploadTile from '../../components/common/ImageUploadTile';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { cn } from '../../utils/cn';

const STANDARD_OBJECTS: { key: ObjectType; label: string }[] = [
  { key: 'wall', label: 'Wall' },
  { key: 'door', label: 'Door' },
  { key: 'window', label: 'Window' },
  { key: 'floor', label: 'Floor' },
];

export const InspectionWizardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { data: propertiesList } = useFetch(
    () => propertyService.getProperties({ landlordId: user?.id }),
    [user?.id]
  );

  const {
    currentStep,
    selectedPropertyId,
    inspectionType,
    activeRoom,
    capturedImages,
    uploadProgress,
    lastAutosaved,
  } = useAppSelector((state) => state.inspectionWizard);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const properties = propertiesList && propertiesList.length > 0 ? propertiesList : [];
  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) ||
    properties[0] || {
      id: 'prop_1',
      name: 'Pinecrest Apartments - Unit 4B',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zip: '97477',
      rooms: ['Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom'],
      status: 'vacant' as const,
      createdAt: '',
      updatedAt: '',
    };
  const rooms = selectedProperty.rooms || ['Living Room', 'Master Bedroom', 'Kitchen', 'Bathroom'];

  // Calculate completion counts
  const totalExpectedPhotos = rooms.length * STANDARD_OBJECTS.length;
  const capturedPhotosCount = Object.keys(capturedImages).length;
  const completionPercentage = Math.round((capturedPhotosCount / totalExpectedPhotos) * 100);

  const handlePropertyChange = (propertyId: string) => {
    dispatch(setSelectedProperty(propertyId));
    const prop = properties.find((p) => p.id === propertyId);
    if (prop && prop.rooms.length > 0) {
      dispatch(setActiveRoom(prop.rooms[0]));
    }
  };

  const handleCaptureImage = (item: CapturedImageItem) => {
    dispatch(saveCapturedImage(item));
    dispatch(
      addToast({
        type: 'success',
        title: 'Photo Saved',
        message: `${item.objectType.toUpperCase()} in ${item.roomName} captured & compressed.`,
        duration: 2500,
      })
    );
  };

  const handleRemoveImage = (roomName: string, objectType: ObjectType) => {
    dispatch(removeCapturedImage({ roomName, objectType }));
  };

  const handleResetConfirm = () => {
    dispatch(resetWizard());
    setShowResetDialog(false);
    dispatch(
      addToast({
        type: 'info',
        title: 'Inspection Reset',
        message: 'All staged photos have been cleared.',
      })
    );
  };

  const handleSubmitInspection = async () => {
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 900));

    dispatch(
      addToast({
        type: 'success',
        title: 'Inspection Staged Successfully',
        message:
          inspectionType === 'move_out'
            ? 'Triggering AI damage comparison model...'
            : 'Move-in baseline certificate recorded.',
      })
    );

    setIsSubmitting(false);

    if (inspectionType === 'move_out') {
      navigate('/inspections/insp_101/review');
    } else {
      navigate('/reports/insp_102');
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Property & Type', icon: Building },
    { num: 2, label: 'Room Capture', icon: Camera },
    { num: 3, label: 'Checklist Review', icon: ClipboardCheck },
    { num: 4, label: 'Submit & AI', icon: Send },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Banner & Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Inspection Capture Wizard
            </span>
            {lastAutosaved && (
              <span className="text-[11px] text-slate-400 font-mono">
                Autosaved: {new Date(lastAutosaved).toLocaleTimeString()}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {selectedProperty.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Documenting {rooms.length} rooms ({capturedPhotosCount}/{totalExpectedPhotos} photos captured)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetDialog(true)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 transition-colors"
        >
          <RotateCcw size={14} /> Clear Draft
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stepsHeader.map((step) => {
          const StepIcon = step.icon;
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => dispatch(setStep(step.num))}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                isCurrent
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs font-semibold'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0',
                  isCurrent
                    ? 'bg-emerald-600 text-white font-bold'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {isDone ? <Check size={16} /> : <StepIcon size={16} />}
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Step {step.num}
                </span>
                <span className="block text-xs font-medium truncate">{step.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: PROPERTY & TYPE */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Select Inspection Parameters
          </h2>

          {/* Inspection Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Inspection Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => dispatch(setInspectionType('move_in'))}
                className={cn(
                  'p-4 rounded-xl border-2 text-left flex flex-col gap-1 transition-all',
                  inspectionType === 'move_in'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Move-in Inspection</span>
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2',
                      inspectionType === 'move_in'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    )}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Establishes baseline condition before tenant takes occupancy.
                </p>
              </button>

              <button
                type="button"
                onClick={() => dispatch(setInspectionType('move_out'))}
                className={cn(
                  'p-4 rounded-xl border-2 text-left flex flex-col gap-1 transition-all',
                  inspectionType === 'move_out'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Move-out Inspection (AI Comparison)</span>
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2',
                      inspectionType === 'move_out'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    )}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compares checkout photos against baseline with automated AI damage detection.
                </p>
              </button>
            </div>
          </div>

          {/* Property Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Rental Property
            </label>
            <select
              value={selectedPropertyId || ''}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
            >
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name} — {prop.address}, {prop.city}
                </option>
              ))}
            </select>
          </div>

          {/* Property Context Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Tenant</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {selectedProperty.currentTenant?.name || 'Vacant Unit'}
              </span>
              <span className="text-slate-400 block">{selectedProperty.currentTenant?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Lease Period</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Calendar size={13} />
                {selectedProperty.currentTenant?.leaseStartDate} to{' '}
                {selectedProperty.currentTenant?.leaseEndDate}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Configured Rooms</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedProperty.rooms.join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ROOM-BY-ROOM CAPTURE */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Room Selector Tab Bar (Thumb-friendly horizontal scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {rooms.map((room) => {
              const roomKeys = STANDARD_OBJECTS.map((obj) => `${room}::${obj.key}`);
              const capturedInRoom = roomKeys.filter((k) => capturedImages[k]).length;
              const isRoomComplete = capturedInRoom === STANDARD_OBJECTS.length;
              const isActive = activeRoom === room;

              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => dispatch(setActiveRoom(room))}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all shadow-2xs',
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : isRoomComplete
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  )}
                >
                  <span>{room}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
                    )}
                  >
                    {capturedInRoom}/4
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Room Tiles Container */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={20} className="text-emerald-600" />
                  {activeRoom}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Capture all 4 core surfaces (Wall, Door, Window, Floor)
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {STANDARD_OBJECTS.filter((obj) => capturedImages[`${activeRoom}::${obj.key}`]).length}/4 Done
              </span>
            </div>

            {/* Grid of 4 Upload Tiles: Wall, Door, Window, Floor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STANDARD_OBJECTS.map((obj) => {
                const key = `${activeRoom}::${obj.key}`;
                const capturedItem = capturedImages[key];
                const progress = uploadProgress[key];

                return (
                  <ImageUploadTile
                    key={obj.key}
                    roomName={activeRoom}
                    objectType={obj.key}
                    label={obj.label}
                    capturedItem={capturedItem}
                    uploadProgress={progress}
                    onImageCaptured={handleCaptureImage}
                    onImageRemoved={() => handleRemoveImage(activeRoom, obj.key)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW ALL IMAGES & COMPLETION CHECKLIST */}
      {currentStep === 3 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Inspection Completeness Checklist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify each surface before generating comparison models
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">{completionPercentage}%</span>
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Complete
              </span>
            </div>
          </div>

          {/* Checklist Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4 text-center">Wall</th>
                  <th className="py-3 px-4 text-center">Door</th>
                  <th className="py-3 px-4 text-center">Window</th>
                  <th className="py-3 px-4 text-center">Floor</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rooms.map((room) => {
                  const wallKey = `${room}::wall`;
                  const doorKey = `${room}::door`;
                  const windowKey = `${room}::window`;
                  const floorKey = `${room}::floor`;

                  const isRoomDone =
                    capturedImages[wallKey] &&
                    capturedImages[doorKey] &&
                    capturedImages[windowKey] &&
                    capturedImages[floorKey];

                  return (
                    <tr key={room} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {room}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {capturedImages[wallKey] ? (
                          <span className="inline-block text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="inline-block text-red-500 font-bold">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {capturedImages[doorKey] ? (
                          <span className="inline-block text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="inline-block text-red-500 font-bold">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {capturedImages[windowKey] ? (
                          <span className="inline-block text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="inline-block text-red-500 font-bold">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {capturedImages[floorKey] ? (
                          <span className="inline-block text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="inline-block text-red-500 font-bold">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isRoomDone ? (
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                            Ready
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200">
                            Missing Items
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {capturedPhotosCount < totalExpectedPhotos && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing Photos Detected:</span> You have captured{' '}
                {capturedPhotosCount} of {totalExpectedPhotos} photos. You can still submit for demonstration,
                or go back to Step 2 to finish documenting all rooms.
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: SUBMIT & TRIGGER AI */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
            <Sparkles size={32} />
          </div>

          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Ready to Finalize & Trigger AI Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Submitting will compile all captured photos for {selectedProperty.name}. For move-out
              inspections, our vision AI model will match checkout photos with move-in baseline photos
              to flag damage, calculate confidence scores, and estimate repair costs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-w-sm mx-auto text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Property:</span>
              <span className="font-semibold">{selectedProperty.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inspection Type:</span>
              <span className="font-semibold uppercase">{inspectionType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Captured Photos:</span>
              <span className="font-semibold text-emerald-600">
                {capturedPhotosCount} Images Staged
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitInspection}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Triggering AI Engine...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Submit & Run AI Damage Comparison</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (Thumb friendly for mobile on-site capture) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Step {currentStep} of 4
        </span>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => dispatch(nextStep())}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors"
          >
            Next Step <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitInspection}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md"
          >
            Submit <Check size={16} />
          </button>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset Inspection Draft?"
        message="This will clear all staged images and reset progress. This action cannot be reversed."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};

export default InspectionWizardPage;
