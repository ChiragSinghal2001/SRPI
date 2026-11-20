import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export interface UseFetchOptions<T> {
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

/**
 * Custom lightweight useFetch hook (Component-level state, no TanStack/SWR/RTK Query)
 * @param fetcher Async function returning Promise<T>
 * @param deps Dependency array to trigger refetch
 * @param options Configuration options
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { enabled = true, initialData = null, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const executeFetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        onError?.(errorObj);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, onSuccess, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    executeFetch();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeFetch, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: executeFetch,
    setData,
  };
}

export default useFetch;
