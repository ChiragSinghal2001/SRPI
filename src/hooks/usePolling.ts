import { useState, useEffect, useRef, useCallback } from 'react';

export interface PollingStatusResponse {
  status: 'queued' | 'processing' | 'completed' | 'failed' | string;
  progress?: number;
  [key: string]: unknown;
}

export interface UsePollingOptions<T extends PollingStatusResponse> {
  intervalMs?: number; // 3000 to 5000 ms
  enabled?: boolean;
  onCompleted?: (data: T) => void;
  onFailed?: (data: T) => void;
  onError?: (err: Error) => void;
  stopCondition?: (data: T) => boolean;
}

export interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isPolling: boolean;
  stopPolling: () => void;
  startPolling: () => void;
  refetchNow: () => Promise<void>;
}

/**
 * usePolling hook: Polls an async status endpoint with setInterval every 3-5 seconds.
 * Automatically halts when status is 'completed' or 'failed', and cleans up on unmount.
 */
export function usePolling<T extends PollingStatusResponse>(
  pollFn: () => Promise<T>,
  options: UsePollingOptions<T> = {}
): UsePollingResult<T> {
  const {
    intervalMs = 3500, // 3.5s default within 3-5s requirement
    enabled = true,
    onCompleted,
    onFailed,
    onError,
    stopCondition = (data: T) => data.status === 'completed' || data.status === 'failed',
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(enabled);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const pollFnRef = useRef(pollFn);
  pollFnRef.current = pollFn;

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPolling(false);
    }
  }, []);

  const executePoll = useCallback(async () => {
    try {
      const result = await pollFnRef.current();
      if (!isMountedRef.current) return;

      setData(result);
      setError(null);
      setLoading(false);

      if (stopCondition(result)) {
        stopPolling();
        if (result.status === 'completed') {
          onCompleted?.(result);
        } else if (result.status === 'failed') {
          onFailed?.(result);
        }
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
    }
  }, [stopCondition, stopPolling, onCompleted, onFailed, onError]);

  const startPolling = useCallback(() => {
    stopPolling();
    setIsPolling(true);
    setLoading(true);
    executePoll();

    timerRef.current = setInterval(() => {
      executePoll();
    }, intervalMs);
  }, [intervalMs, executePoll, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    isPolling,
    stopPolling,
    startPolling,
    refetchNow: executePoll,
  };
}

export default usePolling;
