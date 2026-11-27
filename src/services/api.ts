import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

// Environmental flag for mock vs real backend
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface FastAPIValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastAPIDetailError {
  detail: string | FastAPIValidationErrorItem[];
}

export interface FormattedApiError extends Error {
  status?: number;
  detailMessage: string;
  validationErrors?: Record<string, string>;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper for FastAPI OAuth2 password flow:
 * POST /auth/login with form-urlencoded username and password,
 * returning { access_token, token_type: "bearer" }
 */
export const oauth2PasswordLogin = async (username: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const response = await apiClient.post<{ access_token: string; token_type: string }>(
    '/auth/login',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
};

// Request Interceptor: Attach JWT token from Redux Store
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: FastAPI Error Formatting & 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<FastAPIDetailError>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let detailMessage = 'An unexpected error occurred. Please try again.';
    const validationErrors: Record<string, string> = {};

    if (data?.detail) {
      if (typeof data.detail === 'string') {
        detailMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        // 422 Unprocessable Entity - validation error
        const messages = data.detail.map((item) => {
          const field = item.loc ? item.loc[item.loc.length - 1] : 'field';
          validationErrors[String(field)] = item.msg;
          return `${field}: ${item.msg}`;
        });
        detailMessage = messages.join('; ');
      }
    } else if (error.message) {
      detailMessage = error.message;
    }

    if (status === 401) {
      store.dispatch(logout());
      store.dispatch(
        addToast({
          type: 'error',
          title: 'Session Expired',
          message: 'Please sign in again to continue.',
        })
      );
    } else if (status && status >= 400 && status < 500) {
      store.dispatch(
        addToast({
          type: 'error',
          title: status === 422 ? 'Validation Error' : 'Request Failed',
          message: detailMessage,
        })
      );
    } else if (status && status >= 500) {
      store.dispatch(
        addToast({
          type: 'error',
          title: 'Server Error',
          message: 'Backend server encountered an error. Please try again later.',
        })
      );
    }

    const customError: FormattedApiError = new Error(detailMessage) as FormattedApiError;
    customError.status = status;
    customError.detailMessage = detailMessage;
    customError.validationErrors = validationErrors;

    return Promise.reject(customError);
  }
);

export default apiClient;
