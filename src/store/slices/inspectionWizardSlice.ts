import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InspectionType, ObjectType, CapturedImageItem } from '../../types/inspection';

export interface InspectionWizardState {
  currentStep: number;
  selectedPropertyId: string | null;
  inspectionType: InspectionType;
  activeRoom: string;
  // Key format: `${roomName}::${objectType}`
  capturedImages: Record<string, CapturedImageItem>;
  uploadProgress: Record<string, number>;
  notesPerRoom: Record<string, string>;
  lastAutosaved: string | null;
}

const initialState: InspectionWizardState = {
  currentStep: 1,
  selectedPropertyId: 'prop_1',
  inspectionType: 'move_out',
  activeRoom: 'Living Room',
  capturedImages: {},
  uploadProgress: {},
  notesPerRoom: {},
  lastAutosaved: null,
};

export const inspectionWizardSlice = createSlice({
  name: 'inspectionWizard',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setSelectedProperty: (state, action: PayloadAction<string>) => {
      state.selectedPropertyId = action.payload;
      state.lastAutosaved = new Date().toISOString();
    },
    setInspectionType: (state, action: PayloadAction<InspectionType>) => {
      state.inspectionType = action.payload;
      state.lastAutosaved = new Date().toISOString();
    },
    setActiveRoom: (state, action: PayloadAction<string>) => {
      state.activeRoom = action.payload;
    },
    saveCapturedImage: (state, action: PayloadAction<CapturedImageItem>) => {
      const key = `${action.payload.roomName}::${action.payload.objectType}`;
      state.capturedImages[key] = action.payload;
      state.uploadProgress[key] = 100;
      state.lastAutosaved = new Date().toISOString();
    },
    removeCapturedImage: (
      state,
      action: PayloadAction<{ roomName: string; objectType: ObjectType }>
    ) => {
      const key = `${action.payload.roomName}::${action.payload.objectType}`;
      delete state.capturedImages[key];
      delete state.uploadProgress[key];
      state.lastAutosaved = new Date().toISOString();
    },
    setImageUploadProgress: (
      state,
      action: PayloadAction<{ key: string; progress: number }>
    ) => {
      state.uploadProgress[action.payload.key] = action.payload.progress;
    },
    setRoomNotes: (
      state,
      action: PayloadAction<{ roomName: string; notes: string }>
    ) => {
      state.notesPerRoom[action.payload.roomName] = action.payload.notes;
      state.lastAutosaved = new Date().toISOString();
    },
    resetWizard: () => {
      return {
        ...initialState,
        lastAutosaved: new Date().toISOString(),
      };
    },
    loadDraftSession: (state, action: PayloadAction<Partial<InspectionWizardState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  setSelectedProperty,
  setInspectionType,
  setActiveRoom,
  saveCapturedImage,
  removeCapturedImage,
  setImageUploadProgress,
  setRoomNotes,
  resetWizard,
  loadDraftSession,
} = inspectionWizardSlice.actions;

export default inspectionWizardSlice.reducer;
