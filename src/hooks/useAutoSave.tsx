import { useState, useEffect, useCallback } from 'react';
import { designTokens } from '../lib/design-tokens';

interface AutoSaveConfig {
  delay?: number; // Debounce delay in milliseconds
  key: string; // localStorage key
  enabled?: boolean; // Enable/disable autosave
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

/**
 * Simple, bulletproof autosave hook with visual feedback
 *
 * Features:
 * - 2-second debounced saving to localStorage
 * - Visual feedback with save indicator
 * - Automatic data restoration on page load
 * - No complex server syncing - just reliable local storage
 */
export function useAutoSave<T>(data: T, config: AutoSaveConfig) {
  const { delay = 2000, key, enabled = true } = config;

  const [saveState, setSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Save function
  const saveToStorage = useCallback(
    (dataToSave: T) => {
      if (!enabled) return;

      try {
        setSaveState(prev => ({ ...prev, isSaving: true }));

        // Save to localStorage with timestamp
        const savePayload = {
          data: dataToSave,
          timestamp: new Date().toISOString(),
          version: '1.0', // For future compatibility
        };

        localStorage.setItem(key, JSON.stringify(savePayload));

        // Brief saving indicator
        setTimeout(() => {
          setSaveState({
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
          });
        }, 300); // Show saving state for 300ms
      } catch (error) {
        console.warn('AutoSave failed:', error);
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: true,
        }));
      }
    },
    [key, enabled]
  );

  // Load function
  const loadFromStorage = useCallback((): T | null => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Handle both old format (direct data) and new format (with metadata)
      if (parsed.data && parsed.timestamp) {
        setSaveState(prev => ({
          ...prev,
          lastSaved: new Date(parsed.timestamp),
        }));
        return parsed.data;
      } else {
        // Old format - treat as direct data
        return parsed;
      }
    } catch (error) {
      console.warn('AutoSave load failed:', error);
      return null;
    }
  }, [key, enabled]);

  // Manual save function (immediate, no debounce)
  const saveNow = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    saveToStorage(data);
  }, [data, debounceTimer, saveToStorage]);

  // Clear saved data
  const clearSaved = useCallback(() => {
    if (!enabled) return;

    try {
      localStorage.removeItem(key);
      setSaveState({
        isSaving: false,
        lastSaved: null,
        hasUnsavedChanges: false,
      });
    } catch (error) {
      console.warn('AutoSave clear failed:', error);
    }
  }, [key, enabled]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!enabled || !data) return;

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Mark as having unsaved changes
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Set new debounced save timer
    const timer = setTimeout(() => {
      saveToStorage(data);
    }, delay);

    setDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [data, delay, enabled, saveToStorage, debounceTimer]); // Added debounceTimer to deps

  // Save indicator component
  const SaveIndicator = () => {
    if (!enabled) return null;

    return (
      <div
        className={`inline-flex items-center space-x-1 ${designTokens.typography.body.small} ${designTokens.animation.transitions.fast}`}
      >
        {saveState.isSaving ? (
          <>
            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
            <span className='text-blue-600'>Saving...</span>
          </>
        ) : saveState.hasUnsavedChanges ? (
          <>
            <div className='w-2 h-2 bg-amber-500 rounded-full'></div>
            <span className='text-amber-600'>Unsaved changes</span>
          </>
        ) : saveState.lastSaved ? (
          <>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-green-600'>Saved {formatTimeSince(saveState.lastSaved)}</span>
          </>
        ) : (
          <span className='text-slate-400'>Ready</span>
        )}
      </div>
    );
  };

  return {
    ...saveState,
    saveNow,
    clearSaved,
    loadFromStorage,
    SaveIndicator,
  };
}

/**
 * Helper function to format time since last save
 */
function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Higher-order component for easy autosave integration
 */
export function withAutoSave<T>(
  WrappedComponent: React.ComponentType<any>,
  dataSelector: (props: any) => T,
  keyGenerator: (props: any) => string
) {
  return function AutoSaveWrapper(props: any) {
    const data = dataSelector(props);
    const key = keyGenerator(props);

    const autoSave = useAutoSave(data, { key });

    return (
      <>
        <WrappedComponent {...props} autoSave={autoSave} />
        <div className='fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg px-3 py-2 border'>
          <autoSave.SaveIndicator />
        </div>
      </>
    );
  };
}
