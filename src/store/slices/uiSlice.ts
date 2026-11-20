import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface UIState {
  theme: 'light' | 'dark';
  toasts: ToastItem[];
  activeModal: string | null;
  modalData: Record<string, unknown>;
  sidebarCollapsed: boolean;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('srpi_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
};

const initialState: UIState = {
  theme: getInitialTheme(),
  toasts: [],
  activeModal: null,
  modalData: {},
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('srpi_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('srpi_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    addToast: (state, action: PayloadAction<Omit<ToastItem, 'id'>>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      state.toasts.push({
        ...action.payload,
        id,
        duration: action.payload.duration ?? 4500,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openModal: (
      state,
      action: PayloadAction<{ modal: string; data?: Record<string, unknown> }>
    ) => {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || {};
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = {};
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  addToast,
  removeToast,
  openModal,
  closeModal,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
