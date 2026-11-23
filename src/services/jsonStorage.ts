import usersFallback from '../data/users.json';
import propertiesFallback from '../data/properties.json';
import rentalAppsFallback from '../data/rental_applications.json';
import inspectionsFallback from '../data/inspections.json';
import disputesFallback from '../data/disputes.json';
import maintenanceFallback from '../data/maintenance.json';

// Mapping of bundled JSON files as initial / static fallbacks
const staticFallbacks: Record<string, unknown> = {
  users: usersFallback,
  properties: propertiesFallback,
  rental_applications: rentalAppsFallback,
  inspections: inspectionsFallback,
  disputes: disputesFallback,
  maintenance: maintenanceFallback,
};

/**
 * Synchronously load data from cache or bundled JSON (prevents initial UI blink)
 */
export function syncLoadJsonData<T>(collection: string): T {
  try {
    const localRaw = localStorage.getItem(`srpi_${collection}`);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T;
      }
    }
  } catch {
    // Ignore parse error
  }
  return (staticFallbacks[collection] || []) as T;
}

/**
 * Asynchronously fetch latest data from the local JSON file on disk via dev server endpoint.
 * Falls back to bundled JSON file and localStorage cache.
 */
export async function loadJsonData<T>(collection: string): Promise<T> {
  const fallback = staticFallbacks[collection] || [];

  try {
    const res = await fetch(`/api/storage/${collection}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Cache to localStorage for offline / quick reload availability
        try {
          localStorage.setItem(`srpi_${collection}`, JSON.stringify(data));
        } catch {
          // Ignore
        }
        return data as T;
      }
    }
  } catch {
    // Dev server API not available in build/preview mode; use fallback
  }

  // Fallback to localStorage or bundled JSON
  return syncLoadJsonData<T>(collection) || (fallback as T);
}

/**
 * Persist collection directly to disk as a formatted .json file (and mirror to cache).
 */
export async function saveJsonData<T>(collection: string, data: T): Promise<void> {
  // Mirror to localStorage
  try {
    localStorage.setItem(`srpi_${collection}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }

  // Save directly to the .json file on disk via the Vite dev server endpoint
  try {
    await fetch(`/api/storage/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn(`[JSON Storage] Could not write to /api/storage/${collection}:`, err);
  }
}

