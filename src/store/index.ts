import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import inspectionWizardReducer from './slices/inspectionWizardSlice';
import uiReducer from './slices/uiSlice';

// Persist configurations
const authPersistConfig = {
  key: 'srpi_auth',
  storage,
  whitelist: ['user', 'token', 'role', 'isAuthenticated'],
};

const wizardPersistConfig = {
  key: 'srpi_wizard',
  storage,
  whitelist: [
    'currentStep',
    'selectedPropertyId',
    'inspectionType',
    'activeRoom',
    'capturedImages',
    'notesPerRoom',
    'lastAutosaved',
  ],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  inspectionWizard: persistReducer(wizardPersistConfig, inspectionWizardReducer),
  ui: uiReducer, // ui state doesn't need full persistence except theme which syncs to localStorage
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Image data URLs can be larger strings
        ignoredActionPaths: ['payload.dataUrl', 'payload.signatureDataUrl'],
        ignoredPaths: ['inspectionWizard.capturedImages'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
