import { FlowOptions } from "../flow";

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export function getStorage(
  persistStorage?: "local" | "session",
): Storage | null {
  try {
    if (typeof window !== "undefined") {
      return persistStorage === "session"
        ? window.sessionStorage
        : window.localStorage;
    }
  } catch {
    // Ignore errors in environments without storage
  }
  return null;
}

export function restoreData<TData>(
  key: string,
  storage: Storage | null,
): TData | null {
  if (!storage || !key) return null;
  try {
    const stored = storage.getItem(key);
    return stored ? (JSON.parse(stored) as TData) : null;
  } catch (e) {
    console.warn("Flow: Failed to restore persisted data", e);
    return null;
  }
}

export function persistData<TData>(
  key: string,
  data: TData,
  storage: Storage | null,
): void {
  if (!storage || !key) return;
  try {
    storage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Flow: Failed to persist data", e);
  }
}

export function clearData(key: string, storage: Storage | null): void {
  if (!storage || !key) return;
  try {
    storage.removeItem(key);
  } catch (e) {
    console.warn("Flow: Failed to clear persisted data", e);
  }
}
